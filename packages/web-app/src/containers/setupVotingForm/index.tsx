import React, {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  usePluginSettings,
} from 'hooks/usePluginSettings';
import {StringIndexed} from 'utils/types';
import SetupMultisigVotingForm from './multisig';
import SetupTokenVotingForm from './tokenVoting';

const SetupVotingForm: React.FC = () => {
  /*************************************************
   *                    STATE                      *
   *************************************************/
  const {data: daoId} = useDaoParam();

  const {data: daoDetails, isLoading: detailsLoading} = useDaoDetails(daoId!);
  const {data: pluginSettings, isLoading: settingsLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {setError, clearErrors} = useFormContext();

  /*************************************************
   *                    Render                     *
   *************************************************/
  useEffect(() => {
    if (Object.keys(pluginSettings).length === 0) {
      setError('areSettingsLoading', {});
    } else {
      clearErrors('areSettingsLoading');
    }
  }, [clearErrors, pluginSettings, setError]);

  if (
    detailsLoading ||
    settingsLoading ||
    Object.keys(pluginSettings).length === 0
  ) {
    return <Loading />;
  }

  // Display plugin screens
  if (isTokenVotingSettings(pluginSettings)) {
    return <SetupTokenVotingForm pluginSettings={pluginSettings} />;
  } else if (isMultisigVotingSettings(pluginSettings)) {
    return <SetupMultisigVotingForm />;
  }

  // TODO: We need an error output/boundary for when a network error occurs
  return null;
};

export default SetupVotingForm;

/**
 * Check if the screen is valid
 * @param errors List of fields that have errors
 * @param durationSwitch Duration switch value
 * @returns Whether the screen is valid
 */
export function isValid(errors: StringIndexed) {
  return !(
    errors.startDate ||
    errors.startTime ||
    errors.endDate ||
    errors.endTime ||
    errors.areSettingsLoading
  );
}

export const FormSection = styled.div.attrs({
  className: 'space-y-1.5',
})``;
