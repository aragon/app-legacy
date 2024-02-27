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
        variant={props.actionAvailable ? 'primary' : 'tertiary'}
        size="lg"
        disabled={!props.actionAvailable}
        onClick={() => props.onClick(props.path)}
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
    'flex flex-col xl:items-start items-center p-6 space-y-6 rounded-xl relative xl:m-0 mb-6 mx-2' as string,
})`
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(50px);
`;

const Content = styled.div.attrs({
  className: 'flex xl:items-start items-center flex-col xl:m-0 mb-6',
})``;

const Title = styled.p.attrs({
  className: 'ft-text-2xl font-semibold text-neutral-800 xl:mt-4 mt-0',
})``;

const Subtitle = styled.p.attrs({
  className: 'text-neutral-600 h-[72px] ft-text-base xl:mt-4 mt-3',
})``;

const StyledImg = styled.img.attrs({
  className: 'h-24 w-24',
})``;
