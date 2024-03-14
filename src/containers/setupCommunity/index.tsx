import {CheckboxListItem, Label} from '@aragon/ods-old';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {MultisigWallets} from 'components/multisigWallets';
import {FormSection} from 'containers/setupVotingForm';
import {ToggleCheckList} from 'containers/setupVotingForm/multisig';
import {CreateDaoFormData} from 'utils/types';
import AddExistingToken from './addExistingToken';
import CreateNewToken from './createNewToken';
import {featureFlags} from '../../utils/featureFlags';
import GaslessSelector from '../../components/gaslessSelector';
import {
  GASLESS_SUPPORTED_NETWORKS,
  getSupportedNetworkByChainId,
} from 'utils/constants';

const SetupCommunityForm: React.FC = () => {
  const {t} = useTranslation();

  const {control, resetField, setValue, getValues} =
    useFormContext<CreateDaoFormData>();
  const [membership, isCustomToken] = useWatch({
    control,
    name: ['membership', 'isCustomToken'],
  });

  const {blockchain} = getValues();

  const existingTokenItems = [
    // No mean It's a custom Token so It should be true
    {
      label: t('labels.no'),
      selectValue: true,
    },
    // Yes mean It's not a custom Token should be false
    {label: t('labels.yes'), selectValue: false},
  ];

  let showGaslessVoting = false;
  const network = getSupportedNetworkByChainId(blockchain.id);
  if (network) {
    showGaslessVoting = !!(
      membership === 'token' &&
      featureFlags.getValue('VITE_FEATURE_FLAG_GASLESS_PLUGIN') === 'true' &&
      GASLESS_SUPPORTED_NETWORKS.includes(network)
    );
  }

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
    newMembership: CreateDaoFormData['membership'],
    onChange: (...event: unknown[]) => void
  ) => {
    // reset opposite fields and set default eligibility for
    // proposal creation
    if (newMembership !== membership) {
      resetTokenFields();
      resetMultisigFields();
      setValue('votingType', 'onChain');

      if (newMembership === 'token') {
        setValue('eligibilityType', 'token');
      } else {
        setValue('eligibilityType', 'multisig');
      }
      onChange(newMembership);
    }
  };

  return (
    <>
      {/* Eligibility */}
      <FormItem>
        <Label label={t('createDAO.step3.membership')} />
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
            </>
          )}
        />
      </FormItem>

      {showGaslessVoting && (
        <FormSection>
          <Label label={t('createDAO.step3.blockChainVoting.label')} />
          <Controller
            name="votingType"
            rules={{required: 'Validate'}}
            control={control}
            defaultValue="onChain"
            render={({field: {onChange, value}}) => (
              <>
                <CheckboxListItem
                  label={t(
                    'createDAO.step3.blockChainVoting.optionOnchainLabel',
                    {blockchainName: blockchain.label}
                  )}
                  helptext={t(
                    'createDAO.step3.blockChainVoting.optionOnchainDesc',
                    {blockchainName: blockchain.label}
                  )}
                  multiSelect={false}
                  onClick={() => {
                    onChange('onChain');
                  }}
                  {...(value === 'onChain' ? {type: 'active'} : {})}
                />
                <GaslessSelector
                  onChange={() => {
                    onChange('gasless');
                  }}
                  value={value}
                />
              </>
            )}
          />
        </FormSection>
      )}

      {membership === 'multisig' && (
        <FormItem>
          <MultisigWallets />
        </FormItem>
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
  className: 'space-y-3',
})``;
