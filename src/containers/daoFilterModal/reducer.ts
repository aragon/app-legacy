import {SupportedNetworks} from 'utils/constants';
import {QuickFilterValue} from './data';

export type DaoFilterState = {
  governanceIds?: Array<string>;
  networks?: Array<SupportedNetworks>;
  quickFilter: QuickFilterValue;
};

export enum FilterActionTypes {
  SET_GOVERNANCE_IDS = 'SET_GOVERNANCE_IDS',
  SET_QUICK_FILTER = 'SET_QUICK_FILTER',
  SET_NETWORKS = 'SET_NETWORKS',
  RESET = 'RESET',
}

export type DaoFilterAction =
  | {
      type: FilterActionTypes.SET_GOVERNANCE_IDS;
      payload: DaoFilterState['governanceIds'];
    }
  | {
      type: FilterActionTypes.SET_QUICK_FILTER;
      payload: DaoFilterState['quickFilter'];
    }
  | {
      type: FilterActionTypes.SET_NETWORKS;
      payload: DaoFilterState['networks'];
    }
  | {type: FilterActionTypes.RESET; payload: DaoFilterState};

export const daoFiltersReducer = (
  state: DaoFilterState,
  action: DaoFilterAction
): DaoFilterState => {
  switch (action.type) {
    case FilterActionTypes.SET_GOVERNANCE_IDS:
      return {
        ...state,
        governanceIds:
          action.payload?.length === 0 ? undefined : action.payload,
      };

    case FilterActionTypes.SET_QUICK_FILTER:
      return {...state, quickFilter: action.payload};

    case FilterActionTypes.SET_NETWORKS:
      return {
        ...state,
        networks: action.payload?.length === 0 ? undefined : action.payload,
      };
    case FilterActionTypes.RESET:
      return {...action.payload};

    default:
      return state;
  }
};
