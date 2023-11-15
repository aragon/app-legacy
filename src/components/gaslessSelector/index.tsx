import {AlertInline, CheckboxListItem} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useCensus3SupportedChains} from '../../hooks/useCensus3';
import {useFormContext} from 'react-hook-form';

/**
 * Type that infers the ControllerRenderProps value prop
 */
// type ValueOfControllerRenderProps<T> = T extends ControllerRenderProps<
//   FieldValues,
//   TName
// >
//   ? T['value']
//   : never;

/**
 * Checkbox used on the DAO creation process.
 *
 * It has a logic to show a `Comming Soon` label when the chainId is not compatible with vocdoni census3 service.
 * @constructor
 */
const GaslessSelector = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();

  const {blockchain} = getValues();

  const isSupported = useCensus3SupportedChains(blockchain.id);

  return (
    <>
      <CheckboxListItem
        label={t('createDAO.step3.blockChainVoting.optionGaslessLabel')}
        helptext={t('createDAO.step3.blockChainVoting.optionGaslessDesc', {
          blockchainName: blockchain.label,
        })}
        onClick={() => {
          onChange('gasless');
        }}
        multiSelect={false}
        disabled={!isSupported}
        {...(value === 'gasless' ? {type: 'active'} : {})}
      />
      {!isSupported && (
        <AlertInline
          label={t('createDAO.step3.votingType.gasless.soon', {
            blockchainName: blockchain.label,
          })}
          mode="neutral"
        />
      )}
    </>
  );
};

export default GaslessSelector;
