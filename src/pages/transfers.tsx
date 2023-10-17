import {
  ButtonGroup,
  ButtonIcon,
  Dropdown,
  IconAdd,
  IconMenuVertical,
  ListItemAction,
  Option,
} from '@aragon/ods-old';
import {Locale, format} from 'date-fns';
import * as Locales from 'date-fns/locale';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import TransferList from 'components/transferList';
import {PageWrapper, TransferSectionWrapper} from 'components/wrappers';
import {useGlobalModalContext} from 'context/globalModals';
import {useTransactionDetailContext} from 'context/transactionDetail';
import useCategorizedTransfers from 'hooks/useCategorizedTransfers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {TransferTypes} from 'utils/constants';
import {Transfer} from 'utils/types';
import ExportCsvModal from 'containers/exportCsvModal/ExportCsvModal';

export const Transfers: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {t, i18n} = useTranslation();
  const {handleTransferClicked} = useTransactionDetailContext();

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();
  const {data: categorizedTransfers, totalTransfers} = useCategorizedTransfers(
    daoDetails?.address ?? ''
  );

  const [filterValue, setFilterValue] = useState<string>();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleButtonGroupChange = (selected: string) => {
    const val = selected === 'all' ? undefined : selected;
    setFilterValue(val);
  };

  const filterValidator = useCallback(
    (transfer: Transfer) =>
      filterValue == null || transfer.transferType === filterValue,
    [filterValue]
  );

  const displayedTransfers = useMemo(
    () => ({
      week: categorizedTransfers.week.filter(filterValidator),
      month: categorizedTransfers.month.filter(filterValidator),
      year: categorizedTransfers.year.filter(filterValidator),
    }),
    [
      categorizedTransfers.week,
      categorizedTransfers.month,
      categorizedTransfers.year,
      filterValidator,
    ]
  );

  const noTransfers = useMemo(
    () =>
      categorizedTransfers.week.length === 0 &&
      categorizedTransfers.month.length === 0 &&
      categorizedTransfers.year.length === 0,
    [
      categorizedTransfers.month.length,
      categorizedTransfers.week.length,
      categorizedTransfers.year.length,
    ]
  );

  if (isLoading) {
    return <Loading />;
  }

  const dropdownActions = [
    {
      component: <ListItemAction title={t('label.exportCSV')} bgWhite />,
      callback: () => {
        // Otherwise modal doesn't open proper;y on desktop
        setTimeout(() => {
          open('exportCsv');
        }, 100);
      },
    },
  ];

  /**
   * Note: We can add a nested iterator for both sections and transfer cards
   */
  return (
    <>
      <ExportCsvModal
        daoDetails={daoDetails}
        transfers={[
          ...categorizedTransfers.year,
          ...categorizedTransfers.month,
          ...categorizedTransfers.week,
        ]}
      />
      <PageWrapper
        title={t('TransferModal.allTransfers')}
        description={`${totalTransfers} Total Volume`}
        primaryBtnProps={{
          label: t('TransferModal.newTransfer'),
          iconLeft: <IconAdd />,
          onClick: () => open('transfer'),
        }}
      >
        <div className="mt-6 xl:mt-16">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <ButtonGroup
                bgWhite
                defaultValue="all"
                onChange={handleButtonGroupChange}
              >
                <Option value="all" label={t('labels.all')} />
                <Option
                  value={TransferTypes.Deposit}
                  label={t('labels.deposit')}
                />
                <Option
                  value={TransferTypes.Withdraw}
                  label={t('labels.withdraw')}
                />
                {/* <Option
                  value="externalContract"
                  label={t('labels.externalContract')}
                /> */}
              </ButtonGroup>

              {!noTransfers && (
                <Dropdown
                  side="bottom"
                  align="end"
                  listItems={dropdownActions}
                  disabled={dropdownActions.length === 0}
                  trigger={
                    <ButtonIcon
                      mode="secondary"
                      size="medium"
                      icon={<IconMenuVertical />}
                    />
                  }
                />
              )}
            </div>
          </div>
          {noTransfers ? (
            <SectionContainer>
              <p>{t('allTransfer.noTransfers')}</p>
            </SectionContainer>
          ) : (
            <>
              {displayedTransfers.week.length > 0 && (
                <SectionContainer>
                  <TransferSectionWrapper title={t('allTransfer.thisWeek')}>
                    <div className="my-4 space-y-1.5 border-solid">
                      <TransferList
                        transfers={displayedTransfers.week}
                        onTransferClick={handleTransferClicked}
                      />
                    </div>
                  </TransferSectionWrapper>
                </SectionContainer>
              )}
              {displayedTransfers.month.length !== 0 && (
                <SectionContainer>
                  <TransferSectionWrapper
                    title={format(new Date(), 'MMMM', {
                      locale: (Locales as {[key: string]: Locale})[
                        i18n.language
                      ],
                    })}
                  >
                    <div className="my-4 space-y-1.5 border-solid">
                      <TransferList
                        transfers={displayedTransfers.month}
                        onTransferClick={handleTransferClicked}
                      />
                    </div>
                  </TransferSectionWrapper>
                </SectionContainer>
              )}
              {displayedTransfers.year.length !== 0 && (
                <SectionContainer>
                  <TransferSectionWrapper title={format(new Date(), 'yyyy')}>
                    <div className="my-4 space-y-1.5 border-solid">
                      <TransferList
                        transfers={displayedTransfers.year}
                        onTransferClick={handleTransferClicked}
                      />
                    </div>
                  </TransferSectionWrapper>
                </SectionContainer>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

const SectionContainer = styled.div.attrs({className: 'my-6 xl:my-10'})``;
