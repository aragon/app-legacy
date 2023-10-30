/* eslint-disable no-case-declarations */
import {
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  MultisigClient,
  MultisigPluginInstallParams,
  TokenVotingClient,
  TokenVotingPluginInstall,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {
  PluginInstallItem,
  SupportedNetwork as sdkSupportedNetworks,
} from '@aragon/sdk-client-common';
import {parseUnits} from 'ethers/lib/utils';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useAddFollowedDaoMutation} from 'hooks/useFollowedDaos';
import {useAddPendingDaoMutation} from 'hooks/usePendingDao';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  TransactionState,
  getSupportedNetworkByChainId,
} from 'utils/constants';
import {getSecondsFromDHM} from 'utils/date';
import {readFile, translateToNetworkishName} from 'utils/library';
import {Dashboard} from 'utils/paths';
import {CreateDaoFormData} from 'utils/types';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';

import {
  GaslessVotingClient,
  GaslessVotingPluginInstall,
  GaslessPluginVotingSettings,
} from '@vocdoni/gasless-voting';
import {useCensus3CreateToken} from '../hooks/useCensus3';

const DEFAULT_TOKEN_DECIMALS = 18;

type CreateDaoContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePublishDao: () => void;
};

const CreateDaoContext = createContext<CreateDaoContextType | null>(null);

const CreateDaoProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isOnWrongNetwork, provider} = useWallet();
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {getValues} = useFormContext<CreateDaoFormData>();
  const {client} = useClient();

  const addFavoriteDaoMutation = useAddFollowedDaoMutation();
  const addPendingDaoMutation = useAddPendingDaoMutation();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>();
  const [daoCreationData, setDaoCreationData] = useState<CreateDaoParams>();
  const [showModal, setShowModal] = useState(false);
  const [daoAddress, setDaoAddress] = useState('');

  const shouldPoll =
    daoCreationData !== undefined &&
    creationProcessState === TransactionState.WAITING;

  const disableActionButton =
    !daoCreationData && creationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handlePublishDao = async () => {
    setCreationProcessState(TransactionState.WAITING);
    setShowModal(true);
    const creationParams = await getDaoSettings();
    setDaoCreationData(creationParams);
  };

  // Handler for modal button click
  const handleExecuteCreation = async () => {
    // if DAO has been created, we don't need to do anything do not execute it
    // again, close the modal
    trackEvent('daoCreation_publishDAONow_clicked', {
      network: getValues('blockchain')?.network,
      wallet_provider: provider?.connection.url,
      governance_type: getValues('membership'),
      estimated_gwei_fee: averageFee?.toString(),
      total_usd_cost: averageFee
        ? (tokenPrice * Number(averageFee)).toString()
        : '0',
    });

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (!daoCreationData || creationProcessState === TransactionState.LOADING) {
      console.log('Transaction is running');
      return;
    }

    // if the wallet was in a wrong network user will see the wrong network warning
    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    // proceed with creation if transaction is waiting or was not successfully executed (retry);
    await createDao();
  };

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Dashboard, {
            network: network,
            dao: daoAddress,
          })
        );
        if (network === 'ethereum') {
          // (!networkInfo.isTestnet) {
          open('poapClaim');
        }
        break;
      default: {
        setShowModal(false);
        stopPolling();
      }
    }
  };

  const getOffchainPluginInstallParams = useCallback(
    (votingSettings: VotingSettings): GaslessVotingPluginInstall => {
      const {
        isCustomToken,
        committee,
        tokenType,
        committeeMinimumApproval,
        executionExpirationHours,
        executionExpirationDays,
        executionExpirationMinutes,
      } = getValues();

      const vocdoniVotingSettings: GaslessPluginVotingSettings = {
        expirationTime: getSecondsFromDHM(
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

      return {
        multisig: committee.map(wallet => wallet.address),
        votingSettings: vocdoniVotingSettings,
        ...((tokenType === 'governance-ERC20' || // token can be used as is
          tokenType === 'ERC-20') && // token can/will be wrapped
        !isCustomToken // not a new token (existing token)
          ? {useToken: getErc20PluginParams()}
          : {newToken: getNewErc20PluginParams()}),
      };
    },
    [getValues]
  );

  const getMultisigPluginInstallParams = useCallback((): [
    MultisigPluginInstallParams,
    sdkSupportedNetworks,
  ] => {
    const {
      blockchain,
      multisigWallets,
      multisigMinimumApprovals,
      eligibilityType,
    } = getValues();

    return [
      {
        members: multisigWallets.map(wallet => wallet.address),
        votingSettings: {
          minApprovals: multisigMinimumApprovals,
          onlyListed: eligibilityType === 'multisig',
        },
      },
      formNetworkToNetworkish(blockchain.id),
    ];
  }, [getValues]);

  const getVoteSettings = useCallback((): [
    VotingSettings,
    sdkSupportedNetworks,
  ] => {
    const {
      blockchain,
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
    } = getValues();

    let votingMode;

    // since voteReplacement cannot be set without early execution,
    // it takes precedence
    if (voteReplacement) votingMode = VotingMode.VOTE_REPLACEMENT;
    else if (earlyExecution) votingMode = VotingMode.EARLY_EXECUTION;
    else votingMode = VotingMode.STANDARD;

    let decimals = DEFAULT_TOKEN_DECIMALS;

    if (!isCustomToken) {
      decimals = tokenDecimals;
    }

    return [
      {
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
            : eligibilityType === 'multisig'
            ? BigInt(0)
            : parseUnits('1', decimals).toBigInt(),
        votingMode,
      },
      formNetworkToNetworkish(blockchain.id),
    ];
  }, [getValues]);

  const getNewErc20PluginParams =
    useCallback((): TokenVotingPluginInstall['newToken'] => {
      const {tokenName, tokenSymbol, wallets} = getValues();

      return {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: DEFAULT_TOKEN_DECIMALS,
        // minter: '0x...', // optionally, define a minter
        balances: wallets?.map(wallet => ({
          address: wallet.address,
          balance: parseUnits(wallet.amount, DEFAULT_TOKEN_DECIMALS).toBigInt(),
        })),
      };
    }, [getValues]);

  const getErc20PluginParams =
    useCallback((): TokenVotingPluginInstall['useToken'] => {
      const {tokenAddress, tokenName, tokenSymbol, tokenType} = getValues();

      let name, symbol;

      if (tokenType === 'ERC-20') {
        name = `Governance ${tokenName}`;
        symbol = `g${tokenSymbol}`;
      } else {
        // considering this is called only when token type is
        // erc20 or governance erc20 we can assume here to be
        // type governance erc20
        name = tokenName;
        symbol = tokenSymbol;
      }

      return {
        tokenAddress: tokenAddress.address, // contract address of underlying token
        wrappedToken: {name, symbol},
      };
    }, [getValues]);

  // Get dao setting configuration for creation process
  const getDaoSettings = useCallback(async (): Promise<CreateDaoParams> => {
    const {
      membership,
      daoName,
      daoEnsName,
      daoSummary,
      daoLogo,
      tokenType,
      isCustomToken,
      links,
      votingType,
    } = getValues();
    const plugins: PluginInstallItem[] = [];
    switch (membership) {
      case 'multisig': {
        const [params, network] = getMultisigPluginInstallParams();

        const multisigPlugin = MultisigClient.encoding.getPluginInstallItem(
          params,
          network
        );
        plugins.push(multisigPlugin);
        break;
      }
      case 'token': {
        const [votingSettings, network] = getVoteSettings();

        if (votingType === 'offChain') {
          const params = getOffchainPluginInstallParams(votingSettings);
          const offChainPlugin =
            GaslessVotingClient.encoding.getPluginInstallItem(params, network);
          plugins.push(offChainPlugin);
          break;
        }
        const tokenVotingPlugin =
          TokenVotingClient.encoding.getPluginInstallItem(
            {
              votingSettings: votingSettings,
              ...((tokenType === 'governance-ERC20' || // token can be used as is
                tokenType === 'ERC-20') && // token can/will be wrapped
              !isCustomToken // not a new token (existing token)
                ? {useToken: getErc20PluginParams()}
                : {newToken: getNewErc20PluginParams()}),
            },
            network
          );

        plugins.push(tokenVotingPlugin);

        break;
      }
      default:
        throw new Error(`Unknown dao type: ${membership}`);
    }

    const metadata: DaoMetadata = {
      name: daoName,
      description: daoSummary,
      links: links.filter(r => r.name && r.url),
    };

    if (daoLogo) {
      try {
        const daoLogoBuffer = await readFile(daoLogo as Blob);
        const logoCID = await client?.ipfs.add(new Uint8Array(daoLogoBuffer));
        await client?.ipfs.pin(logoCID!);
        metadata.avatar = `ipfs://${logoCID}`;
      } catch (e) {
        metadata.avatar = undefined;
      }
    }

    try {
      const ipfsUri = await client?.methods.pinMetadata(metadata);
      return {
        metadataUri: ipfsUri || '',
        // TODO: We're using dao name without spaces for ens, We need to add alert
        // to inform this to user
        ensSubdomain: daoEnsName || '',
        plugins: [...plugins],
      };
    } catch {
      throw Error('Could not pin metadata on IPFS');
    }
  }, [
    client?.ipfs,
    client?.methods,
    getErc20PluginParams,
    getMultisigPluginInstallParams,
    getNewErc20PluginParams,
    getValues,
    getVoteSettings,
  ]);

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    if (daoCreationData) return client?.estimation.createDao(daoCreationData);
  }, [client?.estimation, daoCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const {createToken} = useCensus3CreateToken();

  // run dao creation transaction
  const createDao = async () => {
    setCreationProcessState(TransactionState.LOADING);

    // Check if SDK initialized properly
    if (!client || !daoCreationData) {
      throw new Error('SDK client is not initialized correctly');
    }
    const createDaoIterator = client?.methods.createDao(daoCreationData);

    // Check if createDaoIterator function is initialized
    if (!createDaoIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    const {daoName, daoSummary, daoLogo, links, votingType, membership} =
      getValues();
    const metadata: DaoMetadata = {
      name: daoName,
      description: daoSummary,
      avatar: daoLogo ? URL.createObjectURL(daoLogo as Blob) : undefined,
      links: links.filter(r => r.name && r.url),
    };

    try {
      for await (const step of createDaoIterator) {
        switch (step.key) {
          case DaoCreationSteps.CREATING:
            console.log(step.txHash);
            trackEvent('daoCreation_transaction_signed', {
              network: getValues('blockchain')?.network,
              wallet_provider: provider?.connection.url,
              governance_type: getValues('membership'),
            });
            break;
          case DaoCreationSteps.DONE:
            console.log(
              'Newly created DAO address',
              step.address.toLowerCase()
            );
            trackEvent('daoCreation_transaction_success', {
              network: getValues('blockchain')?.network,
              wallet_provider: provider?.connection.url,
              governance_type: getValues('membership'),
            });
            setDaoCreationData(undefined);
            setCreationProcessState(TransactionState.SUCCESS);
            setDaoAddress(step.address.toLowerCase());

            try {
              await Promise.all([
                addPendingDaoMutation.mutateAsync({
                  daoAddress: step.address.toLowerCase(),
                  network,
                  daoDetails: {
                    ...daoCreationData,
                    metadata,
                    creationDate: new Date(),
                  },
                }),
                addFavoriteDaoMutation.mutateAsync({
                  dao: {
                    address: step.address.toLocaleLowerCase(),
                    chain: CHAIN_METADATA[network].id,
                    ensDomain: daoCreationData.ensSubdomain || '',
                    plugins: daoCreationData.plugins,
                    metadata: {
                      name: metadata.name,
                      avatar: metadata.avatar,
                      description: metadata.description,
                    },
                  },
                }),
              ]).then(async () => {
                if (votingType === 'offChain' && membership === 'token') {
                  await createToken(step.pluginAddresses[0]);
                }
              });
              // After everything is
            } catch (error) {
              console.warn(
                'Error favoriting and adding newly created DAO to cache',
                error
              );
            }
            break;
        }
      }
    } catch (err) {
      // unsuccessful execution, keep creation data for retry
      console.log(err);
      trackEvent('daoCreation_transaction_failed', {
        network: getValues('blockchain')?.network,
        wallet_provider: provider?.connection.url,
        governance_type: getValues('membership'),
        err,
      });
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  const buttonLabels = {
    [TransactionState.SUCCESS]: t('TransactionModal.launchDaoDashboard'),
    [TransactionState.WAITING]: t('TransactionModal.publishDaoButtonLabel'),
  };
  return (
    <CreateDaoContext.Provider value={{handlePublishDao}}>
      {children}
      <PublishModal
        subtitle={t('TransactionModal.publishDaoSubtitle')}
        buttonStateLabels={buttonLabels}
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        disabledCallback={disableActionButton}
      />
    </CreateDaoContext.Provider>
  );
};

function useCreateDaoContext(): CreateDaoContextType {
  return useContext(CreateDaoContext) as CreateDaoContextType;
}

export {CreateDaoProvider, useCreateDaoContext};

function formNetworkToNetworkish(chainId: number) {
  const selectedNetwork = getSupportedNetworkByChainId(chainId);

  if (selectedNetwork) {
    return translateToNetworkishName(selectedNetwork) as sdkSupportedNetworks;
  } else {
    throw new Error(
      'No network selected. A supported network must be selected'
    );
  }
}
