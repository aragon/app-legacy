import type {QueryKey} from '@tanstack/query-core';
import type {IEncodeActionParams} from './actionEncoderService.api';
import {isTokenVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';

export enum ActionEncoderQueryItem {
  ENCODE_ACTIONS = 'ENCODE_ACTIONS',
}

export const actionEncoderQueryKeys = {
  encodeActions: (params: IEncodeActionParams): QueryKey => {
    const {votingSettings, ...otherParams} = params;

    let votingSettingsCached = {...votingSettings};

    if (isTokenVotingSettings(votingSettings)) {
      // Do not cache minProposerVotingPower as react-query cannot serialize big-int
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {minProposerVotingPower, ...otherSettings} = votingSettings;
      votingSettingsCached = otherSettings;
    }

    return [
      ActionEncoderQueryItem.ENCODE_ACTIONS,
      {votingSettings: votingSettingsCached, ...otherParams},
    ];
  },
};
