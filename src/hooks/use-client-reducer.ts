import {Signer} from '@ethersproject/abstract-signer';
import {Wallet} from '@ethersproject/wallet';
import {AccountData, EnvOptions, VocdoniSDKClient} from '@vocdoni/sdk';
import {Reducer, useReducer} from 'react';
import {ClientProviderProps} from './useVocdoniSdk';
import {errorToString} from 'utils/vocdoniUtils';
// import {errorToString} from './utils';

export const ClientAccountError = 'client:account:error';
export const ClientAccountFetch = 'client:account:fetch';
export const ClientAccountSet = 'client:account:set';
export const ClientBalanceError = 'client:balance:error';
export const ClientBalanceFetch = 'client:balance:fetch';
export const ClientBalanceSet = 'client:balance:set';
export const ClientClear = 'client:clear';
export const ClientEnvSet = 'client:env:set';
export const ClientSet = 'client:set';
export const ClientSignerSet = 'client:signer:set';

type ErrorPayload = Error | string;

export type ClientAccountErrorPayload = ErrorPayload;
export type ClientAccountSetPayload = AccountData;
export type ClientBalanceErrorPayload = ErrorPayload;
export type ClientBalanceSetPayload = number;
export type ClientEnvSetPayload = `${EnvOptions}` | EnvOptions;
export type ClientSetPayload = VocdoniSDKClient;
export type ClientSignerSetPayload = Signer | Wallet;

export type ClientActionPayload =
  | ClientAccountErrorPayload
  | ClientAccountSetPayload
  | ClientBalanceErrorPayload
  | ClientBalanceSetPayload
  | ClientEnvSetPayload
  | ClientSetPayload
  | ClientSignerSetPayload;

export type ClientActionType =
  | typeof ClientAccountError
  | typeof ClientAccountFetch
  | typeof ClientAccountSet
  | typeof ClientBalanceError
  | typeof ClientBalanceFetch
  | typeof ClientBalanceSet
  | typeof ClientClear
  | typeof ClientEnvSet
  | typeof ClientSet
  | typeof ClientSignerSet;

export interface ClientAction {
  type: ClientActionType;
  payload?: ClientActionPayload;
}

export interface ClientState {
  client: VocdoniSDKClient;
  env: EnvOptions;
  account: AccountData | undefined;
  signer: Wallet | Signer;
  balance: number;
  // determines if a wallet is connected to the client
  connected: boolean;
  // loaded status
  loaded: {
    account: boolean;
    balance: boolean;
  };
  // loading status
  loading: {
    account: boolean;
    balance: boolean;
  };
  errors: {
    account: string | null;
    balance: string | null;
  };
}

export const clientStateEmpty = (
  env: EnvOptions,
  client: VocdoniSDKClient,
  signer: Wallet | Signer
): ClientState => ({
  env,
  signer,
  client:
    client ||
    new VocdoniSDKClient({
      env,
    }),
  account: undefined,
  balance: -1,
  connected: false,
  loading: {
    account: false,
    balance: false,
  },
  loaded: {
    account: false,
    balance: false,
  },
  errors: {
    account: null,
    balance: null,
  },
});

const clientReducer: Reducer<ClientState, ClientAction> = (
  state: ClientState,
  action: ClientAction
) => {
  switch (action.type) {
    case ClientAccountFetch: {
      return {
        ...state,
        loading: {
          ...state.loading,
          account: true,
        },
      };
    }
    case ClientAccountError: {
      const error = action.payload as ClientAccountErrorPayload;
      return {
        ...state,
        loading: {
          ...state.loading,
          account: false,
        },
        loaded: {
          ...state.loaded,
          account: true,
        },
        errors: {
          ...state.errors,
          account: errorToString(error),
        },
      };
    }
    case ClientAccountSet: {
      const account = action.payload as ClientAccountSetPayload;
      return {
        ...state,
        account,
        loading: {
          ...state.loading,
          account: false,
        },
        loaded: {
          ...state.loaded,
          account: true,
        },
        errors: {
          ...state.errors,
          account: null,
        },
      };
    }
    case ClientBalanceError: {
      const error = action.payload as ClientBalanceErrorPayload;
      return {
        ...state,
        loading: {
          ...state.loading,
          balance: false,
        },
        loaded: {
          ...state.loaded,
          balance: true,
        },
        errors: {
          ...state.errors,
          balance: errorToString(error),
        },
      };
    }
    case ClientBalanceFetch: {
      return {
        ...state,
        loading: {
          ...state.loading,
          balance: true,
        },
      };
    }
    case ClientBalanceSet: {
      const balance = action.payload as ClientBalanceSetPayload;
      return {
        ...state,
        balance,
        loading: {
          ...state.loading,
          balance: false,
        },
        loaded: {
          ...state.loaded,
          balance: true,
        },
        errors: {
          ...state.errors,
          balance: null,
        },
      };
    }
    case ClientClear: {
      const client = new VocdoniSDKClient({
        env: state.env,
      });
      return {
        ...state,
        client,
        signer: {} as Signer,
        account: undefined,
        balance: -1,
        loaded: {
          account: false,
          balance: false,
        },
        errors: {
          account: null,
          balance: null,
        },
      };
    }
    case ClientSet: {
      const client = action.payload as ClientSetPayload;
      return {
        ...state,
        client,
        connected: !!client.wallet,
      };
    }
    case ClientEnvSet: {
      const env = action.payload as ClientEnvSetPayload as EnvOptions;
      // redefine client to use new environment
      const client = new VocdoniSDKClient({
        env,
        wallet: state.signer,
      });
      return {
        ...state,
        account: undefined,
        balance: -1,
        client,
        env,
        connected: !!client.wallet,
      };
    }
    case ClientSignerSet: {
      const signer = action.payload as ClientSignerSetPayload;
      const client = new VocdoniSDKClient({
        env: state.env,
        wallet: signer,
      });
      return {
        ...state,
        client,
        signer,
        connected: !!client.wallet,
      };
    }
    default:
      return state;
  }
};

export const useClientReducer = ({
  env,
  client,
  signer,
}: ClientProviderProps) => {
  const [state, dispatch] = useReducer(
    clientReducer,
    clientStateEmpty(
      env as EnvOptions,
      client as VocdoniSDKClient,
      signer as Wallet | Signer
    )
  );

  // dispatch helper methods
  const clear = () => dispatch({type: ClientClear});
  const errorAccount = (error: Error | string) =>
    dispatch({type: ClientAccountError, payload: error});
  const errorBalance = (error: Error | string) =>
    dispatch({type: ClientBalanceError, payload: error});
  const fetchAccount = () => dispatch({type: ClientAccountFetch});
  const fetchBalance = () => dispatch({type: ClientBalanceFetch});
  const setAccount = (account: AccountData | undefined) =>
    dispatch({type: ClientAccountSet, payload: account});
  const setBalance = (balance: number) =>
    dispatch({type: ClientBalanceSet, payload: balance});
  const setClient = (client: VocdoniSDKClient) =>
    dispatch({type: ClientSet, payload: client});
  const setEnv = (env: ClientEnvSetPayload) =>
    dispatch({type: ClientEnvSet, payload: env});
  const setSigner = (signer: Wallet | Signer) =>
    dispatch({type: ClientSignerSet, payload: signer});

  return {
    state,
    dispatch,
    actions: {
      clear,
      errorAccount,
      errorBalance,
      fetchAccount,
      fetchBalance,
      setAccount,
      setBalance,
      setClient,
      setEnv,
      setSigner,
    },
  };
};
