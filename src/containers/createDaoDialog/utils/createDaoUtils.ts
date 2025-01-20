import {
  DaoMetadata,
  TokenVotingPluginInstall,
  VotingMode,
  votingSettingsToContract,
} from '@aragon/sdk-client';
import {AddressZero, HashZero} from '@ethersproject/constants';
import {
  DAORegistry__factory,
  PluginSetupProcessor__factory,
} from '@aragon/osx-ethers';
import {defaultAbiCoder, parseUnits} from 'ethers/lib/utils';
import {
  getNamedTypesFromMetadata,
  hexToBytes,
  MetadataAbiInput,
  PluginInstallItem,
} from '@aragon/sdk-client-common';
import {SupportedNetworks as SdkSupportedNetworks} from '@aragon/osx-commons-configs';
import {
  GaslessPluginVotingSettings,
  GaslessVotingClient,
  GaslessVotingPluginInstall,
} from '@vocdoni/gasless-voting';
import {getSupportedNetworkByChainId} from 'utils/constants';
import {getSecondsFromDHM} from 'utils/date';
import {translateToNetworkishName} from 'utils/library';
import {CreateDaoFormData} from 'utils/types';
import {TransactionReceipt, zeroAddress} from 'viem';
import {id} from '@ethersproject/hash';
import {multisigInstallationAbi} from './multisigInstallationAbi';
import {ContractTokenVotingInitParams} from '@aragon/sdk-client/dist/tokenVoting/internal/types';
import {BigNumber} from 'ethers';
import {tokenInstallationAbi} from './tokenInstallationAbi';

class CreateDaoUtils {
  defaultTokenDecimals = 18;

  getDaoAddressesFromReceipt = (receipt?: TransactionReceipt) => {
    const daoFactoryInterface = DAORegistry__factory.createInterface();
    const pspInterface = PluginSetupProcessor__factory.createInterface();

    const pluginLogs = receipt?.logs?.filter(
      event =>
        event.topics[0] ===
        id(pspInterface.getEvent('InstallationApplied').format('sighash'))
    );

    const daoCreationLog = receipt?.logs?.find(
      event =>
        event.topics[0] ===
        id(daoFactoryInterface.getEvent('DAORegistered').format('sighash'))
    );

    if (!daoCreationLog || !pluginLogs) {
      return undefined;
    }

    const parsedLog = daoFactoryInterface.parseLog(daoCreationLog);
    const daoAddress = parsedLog.args['dao'] as string;

    const pluginAddresses = pluginLogs.map(
      log => pspInterface.parseLog(log).args[1] as string
    );

    return {daoAddress, pluginAddresses};
  };

  formValuesToDaoMetadata = (
    values: Omit<CreateDaoFormData, 'daoLogo'>,
    logoCid?: string
  ): DaoMetadata => ({
    name: values.daoName,
    description: values.daoSummary,
    links: values.links.filter(
      ({name, url}) => name != null && name !== '' && url != null && url !== ''
    ),
    avatar: logoCid ? `ipfs://${logoCid}` : undefined,
  });

