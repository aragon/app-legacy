import React from 'react';
import {Loading} from 'components/temporary';
import {EditMvSettings} from 'containers/editSettings/majorityVoting';
import {EditMsSettings} from 'containers/editSettings/multisig';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {GaselessPluginName, PluginTypes} from 'hooks/usePluginClient';
import {EditGaslessSetings} from '../containers/editSettings/GaslessVoting';

export const EditSettings: React.FC = () => {
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();

  const pluginType = daoDetails?.plugins[0].id as PluginTypes;

  if (detailsAreLoading) {
    return <Loading />;
  } else if (!daoDetails) {
    return null;
  } else if (pluginType === 'multisig.plugin.dao.eth') {
    return <EditMsSettings daoDetails={daoDetails} />;
  } else if (
    pluginType === 'token-voting.plugin.dao.eth' ||
    pluginType === GaselessPluginName
  ) {
    return <EditMvSettings daoDetails={daoDetails} />;
  } else {
    return <></>;
  }
};
