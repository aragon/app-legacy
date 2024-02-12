import React, {useState} from 'react';

import {Loading} from 'components/temporary';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {CreateProposalProvider} from '../context/createProposal';
import {ProposeSettingsStepper} from '../containers/proposeSettingsStepper/proposeSettingsStepper';

export const ProposeSettings: React.FC = () => {
  const [showTxModal, setShowTxModal] = useState(false);

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!daoDetails) {
    return null;
  }

  return (
    <CreateProposalProvider
      showTxModal={showTxModal}
      setShowTxModal={setShowTxModal}
    >
      <ProposeSettingsStepper enableTxModal={enableTxModal} />
    </CreateProposalProvider>
  );
};
