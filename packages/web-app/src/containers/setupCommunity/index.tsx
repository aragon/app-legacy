import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {AlertCard, CheckboxListItem, Label} from '@aragon/ui-components/src';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import ExistingTokenPartialForm from './addExistingToken';
import CreateNewToken from './createNewToken';
import {WhitelistWallets} from 'components/whitelistWallets';
import {AlertInline} from '@aragon/ui-components';

const SetupCommunityForm: React.FC = () => {
  const {t} = useTranslation();

  const {control, resetField} = useFormContext();
  const isNewToken = useWatch({
    name: 'isCustomToken',
  });
  const membership = useWatch({
    name: 'membership',
  });

  const resetTokenFields = () => {
    resetField('tokenName');
    resetField('tokenSymbol');
    resetField('tokenAddress');
    resetField('tokenTotalSupply');
    resetField('whitelistWallets');
    resetField('wallets');
  };

  return (
    <>
      {/* Eligibility */}
      <FormItem>
        <Label label={t('labels.membership')} />
        <Controller
          name="membership"
          control={control}
          defaultValue="token"
          render={({field: {onChange, value}}) => (
            <>
              <CheckboxListItem
                label={t('createDAO.step3.tokenMembership')}
                helptext={t('createDAO.step3.tokenMembershipSubtitle')}
                multiSelect={false}
                onClick={() => {
                  resetTokenFields();
                  onChange('token');
                }}
                {...(value === 'token' ? {type: 'active'} : {})}
              />

              <CheckboxListItem
                label={t('createDAO.step3.walletMemberShip')}
                helptext={t('createDAO.step3.walletMemberShipSubtitle')}
                onClick={() => {
                  resetTokenFields();
                  onChange('wallet');
                }}
                multiSelect={false}
                {...(value === 'wallet' ? {type: 'active'} : {})}
              />
            </>
          )}
        />
      </FormItem>

      {/* Token creation */}
      {/* TODO: when validating, the two list items should be either wrapped in a component that takes care of the state
        or manually call setValue() onChange and get rid of the controller so that required validation can be done
      */}

      {/* Membership type */}
      {/* for some reason the default value of the use form is not setting up correctly
      and is initialized to null or '' so the condition cannot be membership === 'token'  */}
      {membership !== 'wallet' && (
        <FormItem>
          <Label label={t('labels.communityToken')} />
          <Controller
            name="isCustomToken"
            defaultValue={null}
            control={control}
            render={({field: {onChange, value}}) => (
              <CheckboxListItem
                label={t('createDAO.step3.newToken')}
                helptext={t('createDAO.step3.newTokenSubtitle')}
                multiSelect={false}
                onClick={() => {
                  resetTokenFields();
                  onChange(true);
                }}
                type={value ? 'active' : 'default'}
              />
            )}
          />
          <Controller
            control={control}
            name="isCustomToken"
            defaultValue={null}
            render={({field: {onChange, value}}) => (
              <CheckboxListItem
                label={t('createDAO.step3.existingToken')}
                helptext={t('createDAO.step3.existingTokenSubtitle')}
                type={value === false ? 'active' : 'default'}
                multiSelect={false}
                onClick={() => {
                  onChange(false);
                  resetTokenFields();
                }}
              />
            )}
          />
        </FormItem>
      )}
      {membership === 'wallet' && (
        <FormItem>
          <Label
            label={t('labels.authorisedWallets')}
            helpText={t('createDAO.step3.authorisedWalletsSubtitle')}
            renderHtml
          />
          <AlertCard
            mode="warning"
            title={t('createDAO.step3.warningTitle')}
            helpText={t('createDAO.step3.warningSubtitle')}
          />
          <AlertInline
            label={t('createDAO.step3.whiteListWalletAlertText')}
            mode="neutral"
          />
          <WhitelistWallets />
        </FormItem>
      )}

      {/* Add existing token */}

      {isNewToken === true && membership === 'token' && <CreateNewToken />}

      {isNewToken === false && membership === 'token' && (
        <ExistingTokenPartialForm />
      )}
    </>
  );
};

export default SetupCommunityForm;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
