import {ButtonText, ListItemAction} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {ActionIndex} from 'utils/types';
import {ActionCalldata, CustomActionSpec} from 'utils/customActions';
import {SchemaSubmitForm} from '@restspace/schema-form';
import {TextInput} from 'utils/schemaForm/textInput';
import {IComponentMap} from '@restspace/schema-form/build/components/schema-form-interfaces';
import {useFormContext} from 'react-hook-form';
import {transformation} from 'utils/transformation/transformation';

type CustomActionProps = ActionIndex & {
  allowRemove?: boolean;
  customAction: CustomActionSpec;
};

const CustomAction: React.FC<CustomActionProps> = ({
  actionIndex,
  allowRemove = true,
  customAction,
}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  const {removeAction} = useActionsContext();
  const {setValue} = useFormContext();
  const value = {};

  const methodActions = (() => {
    const result = [
      {
        component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
        callback: () => {},
      },
    ];

    if (allowRemove) {
      result.push({
        component: (
          <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
        ),
        callback: () => {
          removeAction(actionIndex);
          alert(t('alert.chip.removedAction'));
        },
      });
    }

    return result;
  })();

  const onSubmit = async (value: object) => {
    // transform user inputs to get call data info
    const actionCalldata = transformation(
      customAction.transform,
      value
    ) as ActionCalldata[];
    setValue(`actions.${actionIndex}.name`, 'custom_action');

    const action = actionCalldata[0];

    setValue(`actions.${actionIndex}.contractName`, action.contractName);
    setValue(`actions.${actionIndex}.contractAddress`, action.contractAddress);
    setValue(`actions.${actionIndex}.functionName`, action.functionName);

    action.inputs.forEach((inp, idx) => {
      setValue(`actions.${actionIndex}.inputs.${idx}.name`, inp.name);
      setValue(`actions.${actionIndex}.inputs.${idx}.type`, inp.type);
      setValue(`actions.${actionIndex}.inputs.${idx}.value`, inp.value);
    });

    return true;
  };

  const makeSubmitLink = (
    onClick: React.MouseEventHandler<HTMLButtonElement>
  ) => (
    <ButtonContainer>
      <ButtonText label="Submit" size="large" onClick={onClick} type="button" />
    </ButtonContainer>
  );

  const components: IComponentMap = {
    string: TextInput,
    textarea: TextInput,
  };

  return (
    <Container standAlone={false}>
      <AccordionMethod
        type="action-builder"
        methodName={customAction.title}
        smartContractName={t('labels.aragonOSx')}
        verified
        methodDescription={customAction.description}
        dropdownItems={methodActions}
      >
        <SummaryContainer>
          <SchemaSubmitForm
            schema={customAction.schema}
            value={value}
            makeSubmitLink={makeSubmitLink}
            components={components}
            onSubmit={onSubmit}
          />
        </SummaryContainer>
      </AccordionMethod>
    </Container>
  );
};

export default CustomAction;

const Container = styled.div.attrs<{standAlone: boolean}>(({standAlone}) => ({
  className: `bg-neutral-0 border divide-y border-neutral-100 divide-neutral-100 ${
    standAlone ? 'rounded-xl' : 'rounded-b-xl border-t-0'
  }`,
}))<{standAlone: boolean}>``;

const ButtonContainer = styled.div.attrs({
  className: 'flex justify-between md:justify-start p-4 md:p-6 space-x-4',
})``;

const SummaryContainer = styled.div.attrs({
  className: 'p-4 md:p-6 space-y-3 font-semibold text-neutral-800',
})``;
