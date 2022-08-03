import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '../button';
import {
  IllustrationHuman,
  IlluHumanProps,
  IlluObjectProps,
  IlluObject,
} from '../illustrations';

type ButtonProps = {
  label: string;
  onClick: () => void;
};

type Props = {
  mode: 'card' | 'inline';
  size?: 'small' | 'large';
  title: string;
  description?: string;
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  renderHtml?: boolean;
};

export type StateEmptyProps =
  | (IlluHumanProps &
      Props & {
        type: 'Human';
      })
  | (IlluObjectProps &
      Props & {
        type: 'Object';
      });

export const StateEmpty: React.FC<StateEmptyProps> = props => {
  return (
    <Card mode={props.mode} size={props.size || 'small'}>
      {props.type === 'Human' ? (
        <IllustrationHuman
          {...{
            body: props.body,
            expression: props.expression,
            hair: props.hair,
            sunglass: props.sunglass,
            accessory: props.accessory,
          }}
          height={props.size === 'large' ? 225 : 165}
          width={props.size === 'large' ? 400 : 295}
        />
      ) : (
        <IlluObject object={props.object} />
      )}
      <TextWrapper>
        <Title>{props.title}</Title>
        {props.renderHtml ? (
          <Description
            dangerouslySetInnerHTML={{__html: props.description || ''}}
          />
        ) : (
          props.description && <Description>{props.description}</Description>
        )}
      </TextWrapper>
      {(props.primaryButton || props.secondaryButton) && (
        <ActionContainer>
          {props.primaryButton && (
            <ButtonText
              label={props.primaryButton.label}
              onClick={props.primaryButton.onClick}
              size="large"
            />
          )}
          {props.secondaryButton && (
            <ButtonText
              label={props.secondaryButton.label}
              onClick={props.secondaryButton.onClick}
              mode="ghost"
              size="large"
            />
          )}
        </ActionContainer>
      )}
    </Card>
  );
};

const Card = styled.div.attrs<Pick<Props, 'mode' | 'size'>>(({mode, size}) => ({
  className: `flex flex-col items-center justify-center rounded-xl w-full space-y-3 ${
    mode === 'card' ? 'border bg-ui-0' : 'bg-ui-0'
  } ${size === 'large' ? 'p-6' : 'p-3'}`,
}))<Pick<Props, 'mode' | 'size'>>``;

const TextWrapper = styled.div.attrs({
  className: 'space-y-2 text-center',
})``;

const ActionContainer = styled.div.attrs({
  className:
    'flex desktop:flex-row flex-col space-y-1.5 desktop:space-y-0 space-x-0 desktop:space-x-3',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-xl font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-500 text-sm desktop:text-base',
})`
  & > a {
    color: #003bf5;
    font-weight: 700;
`;
