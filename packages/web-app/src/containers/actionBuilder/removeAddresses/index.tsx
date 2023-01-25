import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
} from '@aragon/ui-components';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {StateEmpty} from 'components/stateEmpty';
import ManageWalletsModal from 'containers/manageWalletsModal';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {ActionIndex} from 'utils/types';
import {CustomHeaderProps, FormItem} from '../addAddresses';
import AccordionSummary from '../addAddresses/accordionSummary';
import {AddressRow} from '../addAddresses/addressRow';
import {useAlertContext} from 'context/alert';

type RemoveAddressesProps = ActionIndex & CustomHeaderProps;

// README: when uploading CSV be sure to check for duplicates

const RemoveAddresses: React.FC<RemoveAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {removeAction} = useActionsContext();
  const {alert} = useAlertContext();

  // dao data
  const {data: dao} = useDaoParam();
  const {data} = useDaoMembers(dao, 'multisig.plugin.dao.eth');

  // form context data & hooks
  const {control, setValue} = useFormContext();
  const membersListKey = `actions.${actionIndex}.inputs.memberWallets`;
  const {fields, replace, remove} = useFieldArray({
    control,
    name: membersListKey,
  });

  const memberWallets = useWatch({name: membersListKey, control});
  const controlledWallets = fields.map((field, ctrlledIndex) => {
    return {
      ...field,
      ...(memberWallets && {...memberWallets[ctrlledIndex]}),
    };
  });

  useEffect(() => {
    setValue(`actions.${actionIndex}.name`, 'remove_address');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  // handles modal Select wallets button
  const handleAddSelectedWallets = (wallets: Array<string>) => {
    replace(wallets.map(address => ({address})));
  };

  // Action Handlers
  function handleRowDelete(rowIndex: number) {
    remove(rowIndex);
  }

  function handleDeleteAll() {
    replace([]);
    alert(t('alert.chip.removedAllAddresses'));
  }

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

  const methodActions = [
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => {
        removeAction(actionIndex);
        alert(t('alert.chip.removedAction'));
      },
    },
  ];

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <>
      <AccordionMethod
        verified
        type="action-builder"
        methodName={t('labels.removeWallets')}
        smartContractName={t('labels.aragonCore')}
        methodDescription={t('labels.removeWalletsDescription')}
        dropdownItems={methodActions}
        customHeader={useCustomHeader && <CustomHeader />}
      >
        {!memberWallets || memberWallets.length === 0 ? (
          <FormItem
            className={`pt-3 pb-3 ${
              useCustomHeader ? 'rounded-xl border-t' : 'rounded-b-xl'
            }`}
          >
            <StateEmpty
              type="Object"
              mode="inline"
              object="wallet"
              title={t('labels.whitelistWallets.noWallets')}
              secondaryButton={{
                label: t('labels.selectWallet'),
                onClick: () => open('manageWallet'),
              }}
            />
          </FormItem>
        ) : (
          <>
            <FormItem
              className={`hidden desktop:block ${
                useCustomHeader ? 'rounded-t-xl border-t pt-3 pb-1.5' : 'py-1.5'
              }`}
            >
              <Label label={t('labels.whitelistWallets.address')} />
            </FormItem>
            {controlledWallets.map((field, fieldIndex) => (
              <FormItem
                key={field.id}
                className={`${
                  fieldIndex === 0 &&
                  'rounded-t-xl border-t desktop:rounded-none desktop:border-t-0'
                }`}
              >
                <div className="desktop:hidden mb-0.5 desktop:mb-0">
                  <Label label={t('labels.whitelistWallets.address')} />
                </div>
                <AddressRow
                  isRemove
                  key={field.id}
                  actionIndex={actionIndex}
                  fieldIndex={fieldIndex}
                  dropdownItems={rowActions}
                />
              </FormItem>
            ))}
            <FormItem className="flex justify-between">
              <ButtonText
                label={t('labels.selectWallet')}
                mode="secondary"
                size="large"
                bgWhite
                onClick={() => open('manageWallet')}
              />

              <Dropdown
                side="bottom"
                align="start"
                sideOffset={4}
                trigger={
                  <ButtonIcon
                    size="large"
                    mode="secondary"
                    icon={<IconMenuVertical />}
                    data-testid="trigger"
                    bgWhite
                  />
                }
                listItems={[
                  {
                    component: (
                      <ListItemAction
                        title={t('labels.whitelistWallets.deleteAllEntries')}
                        bgWhite
                      />
                    ),
                    callback: handleDeleteAll,
                  },
                  {
                    component: (
                      <ListItemAction
                        title={t('labels.whitelistWallets.uploadCSV')}
                        bgWhite
                        mode="disabled"
                      />
                    ),
                    // TODO: This needs to be added later
                    callback: () => {},
                  },
                ]}
              />
            </FormItem>
            <AccordionSummary total={controlledWallets.length} />
          </>
        )}

        <ManageWalletsModal
          addWalletCallback={handleAddSelectedWallets}
          wallets={data.members.map(member => member.address) || []}
          initialSelections={controlledWallets.map(field => field.address)}
        />
      </AccordionMethod>
    </>
  );
};

export default RemoveAddresses;

const CustomHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className="mb-1.5 space-y-0.5">
      <p className="text-base font-bold text-ui-800">
        {t('labels.removeWallets')}
      </p>
      <p className="text-sm text-ui-600">
        {t('labels.removeWalletsDescription')}
      </p>
    </div>
  );
};
