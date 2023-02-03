/* eslint-disable no-case-declarations */
import {useReactiveVar} from '@apollo/client';
import {
  DaoCreationSteps,
  CreateDaoParams,
  DaoMetadata,
  IPluginInstallItem,
  ITokenVotingPluginInstall,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
  MultisigClient,
  MultisigPluginInstallParams,
} from '@aragon/sdk-client';
import {parseUnits} from 'ethers/lib/utils';
import React, {createContext, useCallback, useContext, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {CreateDaoFormData} from 'pages/createDAO';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  FAVORITE_DAOS_KEY,
  PENDING_DAOS_KEY,
  TransactionState,
} from 'utils/constants';
import {getSecondsFromDHM} from 'utils/date';
import {Dashboard} from 'utils/paths';
import {
  favoriteDaosVar,
  NavigationDao,
  pendingDaoCreationVar,
} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {toAscii} from 'idna-uts46';

function readFile(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result as ArrayBuffer);
    };
    fr.onerror = reject;
    fr.readAsArrayBuffer(file);
  });
}

type CreateDaoContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePublishDao: () => void;
};

const CreateDaoContext = createContext<CreateDaoContextType | null>(null);

const CreateDaoProvider: React.FC = ({children}) => {
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isOnWrongNetwork, provider} = useWallet();
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {getValues} = useFormContext<CreateDaoFormData>();
  const {client} = useClient();
  const cachedDaoCreation = useReactiveVar(pendingDaoCreationVar);
  const favoriteDaoCache = useReactiveVar(favoriteDaosVar);
  const {preferences} = usePrivacyContext();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>();
  const [daoCreationData, setDaoCreationData] = useState<CreateDaoParams>();
  const [showModal, setShowModal] = useState(false);
  const [daoAddress, setDaoAddress] = useState('');

  const shouldPoll =
    daoCreationData !== undefined &&
    creationProcessState === TransactionState.WAITING;

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
        break;
      default: {
        setShowModal(false);
        stopPolling();
      }
    }
  };

  const getMultisigPluginInstallParams =
    useCallback((): MultisigPluginInstallParams => {
      const {multisigWallets, multisigMinimumApprovals, eligibilityType} =
        getValues();
      return {
        members: multisigWallets.map(wallet => wallet.address),
        votingSettings: {
          minApprovals: multisigMinimumApprovals,
          onlyListed: eligibilityType === 'multisig',
        },
      };
    }, [getValues]);

  const getVoteSettings = useCallback((): VotingSettings => {
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
    } = getValues();

    let votingMode;

    // since voteReplacement cannot be set without early execution,
    // it takes precedence
    if (voteReplacement) votingMode = VotingMode.VOTE_REPLACEMENT;
    else if (earlyExecution) votingMode = VotingMode.EARLY_EXECUTION;
    else votingMode = VotingMode.STANDARD;

    return {
      minDuration: getSecondsFromDHM(
        parseInt(durationDays),
        parseInt(durationHours),
        parseInt(durationMinutes)
      ),
      minParticipation: parseInt(minimumParticipation) / 100,
      supportThreshold: parseInt(minimumApproval) / 100,
      minProposerVotingPower:
        eligibilityType === 'token'
          ? parseUnits(eligibilityTokenAmount.toString(), 18).toBigInt()
          : BigInt(0),
      votingMode,
    };
  }, [getValues]);

  const getErc20PluginParams =
    useCallback((): ITokenVotingPluginInstall['newToken'] => {
      const {tokenName, tokenSymbol, wallets} = getValues();
      return {
        name: tokenName,
        symbol: tokenSymbol,
        decimals: 18,
        // minter: '0x...', // optionally, define a minter
        balances: wallets?.map(wallet => ({
          address: wallet.address,
          balance: parseUnits(wallet.amount, 18).toBigInt(),
        })),
      };
    }, [getValues]);

  // Get dao setting configuration for creation process
  const getDaoSettings = useCallback(async (): Promise<CreateDaoParams> => {
    const {membership, daoName, daoSummary, daoLogo, links} = getValues();
    const plugins: IPluginInstallItem[] = [];
    switch (membership) {
      case 'multisig': {
        const params = getMultisigPluginInstallParams();
        const multisigPlugin =
          MultisigClient.encoding.getPluginInstallItem(params);
        plugins.push(multisigPlugin);
        break;
      }
      case 'token': {
        const votingSettings = getVoteSettings();
        const tokenVotingPlugin =
          TokenVotingClient.encoding.getPluginInstallItem({
            votingSettings: votingSettings,
            newToken: getErc20PluginParams(),
          });

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
        ensSubdomain: toAscii(daoName?.replaceAll(/[ .]/g, '-'), {
          transitional: true,
          useStd3ASCII: true,
          verifyDnsLength: true,
        }),
        plugins: [...plugins],
      };
    } catch {
      throw Error('Could not pin metadata on IPFS');
    }
  }, [
    client?.ipfs,
    client?.methods,
    getErc20PluginParams,
    getValues,
    getVoteSettings,
    getMultisigPluginInstallParams,
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

    const {daoName, daoSummary, daoLogo, links} = getValues();
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

            const newCache = {
              ...cachedDaoCreation,
              [network]: {
                ...cachedDaoCreation[network],
                [step.address.toLocaleLowerCase()]: {
                  daoCreationParams: daoCreationData,
                  daoMetadata: metadata,
                },
              },
            };

            pendingDaoCreationVar(newCache);

            const newFavoriteDao: NavigationDao = {
              address: step.address.toLocaleLowerCase(),
              chain: CHAIN_METADATA[network].id,
              ensDomain: daoCreationData.ensSubdomain,
              plugins: daoCreationData.plugins,
              metadata: {
                name: metadata.name,
                avatar: metadata.avatar,
                description: metadata.description,
              },
            };

            const tempCache = [...favoriteDaoCache, newFavoriteDao];

            favoriteDaosVar(tempCache);

            if (preferences?.functional) {
              localStorage.setItem(PENDING_DAOS_KEY, JSON.stringify(newCache));
              localStorage.setItem(
                FAVORITE_DAOS_KEY,
                JSON.stringify(tempCache)
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
  return (
    <CreateDaoContext.Provider value={{handlePublishDao}}>
      {children}
      <PublishModal
        subtitle={t('TransactionModal.publishDaoSubtitle')}
        buttonLabelSuccess={t('TransactionModal.launchDaoDashboard')}
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
      />
    </CreateDaoContext.Provider>
  );
};

function useCreateDaoContext(): CreateDaoContextType {
  return useContext(CreateDaoContext) as CreateDaoContextType;
}

export {useCreateDaoContext, CreateDaoProvider};
