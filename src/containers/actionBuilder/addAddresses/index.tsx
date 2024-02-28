import {Label, ListItemAction} from '@aragon/ods-old';
import {Button, IconType, Dropdown} from '@aragon/ods';
import React, {useCallback, useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import {ActionIndex} from 'utils/types';
import AccordionSummary from './accordionSummary';
import {AddressRow, CustomRowValidator} from './addressRow';
import {useAlertContext} from 'context/alert';
import {DaoMember} from 'hooks/useDaoMembers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';

export type CustomHeaderProps = {
  useCustomHeader?: boolean;
};

export type CurrentDaoMembers = {
  currentDaoMembers?: DaoMember[];
};

type AddAddressesProps = ActionIndex &
  CustomHeaderProps &
  CurrentDaoMembers & {
    allowRemove?: boolean;
    customRowValidator?: CustomRowValidator;
    borderless?: boolean;
  };

const AddAddresses: React.FC<AddAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
  currentDaoMembers,
  allowRemove = true,
  customRowValidator,
  borderless,
}) => {
  const {t} = useTranslation();
  const {removeAction} = useActionsContext();
  const {alert} = useAlertContext();
  const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();

  // form context
  const {control, trigger, setValue} = useFormContext();
  const memberListKey = `actions.${actionIndex}.inputs.memberWallets`;
  const memberWallets = useWatch({
    name: memberListKey,
    control,
  });

  const {fields, update, replace, append, remove} = useFieldArray({
    control,
    name: memberListKey,
  });

  const controlledWallets = fields.map((field, ctrlledIndex) => {
    return {
      ...field,
      ...(memberWallets && {...memberWallets[ctrlledIndex]}),
    };
  });

  /*************************************************
   *                Hooks & Effects                *
   *************************************************/
  useEffect(() => {
    if (controlledWallets.length === 0) {
      replace({address: '', ensName: ''});
    }

    setValue(`actions.${actionIndex}.name`, 'add_address');
  }, [actionIndex, replace, controlledWallets.length, setValue]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  // if there are more than one address, trigger validation
  // to fix duplicate address error
  const validateFields = useCallback(() => {
    if (controlledWallets.length > 1) {
      setTimeout(() => {
        trigger(memberListKey);
      }, 50);
    }
  }, [controlledWallets.length, memberListKey, trigger]);

  // add empty wallet
  const handleAdd = useCallback(() => {
    append({address: '', ensName: ''});
    setTimeout(() => {
      trigger(
        `actions.${actionIndex}.inputs.memberWallets.${controlledWallets.length}`
      );
    }, 50);
  }, [actionIndex, append, controlledWallets.length, trigger]);

  // remove single row
  const handleRowDelete = useCallback(
    (index: number) => {
      remove(index);
      validateFields();
    },
    [remove, validateFields]
  );

  // remove all rows
  const handleDeleteAll = useCallback(() => {
    remove();
    alert(t('alert.chip.removedAllAddresses'));
  }, [alert, remove, t]);

  // reset single row
  const handleRowClear = useCallback(() => {
    validateFields();
  }, [validateFields]);

  // reset all rows
  const handleResetAll = useCallback(() => {
    controlledWallets.forEach((_, index) => {
      update(index, {address: '', ensName: ''});
    });
    alert(t('alert.chip.resetAction'));
  }, [alert, controlledWallets, t, update]);

  // TODO: extract actions out of component
  // separating this because rows sometimes don't have the same actions
  const rowActions = [
    {
      component: (
        <ListItemAction
          title={t('labels.whitelistWallets.deleteEntry')}
          bgWhite
        />
      ),
      callback: (rowIndex: number) => {
        handleRowDelete(rowIndex);
        alert(t('alert.chip.removedAddress'));
      },
    },
  ];

  const methodActions = (() => {
    const result = [
      <Dropdown.Item onClick={handleResetAll} key={0}>
        {t('labels.resetAction')}
      </Dropdown.Item>,
    ];

    if (allowRemove) {
      result.push(
        <Dropdown.Item
          onClick={() => {
            removeAction(actionIndex);
            alert(t('alert.chip.removedAction'));
          }}
          key={1}
        >
          {t('labels.removeEntireAction')}
        </Dropdown.Item>
      );
    }

    return result;
  })();

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <AccordionMethod
      verified
      type="action-builder"
      methodName={t('labels.addWallets')}
      smartContractName={`Multisig v${daoDetails?.plugins[0].release}.${daoDetails?.plugins[0].build}`}
      smartContractAddress={daoDetails?.plugins[0].instanceAddress}
      blockExplorerLink={
        daoDetails?.plugins[0].instanceAddress
          ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.plugins[0].instanceAddress}`
          : undefined
      }
      methodDescription={t('labels.addWalletsDescription')}
      dropdownItems={methodActions}
      customHeader={useCustomHeader && <CustomHeader />}
    >
      <FormItem
        className={`hidden xl:block ${
          useCustomHeader ? 'rounded-t-xl border-t pb-3 pt-6' : 'py-3'
        }`}
        hideBorder={borderless}
      >
        <Label label={t('labels.whitelistWallets.address')} />
      </FormItem>
      {controlledWallets.map((field, fieldIndex) => {
        return (
          <FormItem
            key={field.id}
            className={`${
              fieldIndex === 0 &&
              'rounded-t-xl border-t xl:rounded-[0px] xl:border-t-0'
            }`}
            hideBorder={borderless}
          >
            <div className="mb-1 xl:mb-0 xl:hidden">
              <Label label={t('labels.whitelistWallets.address')} />
            </div>
            <AddressRow
              actionIndex={actionIndex}
              fieldIndex={fieldIndex}
              dropdownItems={rowActions}
              onClearRow={handleRowClear}
              onBlur={validateFields}
              currentDaoMembers={currentDaoMembers}
              customRowValidator={customRowValidator}
            />
          </FormItem>
        );
      })}
      <FormItem className="flex justify-between" hideBorder={borderless}>
        <Button variant="tertiary" size="lg" onClick={handleAdd}>
          {t('labels.addWallet')}
        </Button>
        <Dropdown.Container
          align="start"
          customTrigger={
            <Button
              size="lg"
              variant="tertiary"
              iconLeft={IconType.DOTS_VERTICAL}
              data-testid="trigger"
            />
          }
        >
          <Dropdown.Item onClick={handleResetAll}>
            {t('labels.whitelistWallets.resetAllEntries')}
          </Dropdown.Item>
          <Dropdown.Item onClick={handleDeleteAll}>
            {t('labels.whitelistWallets.deleteAllEntries')}
          </Dropdown.Item>
        </Dropdown.Container>
      </FormItem>
      <AccordionSummary
        total={controlledWallets.filter(wallet => wallet.address).length}
        borderless={borderless}
      />
    </AccordionMethod>
  );
};

export default AddAddresses;

const CustomHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className="mb-3 space-y-1">
      <p className="text-base font-semibold leading-normal text-neutral-800">
        {t('labels.addWallets')}
      </p>
      <p className="text-sm leading-normal text-neutral-600">
        {t('labels.addWalletsDescription')}
      </p>
    </div>
  );
};

export const FormItem = styled.div.attrs<{hideBorder?: boolean}>(props => ({
  // Use a ternary operator to conditionally apply class names based on the showBorder prop
  className: `px-6 py-3 bg-neutral-0 ${
    props.hideBorder ? 'border-t-0 ' : 'border border-neutral-100 border-t-0'
  }`,
}))``;
