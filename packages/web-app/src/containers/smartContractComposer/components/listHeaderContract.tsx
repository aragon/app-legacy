import {
  Dropdown,
  IconClose,
  IconCopy,
  IconFeedback,
  IconMenuVertical,
  Link,
  ListItemAction,
  ListItemActionProps,
} from '@aragon/ui-components';
import {useAlertContext} from 'context/alert';
import {t} from 'i18next';
import React from 'react';
import {handleClipboardActions} from 'utils/library';
import {SmartContract} from 'utils/types';

type Props = Partial<ListItemActionProps> & {
  sc: SmartContract;
  onRemoveContract: (address: string) => void;
};

export const ListHeaderContract: React.FC<Props> = ({
  sc,
  onRemoveContract,
  ...rest
}) => {
  const {alert} = useAlertContext();

  const iconRight = (
    <Dropdown
      align="start"
      trigger={
        <button>
          <IconMenuVertical />
        </button>
      }
      sideOffset={8}
      listItems={[
        {
          component: (
            <Link
              external
              type="neutral"
              iconRight={
                <IconFeedback height={13} width={13} className="ml-4" />
              }
              href={`https://etherscan.io/address/${sc.address}#code`}
              label={t('scc.detailContract.dropdownExplorerLinkLabel', {
                address: sc.address,
              })}
              className="justify-between px-2 mt-2 w-full"
            />
          ),
          callback: () => {},
        },
        {
          component: (
            <Link
              external
              type="neutral"
              iconRight={<IconCopy height={13} width={13} className="ml-4" />}
              label={t('scc.detailContract.dropdownCopyLabel')}
              className="justify-between px-2 my-2 w-full"
            />
          ),
          callback: () => {
            handleClipboardActions(sc.address, () => {}, alert);
          },
        },
        {
          component: (
            <Link
              external
              type="neutral"
              iconRight={<IconClose height={13} width={13} className="ml-4" />}
              label={t('scc.detailContract.dropdownRemoveLabel')}
              className="justify-between px-2 mb-2 w-full"
            />
          ),
          callback: () => {
            onRemoveContract(sc.address);
          },
        },
      ]}
    />
  );

  const liaProps = {
    title: sc.name,
    subtitle: t('scc.listContracts.contractAmountActions', {
      amount: sc.actions
        .filter(
          a =>
            a.type === 'function' &&
            (a.stateMutability === 'payable' ||
              a.stateMutability === 'nonpayable')
        )
        .length.toString(),
    }),
    bgWhite: true,
    logo: sc.logo,
    iconRight,
  };

  return (
    <ListItemAction {...{...liaProps, ...rest}} iconLeft={liaProps.title} />
  );
};
