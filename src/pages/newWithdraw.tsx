import React, {useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Loading} from 'components/temporary';
import {ActionsProvider} from 'context/actions';
import {CreateProposalProvider} from 'context/createProposal';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import WithdrawStepper from 'containers/withdrawStepper';
import {WithdrawFormData} from 'utils/types';

const defaultValues = {
  links: [{name: '', url: ''}],
  startSwitch: 'now',
  durationSwitch: 'duration',
  actions: [],
};

export const NewWithdraw: React.FC = () => {
  const [showTxModal, setShowTxModal] = useState(false);

  const {data: daoDetails, isLoading: detailsLoading} = useDaoDetailsQuery();
  const {data: pluginSettings, isLoading: settingsLoading} = useVotingSettings({
    pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    pluginType: daoDetails?.plugins[0].id as PluginTypes,
  });

  const formMethods = useForm<WithdrawFormData>({
    defaultValues,
    mode: 'onChange',
  });

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (detailsLoading || settingsLoading) {
    return <Loading />;
  }

  if (!daoDetails || !pluginSettings) {
    return null;
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <ActionsProvider daoId={daoDetails.address}>
          <CreateProposalProvider
            showTxModal={showTxModal}
            setShowTxModal={setShowTxModal}
          >
            <WithdrawStepper
              daoDetails={daoDetails}
              pluginSettings={pluginSettings}
              enableTxModal={() => setShowTxModal(true)}
            />
          </CreateProposalProvider>
        </ActionsProvider>
      </FormProvider>
    </>
  );
};
