import {ButtonText, ListItemAction} from '@aragon/ui-components';
import {Trans, useTranslation} from 'react-i18next';
import {useFieldArray, useFormContext} from 'react-hook-form';
import React, {useEffect} from 'react';
import styled from 'styled-components';

import {useActionsContext} from 'context/actions';
import {AccordionMethod} from 'components/accordionMethod';
import useScreen from 'hooks/useScreen';
import {AddressAndTokenRow} from './addressTokenRow';

type Props = {
  index: number;
};

const MintTokens: React.FC<Props> = ({index}) => {
  const {t} = useTranslation();

  const {removeAction, duplicateAction} = useActionsContext();
  const {setValue} = useFormContext();

  const handleReset = () => {
    setValue(`actions.${index}.inputs.mintTokensToWallets`, []);
  };

  const methodActions = [
    {
      component: <ListItemAction title={t('labels.duplicateAction')} bgWhite />,
      callback: () => duplicateAction(index),
    },
    {
      component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
      callback: handleReset,
    },
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => {
        removeAction(index);
      },
    },
  ];

  return (
    <AccordionMethod
      type="action-builder"
      methodName={t('labels.mintTokens')}
      smartContractName={t('labels.aragonCore')}
      verified
      methodDescription={<MintTokenDescription />}
      additionalInfo={t('newProposal.mintTokens.additionalInfo')}
      dropdownItems={methodActions}
    >
      <MintTokenForm actionIndex={index} />
    </AccordionMethod>
  );
};

export default MintTokens;

export const MintTokenForm: React.FC<{
  actionIndex: number;
  standAlone?: boolean;
}> = ({actionIndex, standAlone = false}) => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const {fields, append, remove} = useFieldArray({
    name: `actions.${actionIndex}.inputs.mintTokensToWallets`,
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({address: '', amount: '0'});
    }
  }, [append, fields.length]);

  const handleAddWallet = () => {
    append({address: '', amount: '0'});
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const myFile = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const csvData = reader.result;
        if (csvData) {
          const lines = (csvData as string).split('\n');
          for (let i = 0; i < lines.length; i++) {
            const tuple = lines[i].split(',');
            if (tuple[0] === 'Address' && tuple[1] === 'Tokens' && i === 0) {
              continue;
            }
            if (tuple[0] && tuple[1]) {
              append({address: tuple[0], amount: tuple[1]});
            }
          }
        }
      };

      reader.readAsBinaryString(myFile);
    }
  };

  return (
    <Container standAlone={standAlone}>
      {isDesktop && (
        <div
          className="flex items-center p-2 tablet:p-3"
          style={{paddingRight: 'calc(12ch + 80px)'}}
        >
          <p className="flex-1 font-bold">Address</p>
          <p className="flex-1 font-bold">Tokens</p>
        </div>
      )}

      {fields.map((field, index) => {
        return (
          <AddressAndTokenRow
            key={field.id}
            actionIndex={actionIndex}
            fieldIndex={index}
            onDelete={index => remove(index)}
          />
        );
      })}

      <ButtonContainer>
        <ButtonText
          label={t('labels.addWallet')}
          mode="secondary"
          size="large"
          bgWhite
          className="flex-1 tablet:flex-initial"
          onClick={handleAddWallet}
        />

        <label className="flex-1 tablet:flex-initial py-1.5 px-2 space-x-1.5 h-6 font-bold hover:text-primary-500 bg-ui-0 rounded-xl cursor-pointer ft-text-base">
          Upload CSV
          <input
            type="file"
            name="uploadCSV"
            accept=".csv, .txt"
            onChange={handleCSVUpload}
            hidden
          />
        </label>
      </ButtonContainer>

      <SummaryContainer>
        <p>Summary</p>
        <HStack>
          <SummaryLabel>New Tokens</SummaryLabel>
          <p>+8000 LRX</p>
        </HStack>
        <HStack>
          <SummaryLabel>New Holders</SummaryLabel>
          <p>+2</p>
        </HStack>
        <HStack>
          <SummaryLabel>Total Tokens</SummaryLabel>
          <p>100,000 LRX</p>
        </HStack>
        <HStack>
          <SummaryLabel>Total Holders</SummaryLabel>
          <p>1000</p>
        </HStack>
      </SummaryContainer>
    </Container>
  );
};

const MintTokenDescription: React.FC = () => (
  <Trans i18nKey="newProposal.mintTokens.methodDescription">
    Which wallet addresses should get tokens, and how much? Add the wallets you
    want here, and then choose the distribution. Upload a CSV with
    <a
      href="data:text/csv;base64,QWRkcmVzcyxUb2tlbnMKMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwLDEwLjUw"
      download="MintTokenTemplate.csv"
      className="font-bold text-primary-500 hover:text-primary-700 rounded focus:ring-2 focus:ring-primary-500 focus:outline-none"
    >
      this template
    </a>{' '}
    if you want.
  </Trans>
);

const Container = styled.div.attrs<{standAlone: boolean}>(({standAlone}) => ({
  className: `bg-white border divide-y border-ui-100 divide-ui-100 ${
    standAlone ? 'rounded-xl' : 'rounded-b-xl border-t-0'
  }`,
}))<{standAlone: boolean}>``;

const ButtonContainer = styled.div.attrs({
  className:
    'flex justify-between tablet:justify-start p-2 tablet:p-3 space-x-2',
})``;

const SummaryContainer = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-1.5 font-bold text-ui-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const SummaryLabel = styled.p.attrs({
  className: 'font-normal text-ui-500',
})``;
