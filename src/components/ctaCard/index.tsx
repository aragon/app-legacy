import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ods-old';
import useScreen from 'hooks/useScreen';

type Props = {
  // temporary property, to be removed once all actions available
  actionAvailable?: boolean;
  actionLabel: string;
  className?: string;
  path: string;
  imgSrc: string;
  onClick: (path: string) => void;
  subtitle: string;
  title: string;
};

const CTACard: React.FC<Props> = props => {
  const {isDesktop} = useScreen();

  return (
    <CTACardWrapper className={props.className}>
      <Content>
        <StyledImg src={props.imgSrc} />
        <Title>{props.title}</Title>
        <Subtitle>{props.subtitle}</Subtitle>
      </Content>

      <ButtonText
        size="large"
        label={props.actionLabel}
        {...(props.actionAvailable
          ? {mode: 'primary'}
          : {mode: 'ghost', disabled: true})}
        onClick={() => props.onClick(props.path)}
        className={`${!isDesktop && 'w-full'}`}
      />
    </CTACardWrapper>
  );
};

export default CTACard;

const CTACardWrapper = styled.div.attrs({
  className:
    'flex flex-col xl:items-start items-center p-3 space-y-3 rounded-xl relative xl:m-0 mb-3 mx-1' as string,
})`
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(50px);
`;

const Content = styled.div.attrs({
  className: 'flex xl:items-start items-center flex-col xl:m-0 mb-3',
})``;

const Title = styled.p.attrs({
  className: 'ft-text-2xl font-bold text-neutral-800 xl:mt-2 mt-0',
})``;

const Subtitle = styled.p.attrs({
  className: 'text-neutral-600 h-9 ft-text-base xl:mt-2 mt-1.5',
})``;

const StyledImg = styled.img.attrs({
  className: 'h-24 w-24',
})``;
