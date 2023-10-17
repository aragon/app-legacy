import {
  ButtonText,
  ButtonTextProps,
  IlluHumanProps,
  IlluObject,
  IlluObjectProps,
  IllustrationHuman,
} from '@aragon/ods-old';
import useScreen from 'hooks/useScreen';
import React from 'react';
import styled from 'styled-components';

type BaseProps = {
  mode: 'card' | 'inline';
  title: string;
  description?: string;
  content?: JSX.Element;
  primaryButton?: Omit<ButtonTextProps, 'mode' | 'size'>;
  secondaryButton?: Omit<ButtonTextProps, 'mode' | 'size'>;
  tertiaryButton?: Omit<ButtonTextProps, 'mode' | 'size'>;
  renderHtml?: boolean;
  actionsColumn?: boolean;
  customCardPaddingClassName?: string;
};

type StateEmptyProps =
  | (IlluHumanProps &
      BaseProps & {
        type: 'Human';
      })
  | (IlluObjectProps &
      BaseProps & {
        type: 'Object';
      })
  | (IlluObjectProps &
      IlluHumanProps &
      BaseProps & {
        type: 'both';
      })
  | (BaseProps & {
      type: 'custom';
      src: string;
    });

export const StateEmpty: React.FC<StateEmptyProps> = props => {
  return (
    <Card
      mode={props.mode}
      type={props.type}
      customCardPaddingClassName={props.customCardPaddingClassName}
    >
      <div className="flex">
        <RenderIllustration {...props} />
      </div>
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
        {props.content}
        {(props.primaryButton || props.secondaryButton) && (
          <ActionContainer actionsColumn={props.actionsColumn}>
            {props.primaryButton && (
              <ButtonText
                {...props.primaryButton}
                mode="primary"
                size="large"
                {...(props.mode === 'inline' &&
                  (props.secondaryButton ? {} : {className: 'w-full'}))}
              />
            )}
            {props.secondaryButton && (
              <ButtonText
                {...props.secondaryButton}
                mode="secondary"
                size="large"
                bgWhite={props.secondaryButton.bgWhite ?? true}
              />
            )}
            {props.tertiaryButton && (
              <ButtonText {...props.tertiaryButton} mode="ghost" size="large" />
            )}
          </ActionContainer>
        )}
      </ContentWrapper>
    </Card>
  );
};

const RenderIllustration: React.FC<StateEmptyProps> = props => {
  const {isMobile} = useScreen();

  if (props.type === 'custom') {
    return (
      <ImageWrapper>
        <img src={props.src} />
      </ImageWrapper>
    );
  }

  return (
    <>
      {props.type !== 'Object' && (
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
      )}
      {props.type !== 'Human' && (
        <IlluObject
          object={props.object}
          className={props.type === 'both' ? '-ml-32 xl:-ml-36' : ''}
        />
      )}
    </>
  );
};

const Card = styled.div.attrs<
  Pick<StateEmptyProps, 'mode' | 'type' | 'customCardPaddingClassName'>
>(({mode, type, customCardPaddingClassName}) => {
  let className = 'flex flex-col items-center rounded-xl w-full ';

  if (mode === 'card') {
    className += 'border bg-neutral-0 ';
    className += `${customCardPaddingClassName || 'p-3 md:p-12'} `;

    if (type === 'Object') className += 'gap-y-1 ';
  } else {
    className += 'bg-neutral-transparent ';
  }

  if (type === 'Human' || type === 'both') className += 'gap-y-3 ';
  return {className};
})<Pick<StateEmptyProps, 'mode' | 'type' | 'customCardPaddingClassName'>>``;

const ContentWrapper = styled.div.attrs({className: 'space-y-3 w-full'})``;

const TextWrapper = styled.div.attrs({
  className: 'space-y-1.5 text-center',
})``;

const ActionContainer = styled.div.attrs<Pick<BaseProps, 'actionsColumn'>>(
  ({actionsColumn}) => ({
    className: `flex w-full flex-col gap-y-1.5 ${
      !actionsColumn && 'md:flex-row md:gap-y-0 md:justify-center md:gap-x-3'
    }`,
  })
)<Pick<BaseProps, 'actionsColumn'>>``;

const Title = styled.h2.attrs({
  className: 'ft-text-xl font-semibold text-neutral-800',
})``;

const Description = styled.p.attrs({
  className: 'text-neutral-500 ft-text-sm md:ft-text-base',
})`
  & > a {
    color: #003bf5;
    font-weight: 700;
`;

const ImageWrapper = styled.div.attrs({
  className: 'flex justify-center pt-8 xl:pt-12 pb-8 xl:pb-16',
})``;
