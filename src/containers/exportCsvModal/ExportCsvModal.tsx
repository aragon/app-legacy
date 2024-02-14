import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useForm, useWatch, Controller} from 'react-hook-form';
import {saveAs} from 'file-saver';
import {DateInput, Label} from '@aragon/ods-old';
import {Button, AlertInline, IconType} from '@aragon/ods';
import {DaoDetails} from '@aragon/sdk-client';

import {getCanonicalDate} from 'utils/date';
import {StateEmpty} from 'components/stateEmpty';
import {Transfer, Deposit, Withdraw} from 'utils/types';
import {TransferTypes} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {useGlobalModalContext} from 'context/globalModals';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';

interface ExportCsvModalProps {
  transfers: Transfer[];
  daoDetails: DaoDetails | null | undefined;
}

interface TransferCsvEntity {
  Txhash: string;
  UnixTimestamp: string | number;
  DateTime: string;
  Type: string;
  From: string;
  To: string;
  Token: string;
  Quantity: string;
  USDvalue: string;
  ProposalId: string;
}

const ExportCsvModal: React.FC<ExportCsvModalProps> = ({
  transfers,
  daoDetails,
}) => {
  const {t} = useTranslation();
  const {isOpen, close} = useGlobalModalContext('exportCsv');

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      startDate: getCanonicalDate({days: 30}, true),
      endDate: getCanonicalDate(),
    },
  });

  const [startDate, endDate] = useWatch({
    name: ['startDate', 'endDate'],
    control: form.control,
  });

  const isCsvGenerationLoading = false;
  const [csvBlob, setCsvBlob] = useState<Blob | undefined>();
  const [isCsvGenerationError, setIsCsvGenerationError] = useState(false);
  const [isCsvGenerationSuccess, setIsCsvGenerationSuccess] = useState(false);
  const [isFlowFinished, setIsFlowFinished] = useState(false);

  const selectedTransfers = useMemo(() => {
    const startDateTimestamp = new Date(startDate).valueOf();
    const endDateTimestamp = new Date(endDate).valueOf() + 86399999; // End of the day

    return transfers
      .filter(item => {
        const transferDateTimeStamp =
          Number(item.transferTimestamp) ||
          new Date(item.transferDate).valueOf();

        return (
          transferDateTimeStamp >= startDateTimestamp &&
          transferDateTimeStamp <= endDateTimestamp
        );
      })
      .sort((transferA, transferB) => {
        // Latest transfers last
        const transferATimestamp =
          Number(transferA.transferTimestamp) ||
          new Date(transferA.transferDate).valueOf();

        const transferBTimestamp =
          Number(transferB.transferTimestamp) ||
          new Date(transferB.transferDate).valueOf();

        return transferATimestamp > transferBTimestamp
          ? -1
          : transferATimestamp < transferBTimestamp
          ? 1
          : 0;
      });
  }, [endDate, startDate, transfers]);

  const csvData = useMemo(() => {
    if (!selectedTransfers.length) return '';

    const dataEntities: TransferCsvEntity[] = selectedTransfers.map(item => {
      const transferDateTimeStamp =
        Number(item.transferTimestamp) || new Date(item.transferDate).valueOf();

      const daoAccount =
        toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address || '-';

      return {
        Txhash: item.transaction,
        UnixTimestamp: String(Math.floor(transferDateTimeStamp / 1000)),
        DateTime: new Date(transferDateTimeStamp)
          .toUTCString()
          .split(',')
          .join(' '),
        Type:
          item.transferType === TransferTypes.Deposit
            ? 'deposit'
            : item.transferType === TransferTypes.Withdraw
            ? 'withdraw'
            : '-',
        From: (item as Deposit)?.sender || daoAccount,
        To: (item as Withdraw)?.to || daoAccount,
        Token: item.tokenSymbol,
        Quantity: item.tokenAmount,
        USDvalue: item.usdValue,
        ProposalId: (item as Withdraw)?.proposalId?.toString() || '-',
      };
    });

    const delimiter = ',';

    const contents = dataEntities.reduce(
      (prev, curr) => (prev += Object.values(curr).join(delimiter) + '\n'),
      ''
    );

    const headers = Object.keys(dataEntities[0]).join(delimiter);

    return `${headers}\n${contents}`;
  }, [daoDetails?.address, daoDetails?.ensDomain, selectedTransfers]);

  const createCsvBlob = useCallback(() => {
    try {
      const result = new Blob([csvData], {type: 'text/csv;charset=utf-8;'});
      setCsvBlob(result);
      setIsCsvGenerationError(false);
      setIsCsvGenerationSuccess(true);
    } catch (e) {
      setIsCsvGenerationError(true);
    }
  }, [csvData]);

  const downloadCsvFile = useCallback(async () => {
    if (!csvBlob) return;

    try {
      const fileName = `export-txns-${Math.floor(
        Date.now() / 1000
      )}-${getCanonicalDate().split('-').join('')}.csv`;

      await saveAs(csvBlob, fileName);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFlowFinished(true);
    }
  }, [csvBlob, setIsFlowFinished]);

  const handleClose = useCallback(() => {
    setCsvBlob(undefined);
    setIsCsvGenerationError(false);
    setIsCsvGenerationSuccess(false);
    setIsFlowFinished(false);
    close();
  }, [close]);

  const handleFlowFinish = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={handleClose}
      title={isFlowFinished ? '' : t('finance.modalExport.headerLabel')}
      subtitle={isFlowFinished ? '' : t('finance.modalExport.headerDesc')}
    >
      {isFlowFinished ? (
        <StateEmpty
          customCardPaddingClassName="p-6"
          type="Object"
          object="success"
          mode="card"
          title={t('finance.modalExport.feedback.title')}
          description={t('finance.modalExport.feedback.desc')}
          primaryButton={{
            label: t('finance.modalExport.ctaLabelContinue'),
            className: 'w-full',
            onClick: handleFlowFinish,
          }}
        />
      ) : (
        <Container>
          <div />
          <BodyWrapper>
            <form className="space-y-3">
              <FormItem>
                <Label label={t('labels.startDate')} />
                <Controller
                  name="startDate"
                  control={form.control}
                  defaultValue={getCanonicalDate({days: 30}, true)}
                  rules={{
                    required: t('errors.required.date'),
                  }}
                  render={({field: {name, value, onChange, onBlur}}) => (
                    <DateInput
                      name={name}
                      value={value}
                      onChange={onChange}
                      disabled={
                        isCsvGenerationLoading || isCsvGenerationSuccess
                      }
                      onBlur={onBlur}
                    />
                  )}
                />
              </FormItem>

              <FormItem>
                <Label label={t('labels.endDate')} />
                <Controller
                  name="endDate"
                  control={form.control}
                  defaultValue={getCanonicalDate()}
                  rules={{
                    required: t('errors.required.date'),
                  }}
                  render={({field: {name, value, onChange, onBlur}}) => (
                    <DateInput
                      name={name}
                      value={value}
                      onChange={onChange}
                      disabled={
                        isCsvGenerationLoading || isCsvGenerationSuccess
                      }
                      onBlur={onBlur}
                    />
                  )}
                />
              </FormItem>
            </form>

            <div className="space-y-4">
              {isCsvGenerationSuccess ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={downloadCsvFile}
                >
                  {t('finance.modalExport.ctaLabelSave')}
                </Button>
              ) : isCsvGenerationError ? (
                <Button
                  variant={isCsvGenerationLoading ? 'primary' : 'secondary'}
                  state={isCsvGenerationLoading ? 'loading' : undefined}
                  iconLeft={
                    isCsvGenerationLoading ? undefined : IconType.RELOAD
                  }
                  size="lg"
                  className="w-full"
                  onClick={createCsvBlob}
                >
                  {isCsvGenerationLoading
                    ? t('finance.modalExport.ctaLabelGenerating')
                    : t('finance.modalExport.ctaLabelRetry')}
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-4 xl:flex-row">
                  <Button
                    variant={isCsvGenerationLoading ? 'primary' : 'secondary'}
                    state={
                      isCsvGenerationError
                        ? 'disabled'
                        : isCsvGenerationLoading
                        ? 'loading'
                        : undefined
                    }
                    size="lg"
                    className="w-full"
                    onClick={createCsvBlob}
                  >
                    {t('finance.modalExport.ctaLabelGenerateCSV')}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={handleClose}
                  >
                    {t('labels.cancel')}
                  </Button>
                </div>
              )}

              {isCsvGenerationError && (
                <div className="flex justify-center text-center">
                  <AlertInline
                    message={t('finance.modalExport.alertCritical')}
                    variant="critical"
                  />
                </div>
              )}

              {isCsvGenerationSuccess && (
                <div className="flex justify-center text-center">
                  <AlertInline
                    message={t('finance.modalExport.statusSuccess')}
                    variant="success"
                  />
                </div>
              )}
            </div>
          </BodyWrapper>
        </Container>
      )}
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-6',
})``;

const BodyWrapper = styled.div.attrs({
  className: 'space-y-6',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;

export default ExportCsvModal;
