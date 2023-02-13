import React, {useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {BalanceMember, MultisigMember} from 'hooks/useDaoMembers';
import {ActionAddAddress, ActionIndex, ActionRemoveAddress} from 'utils/types';
import {CustomHeaderProps, FormItem} from '../addAddresses';
import styled from 'styled-components';
import MinimumApproval from 'components/multisigMinimumApproval/minimumApproval';
import {generateAlert} from 'components/multisigMinimumApproval';
import {CORRECTION_DELAY} from 'utils/constants';
import {Address, Label} from '@aragon/ui-components';

export type CurrentDaoMembers = {
  currentDaoMembers?: MultisigMember[] | BalanceMember[];
};

type UpdateMinimumApprovalProps = ActionIndex &
  CustomHeaderProps &
  CurrentDaoMembers & {currentMinimumApproval?: number};

const UpdateMinimumApproval: React.FC<UpdateMinimumApprovalProps> = ({
  actionIndex,
  useCustomHeader = false,
  currentDaoMembers,
  currentMinimumApproval,
}) => {
  const {t} = useTranslation();

  // form context data & hooks
  const {setValue, control, trigger, getValues} = useFormContext();

  const minimumApprovalKey = `actions.${actionIndex}.inputs.minimumApproval`;

  const minimumApproval = useWatch({
    name: minimumApprovalKey,
    defaultValue: currentMinimumApproval,
    control,
  });

  const [addActionCount, setAddAcctionCount] = useState(-1);
  const [removeActionCount, setRemoveAcctionCount] = useState(-1);

  const totalMembers =
    // Calculate add & remove & existing members
    addActionCount >= 0 ||
    removeActionCount >= 0 ||
    (currentDaoMembers && currentDaoMembers.length > 0)
      ? (currentDaoMembers?.length || 0) + (addActionCount - removeActionCount)
      : 0;

  const actions = useWatch({
    name: 'actions',
    control,
  });

  /*************************************************
   *                    Values                     *
   *************************************************/

  useEffect(() => {
    if (currentMinimumApproval && !minimumApproval) {
      setValue(minimumApprovalKey, currentMinimumApproval);
    }
  }, [currentMinimumApproval, minimumApprovalKey, minimumApproval, setValue]);

  useEffect(() => {
    // find index of actions.
    if (actions && actions.length > 0) {
      const addActionIndex = actions
        .map((action: ActionAddAddress) => action.name)
        .indexOf('add_address');

      const removeActionIndex = actions
        .map((action: ActionRemoveAddress) => action.name)
        .indexOf('remove_address');

      const [newAddedWallet, newRemovedWallet] = getValues([
        `actions.${addActionIndex}.inputs.memberWallets`,
        `actions.${removeActionIndex}.inputs.memberWallets`,
      ]);

      const newAddedWalletCount =
        newAddedWallet?.filter(
          (wallet: {address: Address}) => wallet?.address !== ''
        ).length || 0;

      const newRemovedWalletCount = newRemovedWallet?.length || 0;

      setAddAcctionCount(newAddedWalletCount);
      setRemoveAcctionCount(newRemovedWalletCount);
    }
  }, [actions, getValues]);

  useEffect(() => {
    setValue(`actions.${actionIndex}.name`, 'update_minimum_approval');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // trigger when total members is changed
  useEffect(() => {
    if (removeActionCount !== -1 || addActionCount !== -1)
      trigger(minimumApprovalKey);
  }, [
    addActionCount,
    minimumApprovalKey,
    removeActionCount,
    totalMembers,
    trigger,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const validateMinimalApprovalInput = (value: number) => {
    if (totalMembers === 0) {
      return t('errors.minimumApproval.membersRequired');
    } else if (value < 1) {
      return t('errors.minimumApproval.lessThanOne');
    } else if (value > totalMembers) {
      return t('errors.minimumApproval.exceedMaxThreshold');
    }
  };

  const handleApprovalChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: React.ChangeEventHandler
  ) => {
    const value = Number(event.target.value);
    onChange(event);

    if (value < 1) {
      setTimeout(() => {
        setValue(minimumApprovalKey, 1);
        trigger(minimumApprovalKey);
      }, CORRECTION_DELAY);
    } else if (value > totalMembers) {
      setTimeout(() => {
        setValue(minimumApprovalKey, totalMembers);
        trigger(minimumApprovalKey);
      }, CORRECTION_DELAY);
    }
  };

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <>
      <AccordionMethod
        verified
        type={'action-builder'}
        methodName={t('labels.minimumApproval')}
        smartContractName={t('labels.aragonCore')}
        customHeader={useCustomHeader && <CustomHeader />}
        methodDescription={t('labels.minimumApprovalDescription')}
        additionalInfo={t('labels.minimumApprovalAdditionalInfo')}
      >
        {useCustomHeader && (
          <FormItem
            className={'desktop:block pt-3 pb-1.5 rounded-t-xl border-t'}
          >
            <Label label={t('labels.approvals')} />
          </FormItem>
        )}

        <FormItem>
          <Controller
            name={minimumApprovalKey}
            defaultValue={minimumApproval}
            control={control}
            rules={{
              required: t('errors.minimumApproval.required') as string,
              validate: value => validateMinimalApprovalInput(value),
            }}
            render={({field: {onChange, value}, fieldState: {error}}) => (
              <MinimumApproval
                disabled={totalMembers === 0}
                min={1}
                max={totalMembers}
                value={value}
                onChange={e => handleApprovalChanged(e, onChange)}
                error={generateAlert(value, totalMembers, t, error)}
              />
            )}
          />
        </FormItem>
        {/* Summary */}
        <SummaryContainer>
          <p className={'font-bold text-ui-800'}>{t('labels.summary')}</p>
          <HStack>
            <SummaryLabel>{t('labels.addedMembers')}</SummaryLabel>
            <p>{addActionCount}</p>
          </HStack>
          <HStack>
            <SummaryLabel>{t('labels.removedMembers')}</SummaryLabel>
            <p>{removeActionCount}</p>
          </HStack>
          <HStack>
            <SummaryLabel>{t('labels.totalNewMembers')}</SummaryLabel>
            <p>{totalMembers}</p>
          </HStack>
        </SummaryContainer>
      </AccordionMethod>
    </>
  );
};

export default UpdateMinimumApproval;

const CustomHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className="mb-1.5 space-y-0.5">
      <p className="text-base font-bold text-ui-800">
        {t('labels.minimumApproval')}
      </p>
      <p className="text-sm text-ui-600">
        {t('labels.minimumApprovalDescription')}
      </p>
    </div>
  );
};

const SummaryContainer = styled.div.attrs({
  className:
    'p-2 tablet:p-3 space-y-1.5 font-bold text-ui-800 border border-ui-100 rounded-b-xl border-t-0 bg-white',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const SummaryLabel = styled.p.attrs({
  className: 'font-normal text-ui-500',
})``;
