/* eslint-disable no-case-declarations */
import {
  MultisigPluginPrepareUpdateParams,
  PluginRepo,
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
import {useAvailableVersions} from 'hooks/usePluginAvailableVersions';
import {Abi} from 'utils/abiDecoder';

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
  isPrepared?: boolean;
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
  const [pluginAvailableVersions, osxAvailableVersions] =
    useAvailableVersions(pluginType);
  const [osSelectedVersion, pluginSelectedVersion] = getValues([
    'osSelectedVersion',
    'pluginSelectedVersion',
  ]);

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
    if (pluginAvailableVersions.isLoading || osxAvailableVersions.isLoading)
      return;

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

    console.log('SupportedVersion', OSXVersions);

    const pluginVersions: Map<string, Plugin> = new Map(
      // pluginAvailableVersions.data?.map(plugin => [plugin.version, plugin])
      [
        [
          `${
            (pluginAvailableVersions.data as PluginRepo)?.current.release.number
          }.${
            (pluginAvailableVersions.data as PluginRepo)?.current.build.number
          }`,
          pluginAvailableVersions.data as Plugin,
        ],
      ]
    );

    dispatch({
      type: 'setPluginAvailableVersions',
      payload: pluginVersions,
    });
    dispatch({
      type: 'setOSXAvailableVersions',
      payload: OSXVersions,
    });
  }, [
    osxAvailableVersions.data,
    osxAvailableVersions.isLoading,
    pluginAvailableVersions.data,
    pluginAvailableVersions.isLoading,
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
        ...(type === 'plugin' && {
          pluginRepo: '0x2345678901234567890123456789012345678901',
        }),
        ...(type === 'plugin'
          ? {
              newVersion: pluginSelectedVersion?.version as VersionTag,
            }
          : {
              newVersion: osSelectedVersion?.version as VersionTag,
            }),

        updateParams: [],
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
  const handleExecuteCreation = async () => {
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
    const preparePluginIterator =
      state.showModal.type === 'plugin'
        ? pluginClient?.methods.prepareUpdate(state.daoUpdateData)
        : client?.methods.prepareUpdate(
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
            console.log({
              permissions: step.permissions,
              pluginAddress: step.pluginAddress,
              pluginRepo: step.pluginRepo,
              versionTag: step.versionTag,
              initData: step.initData,
              helpers: step.helpers,
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
        subtitle={t('TransactionModal.publishDaoSubtitle')}
        buttonLabelSuccess={t('TransactionModal.launchDaoDashboard')}
        state={state.preparationProcessState || TransactionState.WAITING}
        isOpen={state.showModal.open}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={state.preparationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        disabledCallback={disableActionButton}
      />
    </PrepareUpdateContext.Provider>
  );
};

function useUpdateContext(): UpdateContextType {
  return useContext(PrepareUpdateContext) as UpdateContextType;
}

export {UpdateProvider, useUpdateContext};
