import React, {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import styled from 'styled-components';

import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
} from 'hooks/usePluginSettings';
import {StringIndexed, SupportedVotingSettings} from 'utils/types';
import SetupMultisigVotingForm from './multisig';
import SetupTokenVotingForm from './tokenVoting';

type Props = {
  pluginSettings: SupportedVotingSettings;
};

const SetupVotingForm: React.FC<Props> = ({pluginSettings}) => {
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
