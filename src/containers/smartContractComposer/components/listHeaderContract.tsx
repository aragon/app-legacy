import {
  Dropdown,
  IconClose,
  IconCopy,
  IconLinkExternal,
  IconMenuVertical,
  IconSwitch,
  Link,
  ListItemAction,
  ListItemActionProps,
  shortenAddress,
} from '@aragon/ods-old';
import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {chainExplorerAddressLink} from 'utils/constants/chains';
import {handleClipboardActions} from 'utils/library';
import {SmartContract} from 'utils/types';
import {SccFormData} from '..';
import {useTranslation} from 'react-i18next';

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
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {setValue, getValues} = useFormContext<SccFormData>();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contracts = getValues('contracts');

  const listItems = [
    {
      component: (
        <Link
          external
          type="neutral"
          iconRight={
            <IconLinkExternal height={16} width={16} className="ml-8" />
          }
          href={chainExplorerAddressLink(network, sc.address) + '#code'}
          label={t('scc.detailContract.dropdownExplorerLinkLabel', {
            address: sc.address,
          })}
          className="my-1 w-full justify-between px-4"
        />
      ),
      callback: () => {},
    },
    {
      component: (
        <Link
          external
          type="neutral"
          iconRight={<IconCopy height={16} width={16} className="ml-8" />}
          label={t('scc.detailContract.dropdownCopyLabel')}
          className="my-1 w-full justify-between px-4"
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
          iconRight={<IconClose height={16} width={16} className="ml-8" />}
          label={t('scc.detailContract.dropdownRemoveLabel')}
          className="my-1 w-full justify-between px-4"
        />
      ),
      callback: () => {
        if (sc.implementationData) {
          onRemoveContract(sc.proxyAddress as string);
        } else {
          onRemoveContract(sc.address);
        }
      },
    },
  ];

  if (sc.proxyAddress || sc.implementationData) {
    listItems.unshift({
      component: (
        <Link
          external
          type="neutral"
          label={
            sc.implementationData
              ? t('scc.writeProxy.dropdownWriteAsProxyLabel')
              : t('scc.writeProxy.dropdownDontWriteLabel')
          }
          iconRight={<IconSwitch />}
          className="my-1 w-full justify-between px-4"
        />
      ),
      callback: () => {
        if (sc.implementationData) {
          setValue('selectedSC', sc.implementationData as SmartContract);
          setValue(
            'selectedAction',
            (sc.implementationData as SmartContract).actions.filter(
              a =>
                a.type === 'function' &&
                (a.stateMutability === 'payable' ||
                  a.stateMutability === 'nonpayable')
            )?.[0]
          );
        } else {
          const contract = contracts.filter(
            c => c.address === sc.proxyAddress
          )[0];
          setValue('selectedSC', contract);
          setValue(
            'selectedAction',
            contract.actions.filter(
              a =>
                a.type === 'function' &&
                (a.stateMutability === 'payable' ||
                  a.stateMutability === 'nonpayable')
            )?.[0]
          );
        }
      },
    });
  }

  const iconRight = (
    <Dropdown
      align="start"
      trigger={
        <button>
          <IconMenuVertical />
        </button>
      }
      sideOffset={8}
      listItems={listItems}
    />
  );

  const liaProps = {
    title: sc.name,
    subtitle: sc.proxyAddress
      ? `${t('scc.listContracts.proxyContractAddressLabel', {
          contractAddress: shortenAddress(sc.address),
        })}`
      : shortenAddress(sc.address),
    bgWhite: true,
    logo: sc.logo,
    iconRight,
  };

  return (
    <ListItemAction
      {...{...liaProps, ...rest}}
      iconLeft={liaProps.title}
      truncateText
    />
  );
};
