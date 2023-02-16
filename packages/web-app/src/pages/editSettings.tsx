import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';

import {Loading} from 'components/temporary';
import {EditMvSettings} from 'containers/editSettings/majorityVoting';
import {EditMsSettings} from 'containers/editSettings/multisig';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';

const EditSettings: React.FC = () => {
  const {data: daoId, isLoading: paramsAreLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );

  const pluginType = daoDetails?.plugins[0].id as PluginTypes;

  if (paramsAreLoading || detailsAreLoading) {
    return <Loading />;
  } else if (pluginType === 'multisig.plugin.dao.eth') {
    return <EditMsSettings daoId={daoId!} daoDetails={daoDetails!} />;
  } else if (pluginType === 'token-voting.plugin.dao.eth') {
    return <EditMvSettings daoId={daoId!} daoDetails={daoDetails!} />;
  } else {
    return <></>;
  }
};

export default withTransaction('EditSettings', 'component')(EditSettings);
