import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '../button';
import {IconType} from '../icons';
import {
  IllustrationHuman,
  IlluHumanProps,
  IlluObjectProps,
  IlluObject,
} from '../illustrations';

type ButtonProps = {
  label: string;
  onClick: () => void;
  iconLeft?: React.FunctionComponentElement<IconType>;
  iconRight?: React.FunctionComponentElement<IconType>;
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
    <Card mode={props.mode} size={props.size || 'small'} type={props.type}>
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
      <ContentWrapper>
        <TextWrapper>
          <Title>{props.title}</Title>
          {props.renderHtml ? (
            <Description
              size={props.size}
              dangerouslySetInnerHTML={{__html: props.description || ''}}
            />
          ) : (
            props.description && (
              <Description size={props.size}>{props.description}</Description>
            )
          )}
        </TextWrapper>
        {(props.primaryButton || props.secondaryButton) && (
          <ActionContainer size={props.size || 'small'}>
            {props.primaryButton && (
              <ButtonText
                label={props.primaryButton.label}
                onClick={props.primaryButton.onClick}
                iconLeft={props.primaryButton.iconLeft}
                iconRight={props.primaryButton.iconRight}
                size="large"
              />
            )}
            {props.secondaryButton && (
              <ButtonText
                label={props.secondaryButton.label}
                onClick={props.secondaryButton.onClick}
                iconLeft={props.secondaryButton.iconLeft}
                iconRight={props.secondaryButton.iconRight}
                mode="secondary"
                size="large"
                bgWhite
              />
            )}
          </ActionContainer>
        )}
      </ContentWrapper>
    </Card>
  );
};

const Card = styled.div.attrs<Pick<StateEmptyProps, 'mode' | 'size' | 'type'>>(
  ({mode, size, type}) => {
    let className = 'flex flex-col items-center rounded-xl w-full ';

    if (mode === 'card') {
      className += 'border bg-ui-0 ';

      className += size === 'small' ? 'p-3 ' : (className += 'p-6 ');
      if (type === 'Object') className += 'gap-y-1 ';
    } else {
      className += 'bg-ui-transparent ';
    }

    if (type === 'Human') className += 'gap-y-3 ';
    return {className};
  }
)<Pick<StateEmptyProps, 'mode' | 'size' | 'type'>>``;

const ContentWrapper = styled.div.attrs({className: 'space-y-3 w-full'})``;

const TextWrapper = styled.div.attrs({
  className: 'space-y-1.5 text-center',
})``;

const ActionContainer = styled.div.attrs<Pick<StateEmptyProps, 'size'>>(
  ({size}) => {
    let className = 'flex w-full ';

    if (size === 'small') {
      className += 'flex-col gap-y-1.5';
    } else {
      className += 'justify-center gap-x-3';
    }

    return {className};
  }
)<Pick<StateEmptyProps, 'size'>>``;

const Title = styled.h2.attrs({
  className: 'ft-text-xl font-bold text-ui-800',
})``;

const Description = styled.p.attrs<Pick<StateEmptyProps, 'size'>>(({size}) => {
  return {
    className: `text-ui-500 ${
      size === 'small' ? 'ft-text-sm' : 'ft-text-base'
    }`,
  };
})<Pick<StateEmptyProps, 'size'>>`
  & > a {
    color: #003bf5;
    font-weight: 700;
`;
