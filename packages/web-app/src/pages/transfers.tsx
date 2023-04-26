import {ButtonGroup, IconAdd, Option, SearchInput} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
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

const Transfers: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {t, i18n} = useTranslation();
  const {handleTransferClicked} = useTransactionDetailContext();

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();
  const {data: categorizedTransfers, totalTransfers} = useCategorizedTransfers(
    daoDetails?.address ?? ''
  );

  const [filterValue, setFilterValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleButtonGroupChange = (selected: string) => {
    const val = selected === 'all' ? '' : selected;
    setFilterValue(val);
  };

  const filterValidator = useCallback(
    (transfer: Transfer) => {
      let returnValue = true;
      let matchesFilter = true;
      let matchesSearch = true;
      if (filterValue !== '') {
        matchesFilter = Boolean(transfer.transferType === filterValue);
      }
      if (searchValue !== '') {
        const re = new RegExp(searchValue, 'i');
        matchesSearch = Boolean(
          transfer?.title.match(re) ||
            transfer.tokenSymbol.match(re) ||
            transfer.tokenAmount.match(re)
        );
      }
      returnValue = matchesFilter && matchesSearch;
      return returnValue;
    },
    [searchValue, filterValue]
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

  /**
   * Note: We can add a nested iterator for both sections and transfer cards
   */
  return (
    <>
      <PageWrapper
        title={t('TransferModal.allTransfers')}
        description={`${totalTransfers} Total Volume`}
        primaryBtnProps={{
          label: t('TransferModal.newTransfer'),
          iconLeft: <IconAdd />,
          onClick: () => open(),
        }}
      >
        <div className="mt-3 desktop:mt-8">
          <div className="space-y-1.5">
            <SearchInput
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchValue(e.target.value)
              }
              placeholder={t('placeHolders.searchTransfers')}
            />
            <div className="flex">
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
                    <div className="my-2 space-y-1.5 border-solid">
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
                    <div className="my-2 space-y-1.5 border-solid">
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
                    <div className="my-2 space-y-1.5 border-solid">
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

export default withTransaction('Transfers', 'component')(Transfers);
const SectionContainer = styled.div.attrs({className: 'my-3 desktop:my-5'})``;
