/* eslint-disable no-case-declarations */
import {
  MultisigClient,
  MultisigPluginPrepareUpdateParams,
  PrepareUpdateParams,
  PrepareUpdateStep,
  TokenVotingClient,
  TokenVotingPluginPrepareUpdateParams,
} from '@aragon/sdk-client';
import {
  ApplyUpdateParams,
  SupportedVersion,
  VersionTag,
} from '@aragon/sdk-client-common';
import React, {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {
  GaslessPluginName,
  PluginTypes,
  usePluginClient,
} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {usePluginVersions} from 'services/aragon-sdk/queries/use-plugin-versions';
import {usePreparedPlugins} from 'services/aragon-sdk/queries/use-prepared-plugins';
import {useProtocolVersion} from 'services/aragon-sdk/queries/use-protocol-version';
import {TransactionState} from 'utils/constants';
import {compareVersions} from 'utils/library';

type UpdateContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePreparePlugin: (type: string) => void;
  availablePluginVersions: Map<string, Plugin> | null;
  availableOSxVersions: Map<string, OSX> | null;
};

type Plugin = {
  version: VersionTag;
  isPrepared?: boolean;
  isLatest?: boolean;
  preparedData?: ApplyUpdateParams;
};

export type OSX = {
  version: string;
  isLatest?: boolean;
};

type State = {
  showModal: {
    open: boolean;
    type: string;
  };
  preparationProcessState?: TransactionState;
  daoUpdateData?:
    | TokenVotingPluginPrepareUpdateParams
    | MultisigPluginPrepareUpdateParams
    | PrepareUpdateParams;
  pluginList: Map<string, Plugin> | null;
  osxList: Map<string, OSX> | null;
};

type Action =
  | {type: 'setShowModal'; payload: {open: boolean; type: string}}
  | {type: 'setPreparationProcessState'; payload: TransactionState}
  | {
      type: 'setDaoUpdateData';
      payload?:
        | TokenVotingPluginPrepareUpdateParams
        | MultisigPluginPrepareUpdateParams
        | PrepareUpdateParams;
    }
  | {type: 'setPluginAvailableVersions'; payload: Map<string, Plugin>}
  | {type: 'setOSXAvailableVersions'; payload: Map<string, OSX>};

const initialState: State = {
  showModal: {
    open: false,
    type: '',
  },
  pluginList: null,
  osxList: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'setShowModal':
      return {
        ...state,
        showModal: action.payload,
      };
    case 'setPreparationProcessState':
      return {
        ...state,
        preparationProcessState: action.payload,
      };
    case 'setDaoUpdateData':
      return {
        ...state,
        daoUpdateData: action.payload,
      };
    case 'setPluginAvailableVersions':
      return {
        ...state,
        pluginList: action.payload,
      };
    case 'setOSXAvailableVersions':
      return {
        ...state,
        osxList: action.payload,
      };
    default:
      return state;
  }
};

const PrepareUpdateContext = createContext<UpdateContextType | null>(null);

