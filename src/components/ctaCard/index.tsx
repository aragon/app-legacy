import React from 'react';
import styled from 'styled-components';
import useScreen from 'hooks/useScreen';
import {Button} from '@aragon/ods';

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
  isPrimary: boolean;
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

      <Button
        variant={props.isPrimary ? 'primary' : 'secondary'}
        size="md"
        disabled={!props.actionAvailable}
        href={props.path}
        target={props.isPrimary ? '_self' : '_blank'}
        className={`${!isDesktop && 'w-full'}`}
      >
        {props.actionLabel}
      </Button>
    </CTACardWrapper>
  );
};

export default CTACard;

const CTACardWrapper = styled.div.attrs({
  className:
    'bg-neutral-0 flex flex-col lg:items-start items-center p-6 lg:space-y-2 rounded-xl gap-y-6 mb-6 lg:mb-0 shadow-neutral',
})``;

const Content = styled.div.attrs({
  className: 'flex lg:items-start items-center flex-col lg:m-0 ',
})``;

const Title = styled.p.attrs({
  className: 'ft-text-2xl font-semibold text-neutral-800 lg:mt-4 mt-0',
})``;

const Subtitle = styled.p.attrs({
  className:
    'text-center lg:text-left text-neutral-600 lg:h-[72px] ft-text-base lg:mt-4 mt-3',
})``;

const StyledImg = styled.img.attrs({
  className: 'h-24 w-24',
})``;
