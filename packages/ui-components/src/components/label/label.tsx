import React from 'react';
import styled from 'styled-components';
import {Tag} from '../tag';

export type LabelProps = {
  label: string;
  helpText?: string;
  isOptional?: boolean;
  tagLabel?: string;
  renderHtml?: boolean;
};

export const Label: React.FC<LabelProps> = ({
  label,
  helpText,
  isOptional = false,
  tagLabel,
  renderHtml = false,
}) => {
  return (
    <VStack data-testid="label">
      <LabelLine>
        {renderHtml ? (
          <Heading dangerouslySetInnerHTML={{__html: label}} />
        ) : (
          <Heading>{label}</Heading>
        )}
        {isOptional && <Tag label={tagLabel || 'Optional'} />}
      </LabelLine>
      {renderHtml && helpText ? (
        <HelpText dangerouslySetInnerHTML={{__html: helpText}} />
      ) : (
        <HelpText>{helpText}</HelpText>
      )}
    </VStack>
  );
};

const VStack = styled.div.attrs({
  className: 'space-y-0.5',
})``;

const LabelLine = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const Heading = styled.p.attrs({
  className: 'font-bold text-ui-800',
})`
  & > a {
    color: #003bf5;
  }
`;

const HelpText = styled.p.attrs({
  className: 'ft-text-sm font-normal text-ui-600',
})`
  & > a {
    color: #003bf5;
    font-weight: 700;
  }
`;
