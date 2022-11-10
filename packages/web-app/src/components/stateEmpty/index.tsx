import {
  IconType,
  IlluHumanProps,
  IlluObjectProps,
  IllustrationHuman,
  IlluObject,
  ButtonText,
} from '@aragon/ui-components';
import useScreen from 'hooks/useScreen';
import React from 'react';
import styled from 'styled-components';

type BaseProps = {
  mode: 'card' | 'inline';
  title: string;
  description?: string;
  primaryButton?: ButtonProps;
  secondaryButton?: ButtonProps;
  renderHtml?: boolean;
};

type ButtonProps = {
  label: string;
  onClick: () => void;
  iconLeft?: React.FunctionComponentElement<IconType>;
  iconRight?: React.FunctionComponentElement<IconType>;
};

type StateEmptyProps =
  | (IlluHumanProps &
      BaseProps & {
        type: 'Human';
      })
  | (IlluObjectProps &
      BaseProps & {
        type: 'Object';
      });

export const StateEmpty: React.FC<StateEmptyProps> = props => {
  const {isMobile} = useScreen();

  return (
    <Card mode={props.mode} type={props.type}>
      {props.type === 'Human' ? (
        <IllustrationHuman
          {...{
            body: props.body,
            expression: props.expression,
            hair: props.hair,
            sunglass: props.sunglass,
            accessory: props.accessory,
          }}
          {...(isMobile
            ? {height: 165, width: 295}
            : {height: 225, width: 400})}
        />
      ) : (
        <IlluObject object={props.object} />
      )}
      <ContentWrapper>
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
                iconLeft={props.primaryButton.iconLeft}
                iconRight={props.primaryButton.iconRight}
                size="large"
                {...(props.secondaryButton ? {} : {className: 'w-full'})}
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

const Card = styled.div.attrs<Pick<StateEmptyProps, 'mode' | 'type'>>(
  ({mode, type}) => {
    let className = 'flex flex-col items-center rounded-xl w-full ';

    if (mode === 'card') {
      className += 'border bg-ui-0 p-3 tablet:p-6 ';

      if (type === 'Object') className += 'gap-y-1 ';
    } else {
      className += 'bg-ui-transparent ';
    }

    if (type === 'Human') className += 'gap-y-3 ';
    return {className};
  }
)<Pick<StateEmptyProps, 'mode' | 'type'>>``;

const ContentWrapper = styled.div.attrs({className: 'space-y-3 w-full'})``;

const TextWrapper = styled.div.attrs({
  className: 'space-y-1.5 text-center',
})``;

const ActionContainer = styled.div.attrs({
  className: `flex w-full flex-col tablet:flex-row gap-y-1.5 tablet:gap-y-0 
    tablet:justify-center tablet:gap-x-3`,
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-xl font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-500 ft-text-sm tablet:ft-text-base',
})`
  & > a {
    color: #003bf5;
    font-weight: 700;
`;
