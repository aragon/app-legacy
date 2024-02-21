import React, {useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {Label} from '@aragon/ods-old';
import {AccordionMethod} from 'components/accordionMethod';
import {generateAlert} from 'components/multisigMinimumApproval';
import MinimumApproval from 'components/multisigMinimumApproval/minimumApproval';
import {DaoMember} from 'hooks/useDaoMembers';
import {CHAIN_METADATA, CORRECTION_DELAY} from 'utils/constants';
import {ActionAddAddress, ActionIndex, ActionRemoveAddress} from 'utils/types';
import {CustomHeaderProps, FormItem} from '../addAddresses';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useNetwork} from 'context/network';

export type CurrentDaoMembers = {
  currentDaoMembers?: DaoMember[];
};

export type UpdateMinimumApprovalProps = ActionIndex &
  CustomHeaderProps &
  CurrentDaoMembers & {currentMinimumApproval?: number; isGasless?: boolean};

const UpdateMinimumApproval: React.FC<UpdateMinimumApprovalProps> = ({
  actionIndex,
  useCustomHeader = false,
  currentDaoMembers,
  currentMinimumApproval,
  isGasless = false,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();

  // form context data & hooks
  const {setValue, control, trigger, getValues} = useFormContext();

  const minimumApprovalKey = isGasless
    ? `committeeMinimumApproval`
    : `actions.${actionIndex}.inputs.minApprovals`;

  const minimumApproval = useWatch({
    name: minimumApprovalKey,
    defaultValue: currentMinimumApproval,
    control,
  });

  const [addActionCount, setAddActionCount] = useState(-1);
  const [removeActionCount, setRemoveActionCount] = useState(-1);

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
          (wallet: {address: string}) => wallet?.address !== ''
        ).length || 0;

      const newRemovedWalletCount = newRemovedWallet?.length || 0;

      setAddActionCount(newAddedWalletCount);
      setRemoveActionCount(newRemovedWalletCount);
    }
  }, [actions, getValues]);

  useEffect(() => {
    if (isGasless) {
      return;
    }
    setValue(`actions.${actionIndex}.name`, 'modify_multisig_voting_settings');
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
        smartContractName={`Multisig v${daoDetails?.plugins[0].release}.${daoDetails?.plugins[0].build}`}
        smartContractAddress={daoDetails?.plugins[0].instanceAddress}
        blockExplorerLink={
          daoDetails?.plugins[0].instanceAddress
            ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.plugins[0].instanceAddress}`
            : undefined
        }
        customHeader={useCustomHeader && <CustomHeader />}
        methodDescription={t('labels.minimumApprovalDescription')}
        additionalInfo={t('labels.minimumApprovalAdditionalInfo')}
      >
        {useCustomHeader && (
          <FormItem
            className={'rounded-t-xl border-t pb-3 pt-6 xl:block'}
            hideBorder={isGasless}
          >
            <Label label={t('labels.approvals')} />
          </FormItem>
        )}

        <FormItem hideBorder={isGasless}>
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
        <SummaryContainer className={isGasless ? 'border-0' : ''}>
          <p className={'font-semibold text-neutral-800'}>
            {t('labels.summary')}
          </p>
          <HStack>
            <SummaryLabel>{t('labels.addedMembers')}</SummaryLabel>
            <p>{addActionCount}</p>
          </HStack>
          <HStack>
            <SummaryLabel>{t('labels.removedMembers')}</SummaryLabel>
            <p>{removeActionCount}</p>
          </HStack>
          <HStack>
            <SummaryLabel>{t('labels.totalMembers')}</SummaryLabel>
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
    <div className="mb-3 space-y-1">
      <p className="text-base font-semibold leading-normal text-neutral-800">
        {t('labels.minimumApproval')}
      </p>
      <p className="text-sm leading-normal text-neutral-600">
        {t('labels.minimumApprovalDescription')}
      </p>
    </div>
  );
};

const SummaryContainer = styled.div.attrs({
  className:
    'p-4 md:p-6 space-y-3 font-semibold text-neutral-800 border border-neutral-100 rounded-b-xl border-t-0 bg-neutral-0',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const SummaryLabel = styled.p.attrs({
  className: 'font-normal text-neutral-500',
})``;
