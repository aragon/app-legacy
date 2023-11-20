import {ExternalActionInput} from './types';

export interface CustomActionSpec {
  description: string;
  id: string;
  title: string;
  schema: Record<string, unknown>;
  transform: Record<string, unknown>[];
}

export interface ActionCalldata {
  contractName: string;
  contractAddress: string;
  functionName: string;
  inputs: ExternalActionInput[];
}

export const getAllCustomActions = async () => {
  const actionsResp = await fetch(
    'https://aragon.restspace.io/custom-actions/scripts/?$list=items'
  );
  const customActions = await actionsResp.json();
  return customActions as Record<string, CustomActionSpec>;
};
