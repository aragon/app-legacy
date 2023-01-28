import {VotingSettings} from '@aragon/sdk-client';
import {AlertInline, CheckboxListItem, Label} from '@aragon/ui-components';
import {toDate} from 'date-fns-tz';
import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import Duration from 'containers/duration';
import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {
  daysToMills,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  getFormattedUtcOffset,
  hoursToMills,
  minutesToMills,
} from 'utils/date';
import {StringIndexed} from 'utils/types';
import SetupMultisigVotingForm from './multisig';

type UtcInstance = 'first' | 'second';

const SetupVotingForm: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {
    control,
    setValue,
    getValues,
    setError,
    formState,
    clearErrors,
    resetField,
  } = useFormContext();
  const endDateType = useWatch({
    name: 'durationSwitch',
  });

  /*************************************************
   *                    STATE & EFFECT             *
   *************************************************/
  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const [utcStart, setUtcStart] = useState('');
  const [utcEnd, setUtcEnd] = useState('');

  const {data: daoId} = useDaoParam();
  const {data: daoDetails} = useDaoDetails(daoId!);
  const {data} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  // TODO: fix when implementing multisig
  const daoSettings = data as VotingSettings;
  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);

  /*************************************************
   *                    Render                     *
   *************************************************/

  return <SetupMultisigVotingForm />;
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
    errors.ednTime ||
    errors.areSettingsLoading
  );
}

export const FormSection = styled.div.attrs({
  className: 'space-y-1.5',
})``;
