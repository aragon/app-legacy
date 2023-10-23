/* eslint-disable no-case-declarations */
import {
  MultisigPluginPrepareUpdateParams,
  PrepareUpdateParams,
  PrepareUpdateStep,
  TokenVotingPluginPrepareUpdateParams,
} from '@aragon/sdk-client';
import {
  VersionTag,
  MultiTargetPermission,
  SupportedVersion,
} from '@aragon/sdk-client-common';
import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {TransactionState} from 'utils/constants';
import {CreateProposalFormData} from 'utils/types';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {usePluginAvailableVersions} from 'hooks/usePluginAvailableVersions';

type UpdateContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePreparePlugin: (type: string) => void;
  pluginAvailableVersions: Map<string, Plugin> | null;
  osxAvailableVersions: Map<string, OSX> | null;
};

type preparedData = {
  permissions: MultiTargetPermission[];
  pluginAddress: string;
  pluginRepo: string;
  versionTag: VersionTag;
  initData: Uint8Array;
  helpers: string[];
};

type Plugin = {
  version: VersionTag;
  isPrepared?: boolean;
  isLatest?: boolean;
  preparedData?: preparedData;
};

type OSX = {
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const {isOnWrongNetwork} = useWallet();
  const {t} = useTranslation();
  const {getValues, setValue} = useFormContext<CreateProposalFormData>();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType);
  const {data: pluginAvailableVersions, isLoading: availableVersionLoading} =
    usePluginAvailableVersions(pluginType, daoDetails?.address as string);

  console.log('pluginAvailableVersions', pluginAvailableVersions);

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
  // set plugin list
  useEffect(() => {
    if (availableVersionLoading) return;

    const OSXVersions = new Map();

    Object.keys(SupportedVersion).forEach(key => {
      OSXVersions.set(SupportedVersion[key as keyof typeof SupportedVersion], {
        version: SupportedVersion[
          key as keyof typeof SupportedVersion
        ] as string,
        ...(key === 'LATEST' && {isLatest: true}),
      } as OSX);

      if (key === 'LATEST')
        setValue('osSelectedVersion', {
          version: SupportedVersion[
            key as keyof typeof SupportedVersion
          ] as string,
        });
    });

    const pluginVersions = new Map();

    pluginAvailableVersions?.releases?.map((release, releaseIndex) => {
      release.builds.sort((a, b) => {
        return a.build > b.build ? 1 : -1;
      });

      release.builds.map((build, buildIndex) => {
        pluginVersions.set(`${release.release}.${build.build}`, {
          version: {
            build: build.build,
            release: release.release,
          },
          isPrepared: false,
          ...(releaseIndex === pluginAvailableVersions?.releases.length - 1 &&
            buildIndex === release.builds.length - 1 && {
              isLatest: true,
            }),
        });
      });

      setValue('pluginSelectedVersion', {
        version: {
          build: release.builds[release.builds.length - 1].build,
          release: release.release,
        },
      });
    });

    dispatch({
      type: 'setPluginAvailableVersions',
      payload: pluginVersions,
    });
    dispatch({
      type: 'setOSXAvailableVersions',
      payload: OSXVersions,
    });
  }, [availableVersionLoading, pluginAvailableVersions, setValue]);

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
    if (state.showModal.type === 'plugin')
      return pluginClient?.estimation.prepareUpdate(state.daoUpdateData);
    else
      client?.estimation.prepareUpdate(
        state.daoUpdateData as PrepareUpdateParams
      );
  }, [
    client?.estimation,
    pluginClient?.estimation,
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
            const pluginListTemp = state.pluginList;
            pluginListTemp?.set(
              `${step.versionTag.release}.${step.versionTag.build}`,
              {
                ...state.pluginList!.get(
                  `${step.versionTag.release}.${step.versionTag.build}`
                ),
                version: step.versionTag,
                isPrepared: true,
                preparedData: {
                  permissions: step.permissions,
                  pluginAddress: step.pluginAddress,
                  pluginRepo: step.pluginRepo,
                  initData: step.initData,
                  helpers: step.helpers,
                } as preparedData,
              }
            );
            console.log('success', {
              permissions: step.permissions,
              pluginAddress: step.pluginAddress,
              pluginRepo: step.pluginRepo,
              versionTag: step.versionTag,
              initData: step.initData,
              helpers: step.helpers,
            });
            dispatch({
              type: 'setPluginAvailableVersions',
              payload: pluginListTemp as Map<string, Plugin>,
            });
            dispatch({type: 'setDaoUpdateData'});
            dispatch({
              type: 'setPreparationProcessState',
              payload: TransactionState.SUCCESS,
            });
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
  return (
    <PrepareUpdateContext.Provider
      value={{
        handlePreparePlugin,
        pluginAvailableVersions: state.pluginList,
        osxAvailableVersions: state.osxList,
      }}
    >
      {children}
      <PublishModal
        state={state.preparationProcessState || TransactionState.WAITING}
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
        buttonLabel={t('update.modalPreparePlugin.ctaLabel')}
        buttonLabelSuccess={t('TransactionModal.goToProposal')}
        disabledCallback={disableActionButton}
      />
    </PrepareUpdateContext.Provider>
  );
};

function useUpdateContext(): UpdateContextType {
  return useContext(PrepareUpdateContext) as UpdateContextType;
}

export {UpdateProvider, useUpdateContext};
