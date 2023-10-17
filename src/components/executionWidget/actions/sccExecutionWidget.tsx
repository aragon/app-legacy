/* eslint-disable @typescript-eslint/no-explicit-any */
import {AccordionMethod} from 'components/accordionMethod';
import {ComponentForTypeWithFormProvider} from 'containers/smartContractComposer/components/inputForm';
import React from 'react';
import styled from 'styled-components';
import {Input} from 'utils/types';

export const SCCExecutionCard: React.FC<{
  action: any;
}> = ({action}) => {
  return (
    <AccordionMethod
      type="execution-widget"
      methodName={action.functionName}
      smartContractName={action.contractName}
      verified
    >
      <Container>
        {action.inputs?.length > 0 ? (
          <div className="space-y-4">
            {(action.inputs as Array<Input & {value: any}>).map(input => (
              <div key={input.name}>
                <div className="mb-3 text-base font-semibold capitalize leading-normal text-neutral-800">
                  {input.name}
                  <span className="ml-1 text-sm normal-case leading-normal">
                    ({input.type})
                  </span>
                </div>
                <ComponentForTypeWithFormProvider
                  key={input.name}
                  input={input}
                  functionName={action.functionName}
                  disabled
                  defaultValue={input.value}
                />
              </div>
            ))}
          </div>
        ) : null}
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-neutral-50 rounded-b-xl border border-t-0 border-neutral-100 space-y-6 p-6',
})``;
