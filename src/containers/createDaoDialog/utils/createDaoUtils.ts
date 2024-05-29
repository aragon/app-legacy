import {
  DaoMetadata,
  MultisigClient,
  TokenVotingClient,
  TokenVotingPluginInstall,
  VotingMode,
} from '@aragon/sdk-client';
import {
  DAORegistry__factory,
  PluginSetupProcessor__factory,
} from '@aragon/osx-ethers';
import {parseUnits} from 'ethers/lib/utils';
import {PluginInstallItem} from '@aragon/sdk-client-common';
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
import {TransactionReceipt} from 'viem';
import {id} from '@ethersproject/hash';

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
    const {tokenType, isCustomToken, blockchain} = formValues;

    const votingSettings = this.getVoteSettings(formValues);
    const network = this.networkToSdkNetwork(blockchain.id);

    const useExistingToken =
      (tokenType === 'governance-ERC20' || tokenType === 'ERC-20') &&
      !isCustomToken;

    const params: TokenVotingPluginInstall = {votingSettings: votingSettings};

    if (useExistingToken) {
      params.useToken = this.getErc20PluginParams(formValues);
    } else {
      params.newToken = this.getNewErc20PluginParams(formValues);
    }

    const plugin = TokenVotingClient.encoding.getPluginInstallItem(
      params,
      network
    );

    return plugin;
  };

  private getMultisigPlugin = (
    formValues: Omit<CreateDaoFormData, 'daoLogo'>
  ) => {
    const {
      blockchain,
      multisigWallets,
      multisigMinimumApprovals,
      eligibilityType,
    } = formValues;

    const network = this.networkToSdkNetwork(blockchain.id);

    const params = {
      members: multisigWallets.map(wallet => wallet.address),
      votingSettings: {
        minApprovals: multisigMinimumApprovals,
        onlyListed: eligibilityType === 'multisig',
      },
    };

    const multisigPlugin = MultisigClient.encoding.getPluginInstallItem(
      params,
      network
    );

    return multisigPlugin;
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
}

export const createDaoUtils = new CreateDaoUtils();
