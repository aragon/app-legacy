import {ButtonText, ListItemAction} from '@aragon/ui-components';
import Big from 'big.js';
import {BigNumber} from 'ethers';
import {isAddress} from 'ethers/lib/utils';
import React, {useEffect, useState} from 'react';
import {
  FieldError,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import {Trans, useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {fetchBalance, getTokenInfo} from 'utils/tokens';
import {ActionIndex} from 'utils/types';
import {AddressAndTokenRow} from './addressTokenRow';
import {useDaoParam} from 'hooks/useDaoParam';

type MintTokensProps = ActionIndex;

type MintInfo = {
  address: string;
  amount: string;
};

type AddressBalance = {
  address: string;
  balance: BigNumber;
};

const MintTokens: React.FC<MintTokensProps> = ({actionIndex}) => {
  const {t} = useTranslation();

  const {removeAction} = useActionsContext();
  const {setValue, clearErrors, resetField} = useFormContext();

  const handleReset = () => {
    clearErrors(`actions.${actionIndex}`);
    resetField(`actions.${actionIndex}`);
    setValue(`actions.${actionIndex}.inputs.mintTokensToWallets`, []);
  };

  const methodActions = [
    {
      component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
      callback: handleReset,
    },
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => {
        removeAction(actionIndex);
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
      <MintTokenForm actionIndex={actionIndex} />
    </AccordionMethod>
  );
};

export default MintTokens;

type MintTokenFormProps = {
  standAlone?: boolean;
} & ActionIndex;

type MappedError = {
  address?: FieldError;
};

type WatchedFields = [mints: MintInfo[], actionName: string];

export const MintTokenForm: React.FC<MintTokenFormProps> = ({
  actionIndex,
  standAlone = false,
}) => {
  const {t} = useTranslation();
  const {data: dao} = useDaoParam();
  const {isDesktop} = useScreen();

  const {network} = useNetwork();
  const {infura} = useProviders();
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  const {data: daoDetails} = useDaoDetails(dao);
  const {data: daoToken, isLoading: daoTokenLoading} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress || ''
  );

  const {setValue, trigger, formState, control} = useFormContext();

  const {fields, append, remove, update} = useFieldArray({
    name: `actions.${actionIndex}.inputs.mintTokensToWallets`,
  });
  const [mints, actionName]: WatchedFields = useWatch({
    name: [
      `actions.${actionIndex}.inputs.mintTokensToWallets`,
      `actions.${actionIndex}.name`,
    ],
    control,
  });

  const [newTokens, setNewTokens] = useState<Big>(Big(0));
  const [tokenSupply, setTokenSupply] = useState(0);
  const [checkedAddresses, setCheckedAddresses] = useState(
    () => new Set<string>()
  );
  const [newTokenHolders, setNewTokenHolders] = useState(
    () => new Set<string>()
  );
  const [newHoldersCount, setNewHoldersCount] = useState(0);

  /*************************************************
   *                    Hooks                     *
   *************************************************/
  useEffect(() => {
    if (fields.length === 0) {
      append({address: '', amount: '0'});
    }

    if (!actionName) {
      setValue(`actions.${actionIndex}.name`, 'mint_tokens');
    }
  }, [actionIndex, actionName, append, fields.length, setValue]);

  useEffect(() => {
    if (!mints) return;

    const actionErrors =
      formState.errors?.actions?.[`${actionIndex}`].inputs.mintTokensToWallets;

    actionErrors?.forEach((error: MappedError) => {
      if (error?.address) trigger(error.address.ref?.name);
    });
  }, [actionIndex, formState.errors?.actions, trigger, mints]);

  useEffect(() => {
    // Fetching necessary info about the token.
    if (daoToken?.address) {
      getTokenInfo(daoToken.address, infura, nativeCurrency)
        .then((r: Awaited<ReturnType<typeof getTokenInfo>>) => {
          const formattedNumber = parseFloat(
            formatUnits(r.totalSupply, r.decimals)
          );
          setTokenSupply(formattedNumber);
          setValue(
            `actions.${actionIndex}.summary.tokenSupply`,
            formattedNumber
          );
          setValue(
            `actions.${actionIndex}.summary.daoTokenSymbol`,
            daoToken.symbol
          );
          setValue(
            `actions.${actionIndex}.summary.daoTokenAddress`,
            daoToken.address
          );
        })
        .catch(e =>
          console.error('Error happened when fetching token infos: ', e)
        );
    }
  }, [
    daoToken?.address,
    nativeCurrency,
    infura,
    setValue,
    actionIndex,
    daoToken?.symbol,
  ]);

  // Count number of addresses that don't yet own token
  useEffect(() => {
    if (mints && daoToken?.address) {
      // only check rows where form input holds address
      const validInputs = mints.filter(
        m => m.address !== '' && isAddress(m.address)
      );

      // only check addresses that have not previously been checked
      const uncheckedAddresses = validInputs.filter(
        m => !checkedAddresses.has(m.address)
      );

      if (validInputs.length === 0) {
        // user did not input any valid addresses
        setNewHoldersCount(0);
        setValue(`actions.${actionIndex}.summary.newHoldersCount`, 0);
      } else if (uncheckedAddresses.length === 0) {
        // No unchecked address. Simply compare inputs with cached addresses
        const count = mints.filter(m => newTokenHolders.has(m.address)).length;
        setNewHoldersCount(count);
        setValue(`actions.${actionIndex}.summary.newHoldersCount`, count);
      } else {
        // Unchecked address. Fetch balance info for those. Update caches and
        // set number of new holder
        const promises: Promise<AddressBalance>[] = uncheckedAddresses.map(
          (m: MintInfo) =>
            fetchBalance(
              daoToken.address,
              m.address,
              infura,
              nativeCurrency,
              false
            ).then(b => {
              //add address to promise to keep track later
              return {address: m.address, balance: b};
            })
        );
        Promise.all(promises)
          .then((abs: AddressBalance[]) => {
            // new holders are addresses that have 0 balance for token
            const holderAddresses = abs.filter((ab: AddressBalance) =>
              ab.balance.isZero()
            );
            setNewTokenHolders(prev => {
              const temp = new Set(prev);
              holderAddresses.forEach(ha => temp.add(ha.address));
              return temp;
            });
            setCheckedAddresses(prev => {
              const temp = new Set(prev);
              uncheckedAddresses.forEach(ua => temp.add(ua.address));
              return temp;
            });
            // Do not compare addresses with newTokenHolders. Since effects
            // batch state updates, this might not yet reflect the updates done
            // a couple of lines ago.
            const count = mints.filter(m =>
              holderAddresses.some(ab => ab.address === m.address)
            ).length;
            setNewHoldersCount(count);
            setValue(`actions.${actionIndex}.summary.newHoldersCount`, count);
          })
          .catch(e =>
            console.error('Error happened when fetching balances: ', e)
          );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mints, daoToken?.address]);

  useEffect(() => {
    // Collecting token amounts that are to be minted
    if (mints && daoToken) {
      let newTokensCount: Big = Big(0);
      mints.forEach(m => {
        // NOTE: If `m.amount` is not a valid input for `Big` to parse, an error
        // will be thrown. Since Big.js doesn't provide the means to check this
        // beforehand, the try/catch block is necessary.
        try {
          newTokensCount = newTokensCount.plus(Big(m.amount));
        } catch {
          // NOTE: If an input contains an invalid amount, it is simply ignored.
          console.warn(
            'An input contains an invalid amount of tokens to be minted.'
          );
        }
      });

      if (!newTokensCount.eq(newTokens)) {
        setNewTokens(newTokensCount);
        setValue(
          `actions.${actionIndex}.summary.newTokens`,
          '' + newTokensCount
        );
      }
    }
  }, [actionIndex, daoToken, mints, newTokens, setValue]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddWallet = () => {
    append({address: '', amount: '0'});
  };

  const handleClearWallet = (index: number) => {
    update(index, {address: '', amount: mints[index].amount});
  };

  const handleDeleteWallet = (index: number) => {
    remove(index);
    setTimeout(() => {
      trigger(`actions.${actionIndex}.inputs.mintTokensToWallets`);
    }, 450);
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

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <Container standAlone={standAlone}>
      {isDesktop && (
        <div className="flex items-center p-2 tablet:p-3 space-x-2">
          <p className="flex-1 font-bold">
            {t('labels.whitelistWallets.address')}
          </p>
          <p className="flex-1 font-bold">{t('finance.tokens')}</p>
          <p className="flex-1 font-bold" style={{maxWidth: '11ch'}}>
            {t('finance.allocation')}
          </p>
          <div className="w-6" />
        </div>
      )}

      {fields.map((field, index) => {
        return (
          <AddressAndTokenRow
            key={field.id}
            actionIndex={actionIndex}
            fieldIndex={index}
            onClear={handleClearWallet}
            onDelete={handleDeleteWallet}
            newTokenSupply={newTokens.plus(Big(tokenSupply))}
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
          {t('labels.whitelistWallets.uploadCSV')}
          <input
            type="file"
            name="uploadCSV"
            accept=".csv, .txt"
            onChange={handleCSVUpload}
            hidden
          />
        </label>
      </ButtonContainer>
      {!daoTokenLoading && (
        <SummaryContainer>
          <p className="font-bold text-ui-800">{t('labels.summary')}</p>
          <HStack>
            <Label>{t('labels.newTokens')}</Label>
            <p>
              +{'' + newTokens} {daoToken?.symbol}
            </p>
          </HStack>
          <HStack>
            <Label>{t('labels.newHolders')}</Label>
            <p>+{newHoldersCount}</p>
          </HStack>
          <HStack>
            <Label>{t('labels.totalTokens')}</Label>
            {tokenSupply ? (
              <p>
                {'' + newTokens.plus(Big(tokenSupply))} {daoToken?.symbol}
              </p>
            ) : (
              <p>...</p>
            )}
          </HStack>
          {/* TODO add total amount of token holders here. */}
        </SummaryContainer>
      )}
    </Container>
  );
};

export const MintTokenDescription: React.FC = () => (
  <Trans i18nKey="newProposal.mintTokens.methodDescription">
    Which wallet addresses should get tokens, and how many? Add the wallets you
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

const Label = styled.p.attrs({
  className: 'font-normal text-ui-500',
})``;
