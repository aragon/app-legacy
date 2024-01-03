import AddAddresses from '../actionBuilder/addAddresses';
import RemoveAddresses from '../actionBuilder/removeAddresses';
import React from 'react';
import {MultisigDaoMember} from '../../hooks/useDaoMembers';
import UpdateMinimumApproval from '../actionBuilder/updateMinimumApproval';

type ManageExecutionMultisigProps = {
  members: MultisigDaoMember[] | undefined;
  minTallyApprovals: number;
  daoAddress: string;
};

export const ManageExecutionMultisig: React.FC<
  ManageExecutionMultisigProps
> = ({members, minTallyApprovals}) => {
  if (!members) return null;
  return (
    <>
      <AddAddresses
        actionIndex={0}
        useCustomHeader
        currentDaoMembers={members}
      />
      <RemoveAddresses
        actionIndex={1}
        useCustomHeader
        currentDaoMembers={members}
      />
      <UpdateMinimumApproval
        actionIndex={2}
        useCustomHeader
        currentDaoMembers={members}
        currentMinimumApproval={minTallyApprovals}
        isGasless={true}
      />
    </>
  );
};
