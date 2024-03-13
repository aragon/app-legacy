import React from 'react';
import {
  Link,
  ListItemAction,
  ListItemActionProps,
  shortenAddress,
} from '@aragon/ods-old';
import {Icon, IconType, Dropdown} from '@aragon/ods';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {chainExplorerAddressLink} from 'utils/constants/chains';
import {handleClipboardActions} from 'utils/library';
import {SmartContract} from 'utils/types';
import {SccFormData} from '..';

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
    <Link
      key={0}
      external
      type="neutral"
      iconRight={IconType.LINK_EXTERNAL}
      href={chainExplorerAddressLink(network, sc.address) + '#code'}
      label={t('scc.detailContract.dropdownExplorerLinkLabel', {
        address: sc.address,
      })}
      className="my-2 w-full justify-between px-4"
    />,
    <Link
      key={1}
      external
      type="neutral"
      iconRight={IconType.COPY}
      label={t('scc.detailContract.dropdownCopyLabel')}
      className="my-2 w-full justify-between px-4"
      onClick={() => {
        handleClipboardActions(sc.address, () => {}, alert);
      }}
    />,
    <Link
      key={2}
      external
      type="neutral"
      iconRight={IconType.CLOSE}
      label={t('scc.detailContract.dropdownRemoveLabel')}
      className="my-2 w-full justify-between px-4"
      onClick={() => {
        if (sc.implementationData) {
          onRemoveContract(sc.proxyAddress as string);
        } else {
          onRemoveContract(sc.address);
        }
      }}
    />,
  ];

  if (sc.proxyAddress || sc.implementationData) {
    listItems.unshift(
      <Link
        key={3}
        external
        type="neutral"
        label={
          sc.implementationData
            ? t('scc.writeProxy.dropdownWriteAsProxyLabel')
            : t('scc.writeProxy.dropdownDontWriteLabel')
        }
        iconRight={IconType.BLOCKCHAIN_SMARTCONTRACT}
        className="my-2 w-full justify-between px-4"
        onClick={() => {
          if (sc.implementationData) {
            setValue('writeAsProxy', true);
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
            setValue('writeAsProxy', false);
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
        }}
      />
    );
  }

  const iconRight = (
    <Dropdown.Container
      align="start"
      customTrigger={
        <button>
          <Icon icon={IconType.DOTS_VERTICAL} />
        </button>
      }
    >
      {listItems}
    </Dropdown.Container>
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
