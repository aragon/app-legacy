import type {QueryKey} from '@tanstack/query-core';
import type {IEncodeActionParams} from './actionEncoderService.api';

export enum ActionEncoderQueryItem {
  ENCODE_ACTIONS = 'ENCODE_ACTIONS',
}

export const actionEncoderQueryKeys = {
  encodeActions: (params: IEncodeActionParams): QueryKey => [
    ActionEncoderQueryItem.ENCODE_ACTIONS,
    params,
  ],
};
