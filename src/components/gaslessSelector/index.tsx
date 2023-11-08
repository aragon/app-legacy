import {CheckboxListItem, Tag} from '@aragon/ods-old';
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
      {!isSupported && (
        <div className="flex flex-row-reverse gap-1">
          <Tag
            colorScheme="warning"
            label={t('createDAO.step3.votingType.gasless.soon')}
          />
        </div>
      )}
      <CheckboxListItem
        label={t('createDAO.step3.blockChainVoting.optionGaslessLabel')}
        helptext={t('createDAO.step3.blockChainVoting.optionGaslessDesc')}
        onClick={() => {
          onChange('gasless');
        }}
        multiSelect={false}
        disabled={!isSupported}
        {...(value === 'gasless' ? {type: 'active'} : {})}
      />
    </>
  );
};

export default GaslessSelector;
