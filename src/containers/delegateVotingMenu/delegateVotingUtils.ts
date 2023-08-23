import {InputValue} from '@aragon/ods';

export enum DelegateVotingFormField {
  TOKEN_DELEGATE = 'tokenDelegate',
}

export interface IDelegateVotingFormValues {
  [DelegateVotingFormField.TOKEN_DELEGATE]: InputValue;
}
