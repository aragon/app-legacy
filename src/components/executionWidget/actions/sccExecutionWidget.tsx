/* eslint-disable @typescript-eslint/no-explicit-any */
import {AccordionMethod} from 'components/accordionMethod';
import {ComponentForTypeWithFormProvider} from 'containers/smartContractComposer/components/inputForm';
import {useNetwork} from 'context/network';
import React from 'react';
import styled from 'styled-components';
import {CHAIN_METADATA} from 'utils/constants';
import {Input} from 'utils/types';

export const SCCExecutionCard: React.FC<{
  action: any;
}> = ({action}) => {
  const {network} = useNetwork();

  const actionHasInputs = action.inputs?.length > 0;

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={action.functionName}
      smartContractName={action.contractName}
      smartContractAddress={action.contractAddress}
      blockExplorerLink={
        action.contractAddress
          ? `${CHAIN_METADATA[network].explorer}address/${action.contractAddress}`
          : undefined
      }
      emptyItem={!actionHasInputs}
      verified
    >
      {actionHasInputs && (
        <Container>
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
        </Container>
      )}
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-neutral-50 rounded-b-xl border border-t-0 border-neutral-100 space-y-6 p-6',
})``;