  buildCreateDaoParams = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>,
    metadataCid?: string
  ) => {
    if (metadataCid == null) {
      return;
    }

    const {membership, votingType, daoEnsName = ''} = formValues;
    const plugins: PluginInstallItem[] = [];

    switch (membership) {
      case 'multisig': {
        const plugin = this.getMultisigPlugin(formValues);
        plugins.push(plugin);
        break;
      }
      case 'token': {
        const plugin =
          votingType === 'gasless'
            ? this.getGasslessPlugin(formValues)
            : this.getTokenVotingPlugin(formValues);
        plugins.push(plugin);
        break;
      }
      default:
        throw new Error(
          `buildCreateDaoParams error: unknown ${membership} membership type`
        );
    }

    return {
      metadataUri: `ipfs://${metadataCid}`,
      ensSubdomain: daoEnsName,
      plugins: [...plugins],
    };
  };

  private getVoteSettings = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>
  ) => {
    const {
      minimumApproval,
      minimumParticipation,
      durationDays,
      durationHours,
      durationMinutes,
      eligibilityType,
      eligibilityTokenAmount,
      voteReplacement,
      earlyExecution,
      isCustomToken,
      tokenDecimals,
    } = formValues;

    const votingMode = voteReplacement
      ? VotingMode.VOTE_REPLACEMENT
      : earlyExecution
      ? VotingMode.EARLY_EXECUTION
      : VotingMode.STANDARD;

    const decimals = !isCustomToken ? tokenDecimals : this.defaultTokenDecimals;

    const params = {
      minDuration: getSecondsFromDHM(
        parseInt(durationDays),
        parseInt(durationHours),
        parseInt(durationMinutes)
      ),
      minParticipation: parseInt(minimumParticipation) / 100,
      supportThreshold: parseInt(minimumApproval) / 100,
      minProposerVotingPower:
        eligibilityType === 'token' && eligibilityTokenAmount !== undefined
          ? parseUnits(eligibilityTokenAmount.toString(), decimals).toBigInt()
          : eligibilityType === 'multisig' || eligibilityType === 'anyone'
          ? BigInt(0)
          : parseUnits('1', decimals).toBigInt(),
      votingMode,
    };

    return params;
  };

  private getTokenVotingPlugin = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>
  ) => {
    const {tokenType, isCustomToken} = formValues;

    const votingSettings = this.getVoteSettings(formValues);

    const useExistingToken =
      (tokenType === 'governance-ERC20' || tokenType === 'ERC-20') &&
      !isCustomToken;

    const params: TokenVotingPluginInstall = {votingSettings: votingSettings};

    if (useExistingToken) {
      params.useToken = this.getErc20PluginParams(formValues);
    } else {
      params.newToken = this.getNewErc20PluginParams(formValues);
    }

    const args = this.tokenVotingInitParamsToContract(params);
    const hexBytes = defaultAbiCoder.encode(
      getNamedTypesFromMetadata(tokenInstallationAbi as MetadataAbiInput[]),
      [...args, {target: zeroAddress, operation: 0}, BigInt(0), HashZero]
    );

    return {
      data: hexToBytes(hexBytes),
      id: '0x6241ad0D3f162028d2e0000f1A878DBc4F5c4aD0',
    };
  };

  private getMultisigPlugin = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>
  ) => {
    const {multisigWallets, multisigMinimumApprovals, eligibilityType} =
      formValues;

    const params = {
      members: multisigWallets.map(wallet => wallet.address),
      votingSettings: {
        minApprovals: multisigMinimumApprovals,
        onlyListed: eligibilityType === 'multisig',
      },
    };

    const hexBytes = defaultAbiCoder.encode(
      getNamedTypesFromMetadata(multisigInstallationAbi as MetadataAbiInput[]),
      [
        params.members,
        [params.votingSettings.onlyListed, params.votingSettings.minApprovals],
        {target: zeroAddress, operation: 0},
        HashZero,
      ]
    );

    return {
      data: hexToBytes(hexBytes),
      id: '0xA0901B5BC6e04F14a9D0d094653E047644586DdE',
    };
  };

  private getGasslessPlugin = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>
  ) => {
    const votingSettings = this.getVoteSettings(formValues);

    const {
      isCustomToken,
      blockchain,
      committee,
      tokenType,
      committeeMinimumApproval,
      executionExpirationHours,
      executionExpirationDays,
      executionExpirationMinutes,
    } = formValues;

    const network = this.networkToSdkNetwork(blockchain.id);

    const vocdoniVotingSettings: GaslessPluginVotingSettings = {
      minTallyDuration: getSecondsFromDHM(
        parseInt(executionExpirationDays),
        parseInt(executionExpirationHours),
        parseInt(executionExpirationMinutes)
      ),
      minTallyApprovals: Number(committeeMinimumApproval),
      minDuration: votingSettings.minDuration,
      minParticipation: votingSettings.minParticipation,
      supportThreshold: votingSettings.supportThreshold,
      minProposerVotingPower: votingSettings.minProposerVotingPower as bigint,
      censusStrategy: '',
    };

    const useExistingToken =
      (tokenType === 'governance-ERC20' || tokenType === 'ERC-20') &&
      !isCustomToken;

    const params: GaslessVotingPluginInstall = {
      multisig: committee.map(wallet => wallet.address),
      votingSettings: vocdoniVotingSettings,
    };

    if (useExistingToken) {
      params.useToken = this.getErc20PluginParams(formValues);
    } else {
      params.newToken = this.getNewErc20PluginParams(formValues);
    }

    const gaslessPlugin = GaslessVotingClient.encoding.getPluginInstallItem(
      params,
      network
    );

    return gaslessPlugin;
  };

  private getNewErc20PluginParams = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>
  ) => {
    const {tokenName, tokenSymbol, wallets} = formValues;

    return {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: this.defaultTokenDecimals,
      balances: wallets?.map(wallet => ({
        address: wallet.address,
        balance: parseUnits(
          wallet.amount,
          this.defaultTokenDecimals
        ).toBigInt(),
      })),
    };
  };

  private getErc20PluginParams = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>
  ) => {
    const {tokenAddress, tokenName, tokenSymbol, tokenType} = formValues;

    const name = tokenType === 'ERC-20' ? `Governance ${tokenName}` : tokenName;
    const symbol = tokenType === 'ERC-20' ? `g${tokenSymbol}` : tokenSymbol;

    return {
      tokenAddress: tokenAddress.address,
      wrappedToken: {name, symbol},
    };
  };

  private networkToSdkNetwork = (chainId: number) => {
    const selectedNetwork = getSupportedNetworkByChainId(chainId);

    if (selectedNetwork) {
      return translateToNetworkishName(selectedNetwork) as SdkSupportedNetworks;
    } else {
      throw new Error(
        'No network selected. A supported network must be selected'
      );
    }
  };

  private tokenVotingInitParamsToContract(
    params: TokenVotingPluginInstall
  ): ContractTokenVotingInitParams {
    let token: [string, string, string] = ['', '', ''];
    let balances: [string[], BigNumber[]] = [[], []];
    if (params.newToken) {
      token = [AddressZero, params.newToken.name, params.newToken.symbol];
      balances = [
        params.newToken.balances.map(balance => balance.address),
        params.newToken.balances.map(({balance}) => BigNumber.from(balance)),
      ];
    } else if (params.useToken) {
      token = [
        params.useToken?.tokenAddress,
        params.useToken.wrappedToken.name,
        params.useToken.wrappedToken.symbol,
      ];
    }
    return [votingSettingsToContract(params.votingSettings), token, balances];
  }
}

export const createDaoUtils = new CreateDaoUtils();
