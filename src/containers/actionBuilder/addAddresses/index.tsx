import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  Label,
  ListItemAction,
} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
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
  };

const AddAddresses: React.FC<AddAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
  currentDaoMembers,
  allowRemove = true,
  customRowValidator,
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
      {
        component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
        callback: handleResetAll,
      },
    ];

    if (allowRemove) {
      result.push({
        component: (
          <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
        ),
        callback: () => {
          removeAction(actionIndex);
          alert(t('alert.chip.removedAction'));
        },
      });
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
      <FormItem className="flex justify-between">
        <ButtonText
          label={t('labels.addWallet')}
          mode="secondary"
          size="large"
          bgWhite
          onClick={handleAdd}
        />

        <Dropdown
          side="bottom"
          align="start"
          sideOffset={4}
          trigger={
            <ButtonIcon
              size="large"
              mode="secondary"
              icon={<Icon icon={IconType.MENU_VERTICAL} />}
              data-testid="trigger"
              bgWhite
            />
          }
          listItems={[
            {
              component: (
                <ListItemAction
                  title={t('labels.whitelistWallets.resetAllEntries')}
                  bgWhite
                />
              ),
              callback: handleResetAll,
            },
            {
              component: (
                <ListItemAction
                  title={t('labels.whitelistWallets.deleteAllEntries')}
                  bgWhite
                />
              ),
              callback: handleDeleteAll,
            },
          ]}
        />
      </FormItem>
      <AccordionSummary
        total={controlledWallets.filter(wallet => wallet.address).length}
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

export const FormItem = styled.div.attrs({
  className: 'px-6 py-3 bg-neutral-0 border border-neutral-100 border-t-0' as
    | string
    | undefined,
})``;
