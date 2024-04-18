import React from 'react';

import {Loading} from 'components/temporary';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {ProposeSettingsStepper} from '../containers/proposeSettingsStepper/proposeSettingsStepper';

export const ProposeSettings: React.FC = () => {
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (!daoDetails) {
    return null;
  }

  return <ProposeSettingsStepper />;
};
