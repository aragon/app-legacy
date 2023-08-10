import {
  ButtonText,
  Dropdown,
  IconClose,
  IconCopy,
  IconLinkExternal,
  IconMenuVertical,
  IconSwitch,
  Link,
  ListItemAction,
  ListItemActionProps,
} from '@aragon/ods';
import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {t} from 'i18next';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {chainExplorerAddressLink} from 'utils/constants/chains';
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
  const {network} = useNetwork();
  const {setValue} = useFormContext();

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
            <ButtonText
              iconRight={<IconSwitch />}
              label={
                sc.implementationData
                  ? 'Write as proxy'
                  : "Don't write as proxy"
              }
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
              setValue('selectedSC', sc.address);
              setValue(
                'selectedAction',
                sc.actions.filter(
                  a =>
                    a.type === 'function' &&
                    (a.stateMutability === 'payable' ||
                      a.stateMutability === 'nonpayable')
                )?.[0]
              );
            }
          },
        },
        {
          component: (
            <Link
              external
              type="neutral"
              iconRight={
                <IconLinkExternal height={16} width={16} className="ml-4" />
              }
              href={chainExplorerAddressLink(network, sc.address) + '#code'}
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
              iconRight={<IconCopy height={16} width={16} className="ml-4" />}
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
              iconRight={<IconClose height={16} width={16} className="ml-4" />}
              label={t('scc.detailContract.dropdownRemoveLabel')}
              className="justify-between px-2 mb-2 w-full"
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
      ]}
    />
  );

  const liaProps = {
    title: sc.name,
    subtitle: sc.address,
    bgWhite: true,
    logo: sc.logo,
    iconRight,
  };

  return (
    <ListItemAction {...{...liaProps, ...rest}} iconLeft={liaProps.title} />
  );
};
