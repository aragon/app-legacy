import {Dropdown, Label, ListItemAction} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {StateEmpty} from 'components/stateEmpty';
import ManageWalletsModal from 'containers/manageWalletsModal';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {ActionIndex} from 'utils/types';
import {CustomHeaderProps, FormItem} from '../addAddresses';
import AccordionSummary from '../addAddresses/accordionSummary';
import {AddressRow} from '../addAddresses/addressRow';
import {useAlertContext} from 'context/alert';
import {CurrentDaoMembers} from '../updateMinimumApproval';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';

type RemoveAddressesProps = ActionIndex &
  CustomHeaderProps &
  CurrentDaoMembers & {allowRemove?: boolean; borderless?: boolean};

// README: when uploading CSV be sure to check for duplicates

const RemoveAddresses: React.FC<RemoveAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
  currentDaoMembers,
  allowRemove = true,
  borderless,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {removeAction} = useActionsContext();
  const {alert} = useAlertContext();
  const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();

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

  function handleResetAll() {
    replace([]);
    alert(t('alert.chip.resetAction'));
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
      methodName={t('labels.removeWallets')}
      smartContractName={`Multisig v${daoDetails?.plugins[0].release}.${daoDetails?.plugins[0].build}`}
      smartContractAddress={daoDetails?.plugins[0].instanceAddress}
      blockExplorerLink={
        daoDetails?.plugins[0].instanceAddress
          ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.plugins[0].instanceAddress}`
          : undefined
      }
      methodDescription={t('labels.removeWalletsDescription')}
      dropdownItems={methodActions}
      customHeader={useCustomHeader && <CustomHeader />}
    >
      {!memberWallets || memberWallets.length === 0 ? (
        <FormItem
          className={`py-6 ${
            useCustomHeader ? 'rounded-xl border-t' : 'rounded-b-xl'
          }`}
          hideBorder={borderless}
        >
          <StateEmpty
            type="Object"
            mode="inline"
            object="WALLET"
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
            className={`hidden xl:block ${
              useCustomHeader ? 'rounded-t-xl border-t pb-3 pt-6' : 'py-3'
            }`}
            hideBorder={borderless}
          >
            <StateEmpty
              type="Object"
              mode="inline"
              object="WALLET"
              title={t('labels.whitelistWallets.noWallets')}
              secondaryButton={{
                label: t('labels.selectWallet'),
                onClick: () => open('manageWallet'),
              }}
            />
          </FormItem>
          {controlledWallets.map((field, fieldIndex) => (
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
                isRemove
                key={field.id}
                actionIndex={actionIndex}
                fieldIndex={fieldIndex}
                dropdownItems={rowActions}
              />
            </FormItem>
          ))}
          <FormItem className="flex justify-between" hideBorder={borderless}>
            <Button
              variant="tertiary"
              size="lg"
              onClick={() => open('manageWallet')}
            >
              {t('labels.selectWallet')}
            </Button>

            <Dropdown
              side="bottom"
              align="start"
              sideOffset={4}
              trigger={
                <Button
                  size="lg"
                  variant="tertiary"
                  iconLeft={IconType.DOTS_VERTICAL}
                  data-testid="trigger"
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
              ]}
            />
          </FormItem>
          <AccordionSummary total={controlledWallets.length} />
        </>
      )}

      <ManageWalletsModal
        addWalletCallback={handleAddSelectedWallets}
        wallets={currentDaoMembers?.map(member => member.address) || []}
        initialSelections={controlledWallets.map(field => field.address)}
      />
    </AccordionMethod>
  );
};

export default RemoveAddresses;

const CustomHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className="mb-3 space-y-1">
      <p className="text-base font-semibold leading-normal text-neutral-800">
        {t('labels.removeWallets')}
      </p>
      <p className="text-sm leading-normal text-neutral-600">
        {t('labels.removeWalletsDescription')}
      </p>
    </div>
  );
};
