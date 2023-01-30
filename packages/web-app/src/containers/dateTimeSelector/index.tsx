import {DateInput, DropdownInput} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {SimplifiedTimeInput} from 'components/inputTime/inputTime';
import {getCanonicalDate, getCanonicalTime} from 'utils/date';

type Props = {
  mode?: 'start' | 'end';
  value: string;
  onUtcClicked: () => void;
  validator: () => string | boolean;
  defaultDateOffset?: number;
};

const DateTimeSelector: React.FC<Props> = ({
  mode,
  value,
  onUtcClicked,
  validator,
  defaultDateOffset = 0,
}) => {
  const {t} = useTranslation();

  const {control} = useFormContext();

  /*************************************************
   *                      Render                   *
   *************************************************/
  return (
    <>
      <SpecificTimeContainer>
        <Controller
          name={`${mode}Date`}
          control={control}
          defaultValue={getCanonicalDate({days: defaultDateOffset})}
          rules={{
            required: t('errors.required.date'),
            validate: validator,
          }}
          render={({field: {name, value, onChange, onBlur}}) => (
            <InputWrapper>
              <LabelWrapper>{t('labels.date')}</LabelWrapper>
              <DateInput
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
              />
            </InputWrapper>
          )}
        />
        <Controller
          name={`${mode}Time`}
          control={control}
          defaultValue={getCanonicalTime({minutes: 10})}
          rules={{
            required: t('errors.required.time'),
            validate: validator,
          }}
          render={({field: {name, value, onChange, onBlur}}) => (
            <InputWrapper>
              <LabelWrapper>{t('labels.time')}</LabelWrapper>
              <SimplifiedTimeInput
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
              />
            </InputWrapper>
          )}
        />
        <InputWrapper>
          <LabelWrapper>{t('labels.timezone')}</LabelWrapper>
          <DropdownInput value={value} onClick={onUtcClicked} />
        </InputWrapper>
      </SpecificTimeContainer>
    </>
  );
};

export default DateTimeSelector;
const InputWrapper = styled.div.attrs({
  className: 'space-y-0.5 w-1/2 tablet:w-full',
})``;

const LabelWrapper = styled.span.attrs({
  className: 'text-sm font-bold text-ui-800 capitalize',
})``;

const SpecificTimeContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-1.5 p-3 bg-ui-0 rounded-xl',
})``;