const UpdateProvider: React.FC<{children: ReactElement}> = ({children}) => {
  const {t} = useTranslation();
  const {isOnWrongNetwork} = useWallet();

  const [state, dispatch] = useReducer(reducer, initialState);

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const daoAddress = daoDetails?.address as string;

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType);

  const {data: pluginAvailableVersions} = usePluginVersions({
    pluginType,
    daoAddress,
  });

  const {data: versions} = useProtocolVersion(daoAddress);

  const {data: preparedPluginList} = usePreparedPlugins({
    pluginType,
    pluginAddress: daoDetails?.plugins?.[0]?.instanceAddress as string,
    daoAddressOrEns: daoAddress,
  });

  const {getValues, setValue} = useFormContext();
  const pluginSelectedVersion = getValues('pluginSelectedVersion');

  const shouldPoll =
    state.daoUpdateData !== undefined &&
    state.preparationProcessState === TransactionState.WAITING;

  const disableActionButton =
    !state.daoUpdateData &&
    state.preparationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                    Effects                    *
   *************************************************/
  // set protocol list
  useEffect(() => {
    if (versions) {
      const OSXVersions = new Map();

      Object.keys(SupportedVersion).forEach(key => {
        if (
          compareVersions(
            SupportedVersion[key as keyof typeof SupportedVersion],
            versions.join('.')
          ) === 1
        ) {
          OSXVersions.set(
            SupportedVersion[key as keyof typeof SupportedVersion],
            {
              version: SupportedVersion[
                key as keyof typeof SupportedVersion
              ] as string,
              ...(key === 'LATEST' && {isLatest: true}),
            } as OSX
          );

          if (key === 'LATEST') {
            setValue('osSelectedVersion', {
              version: SupportedVersion[
                key as keyof typeof SupportedVersion
              ] as string,
            });
          }
        }
      });

      dispatch({
        type: 'setOSXAvailableVersions',
        payload: OSXVersions,
      });
    }
  }, [setValue, versions]);

  // set plugin list
  useEffect(() => {
    if (daoDetails && pluginAvailableVersions?.releases && preparedPluginList) {
      const pluginVersions = new Map();

      pluginAvailableVersions.releases.forEach((release, releaseIndex) => {
        release.builds.sort((a, b) => {
          return a.build > b.build ? 1 : -1;
        });

        release.builds.forEach((build, buildIndex) => {
          if (
            release.release >= daoDetails.plugins[0].release &&
            build.build > daoDetails.plugins[0].build
          ) {
            const versionKey = `${release.release}.${build.build}`;
            pluginVersions.set(versionKey, {
              version: {
                build: build.build,
                release: release.release,
              },
              ...(preparedPluginList.has(versionKey) && {
                isPrepared: true,
                preparedData: {
                  ...preparedPluginList.get(
                    `${release.release}.${build.build}`
                  ),
                },
              }),
              ...(releaseIndex ===
                pluginAvailableVersions.releases.length - 1 &&
                buildIndex === release.builds.length - 1 && {
                  isLatest: true,
                }),
            });

            setValue('pluginSelectedVersion', {
              version: {
                build: release.builds[release.builds.length - 1].build,
                release: release.release,
              },
              isPrepared: Boolean(
                preparedPluginList.has(
                  `${release.release}.${
                    release.builds[release.builds.length - 1].build
                  }`
                )
              ),
            });
          }
        });
      });

      dispatch({
        type: 'setPluginAvailableVersions',
        payload: pluginVersions,
      });
    }
  }, [
    daoDetails,
    pluginAvailableVersions?.releases,
    preparedPluginList,
    setValue,
  ]);

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handlePreparePlugin = async (type: string) => {
    if (detailsAreLoading) return;
    dispatch({
      type: 'setPreparationProcessState',
      payload: TransactionState.WAITING,
    });
    dispatch({
      type: 'setDaoUpdateData',
      payload: {
        daoAddressOrEns: daoDetails!.address, // my-dao.dao.eth
        pluginAddress: daoDetails?.plugins?.[0]!.instanceAddress as string,
        pluginRepo: pluginAvailableVersions?.address,
        newVersion: pluginSelectedVersion?.version as VersionTag,
      },
    });
    dispatch({
      type: 'setShowModal',
      payload: {
        open: true,
        type: type,
      },
    });
  };

  // Handler for modal button click
  const handleExecutePrepare = async () => {
    if (state.preparationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (
      !state.daoUpdateData ||
      state.preparationProcessState === TransactionState.LOADING
    ) {
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
    await preparePlugin();
  };

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = () => {
    switch (state.preparationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
      default: {
        dispatch({
          type: 'setShowModal',
          payload: {
            ...state.showModal,
            open: false,
          },
        });
        stopPolling();
      }
    }
  };

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    if (!state.daoUpdateData) return;
    if (state.showModal.type === 'plugin' && pluginType !== GaslessPluginName)
      return (
        pluginClient as MultisigClient | TokenVotingClient
      )?.estimation.prepareUpdate(state.daoUpdateData);
    else
      client?.estimation.prepareUpdate(
        state.daoUpdateData as PrepareUpdateParams
      );
  }, [
    client?.estimation,
    pluginClient,
    pluginType,
    state.daoUpdateData,
    state.showModal.type,
  ]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  // run dao creation transaction
  const preparePlugin = async () => {
    dispatch({
      type: 'setPreparationProcessState',
      payload: TransactionState.LOADING,
    });

    // Check if SDK initialized properly
    if (!client || !state.daoUpdateData) {
      throw new Error('SDK client is not initialized correctly');
    }
    const preparePluginIterator = client?.methods.prepareUpdate(
      state.daoUpdateData as PrepareUpdateParams
    );

    // Check if preparePluginIterator function is initialized
    if (!preparePluginIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      for await (const step of preparePluginIterator) {
        switch (step.key) {
          case PrepareUpdateStep.PREPARING:
            console.log(step.txHash);
            break;
          case PrepareUpdateStep.DONE:
            {
              const pluginListTemp = state.pluginList;

              const preparedData: ApplyUpdateParams = {
                permissions: step.permissions,
                pluginAddress: step.pluginAddress,
                pluginRepo: step.pluginRepo,
                initData: step.initData,
                helpers: step.helpers,
                versionTag: step.versionTag,
              };

              pluginListTemp?.set(
                `${step.versionTag.release}.${step.versionTag.build}`,
                {
                  ...state.pluginList!.get(
                    `${step.versionTag.release}.${step.versionTag.build}`
                  ),
                  version: step.versionTag,
                  isPrepared: true,
                  preparedData,
                }
              );
              dispatch({
                type: 'setPluginAvailableVersions',
                payload: pluginListTemp as Map<string, Plugin>,
              });
              setValue('pluginSelectedVersion', {
                version: step.versionTag,
                isPrepared: true,
              });
              dispatch({type: 'setDaoUpdateData'});
              dispatch({
                type: 'setPreparationProcessState',
                payload: TransactionState.SUCCESS,
              });
            }
            break;
        }
      }
    } catch (err) {
      // unsuccessful execution, keep creation data for retry
      console.log(err);
      dispatch({
        type: 'setPreparationProcessState',
        payload: TransactionState.ERROR,
      });
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  const buttonLabels = {
    [TransactionState.SUCCESS]: t('TransactionModal.goToProposal'),
    [TransactionState.WAITING]: t('update.modalPreparePlugin.ctaLabel'),
  };

  return (
    <PrepareUpdateContext.Provider
      value={{
        handlePreparePlugin,
        availablePluginVersions: state.pluginList,
        availableOSxVersions: state.osxList,
      }}
    >
      {children}
      <PublishModal
        state={state.preparationProcessState ?? TransactionState.WAITING}
        isOpen={state.showModal.open}
        onClose={handleCloseModal}
        callback={handleExecutePrepare}
        closeOnDrag={state.preparationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('update.modalPreparePlugin.title')}
        subtitle={t('update.modalPreparePlugin.desc')}
        buttonStateLabels={buttonLabels}
        disabledCallback={disableActionButton}
      />
    </PrepareUpdateContext.Provider>
  );
};

function useUpdateContext(): UpdateContextType {
  return useContext(PrepareUpdateContext) as UpdateContextType;
}

export {UpdateProvider, useUpdateContext};
