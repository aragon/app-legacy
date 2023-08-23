import {CheckboxListItem, Label} from '@aragon/ods';
import React, {useEffect} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {MultisigEligibility} from 'components/multisigEligibility';
import {MultisigWallets} from 'components/multisigWallets';
import {FormSection} from 'containers/setupVotingForm';
import {ToggleCheckList} from 'containers/setupVotingForm/multisig';
import {CreateDaoFormData} from 'utils/types';
import AddExistingToken from './addExistingToken';
import CreateNewToken from './createNewToken';

const SetupCommunityForm: React.FC = () => {
  const {t} = useTranslation();

  const {control, resetField, setValue} = useFormContext<CreateDaoFormData>();
  const [membership, isCustomToken] = useWatch({
    control,
    name: ['membership', 'isCustomToken'],
  });

  const existingTokenItems = [
    // No mean It's a custom Token so It should be true
    {
      label: t('labels.no'),
      selectValue: true,
    },
    // Yes mean It's not a custom Token should be false
    {label: t('labels.yes'), selectValue: false},
  ];

  useEffect(() => {
    if (membership === 'token') {
      setValue('eligibilityType', 'token');
    } else if (membership === 'multisig') {
      setValue('eligibilityType', 'multisig');
    }
  }, [membership, setValue]);

  const resetTokenFields = () => {
    resetField('tokenName');
    resetField('tokenSymbol');
    resetField('tokenAddress');
    resetField('tokenTotalSupply');
    resetField('wallets');
  };

  const resetMultisigFields = () => {
    resetField('multisigWallets');
  };

  const handleCheckBoxSelected = (
    membership: CreateDaoFormData['membership'],
    onChange: (...event: unknown[]) => void
  ) => {
    if (membership === 'token') {
      resetMultisigFields();
    } else {
      resetTokenFields();
    }
    onChange(membership);
  };

  return (
    <>
      {/* Eligibility */}
      <FormItem>
        <Label label={t('createDAO.step3.membership') as string} />
        <Controller
          name="membership"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="token"
          render={({field: {onChange, value}}) => (
            <>
              <CheckboxListItem
                label={t('createDAO.step3.tokenMembership')}
                helptext={t('createDAO.step3.tokenMembershipSubtitle')}
                multiSelect={false}
                onClick={() => handleCheckBoxSelected('token', onChange)}
                {...(value === 'token' ? {type: 'active'} : {})}
              />

              <CheckboxListItem
                label={t('createDAO.step3.multisigMembership')}
                helptext={t('createDAO.step3.multisigMembershipSubtitle')}
                onClick={() => handleCheckBoxSelected('multisig', onChange)}
                multiSelect={false}
                {...(value === 'multisig' ? {type: 'active'} : {})}
              />

              {/* Address List Dao has been disabled */}
              {/* <CheckboxListItem
                  label={t('createDAO.step3.walletMemberShip')}
                  helptext={t('createDAO.step3.walletMemberShipSubtitle')}
                  onClick={() => {
                    resetTokenFields();
                    onChange('wallet');
                  }}
                  multiSelect={false}
                  {...(value === 'wallet' ? {type: 'active'} : {})}
                /> */}
            </>
          )}
        />
      </FormItem>

      {membership === 'multisig' && (
        <>
          <FormItem>
            <MultisigWallets />
          </FormItem>
          <FormItem>
            <MultisigEligibility />
          </FormItem>
        </>
      )}

      {/* Token creation */}
      {/* TODO: when validating, the two list items should be either wrapped in a component that takes care of the state
        or manually call setValue() onChange and get rid of the controller so that required validation can be done
      */}

      {/* Membership type */}
      {/* for some reason the default value of the use form is not setting up correctly
      and is initialized to null or '' so the condition cannot be membership === 'token'  */}
      {membership === 'token' && (
        <>
          <FormSection>
            <Label label={t('createDAO.step3.existingToken.questionLabel')} />
            <Controller
              name="isCustomToken"
              rules={{required: 'Validate'}}
              control={control}
              defaultValue={true}
              render={({field: {value, onChange}}) => (
                <ToggleCheckList
                  items={existingTokenItems}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormSection>
          {isCustomToken ? <CreateNewToken /> : <AddExistingToken />}
        </>
      )}
    </>
  );
};

export default SetupCommunityForm;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
