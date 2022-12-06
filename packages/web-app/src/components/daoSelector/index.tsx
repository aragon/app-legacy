import {
  Address,
  AvatarDao,
  AvatarDaoProps,
  ButtonIcon,
  IconChevronDown,
  shortenAddress,
} from '@aragon/ui-components';

import useScreen from 'hooks/useScreen';
import React from 'react';
import styled from 'styled-components';

type DaoSelectorProps = {
  daoName: string;
  /** Dao's ethereum address **or** ENS name */
  daoAddress: Address;
  /** Handler for the switch button. Will be called when the button is clicked. */
  onClick: () => void;
} & Pick<AvatarDaoProps, 'src'>;

export const DaoSelector: React.FC<DaoSelectorProps> = ({
  daoName,
  daoAddress,
  onClick,
  src,
}: DaoSelectorProps) => {
  const {isDesktop} = useScreen();

  return (
    <Card data-testid="cardDao" onClick={onClick}>
      <LeftContent>
        <AvatarWrapper>
          <AvatarDao daoName={daoName} src={src} />
        </AvatarWrapper>
        <TextContainer>
          <DaoName>{daoName}</DaoName>
          <DaoAddress>{shortenAddress(daoAddress)}</DaoAddress>
        </TextContainer>
      </LeftContent>

      <ButtonIcon
        icon={<IconChevronDown />}
        mode="secondary"
        size="small"
        bgWhite={!isDesktop}
      />
    </Card>
  );
};

const Card = styled.div.attrs(() => ({
  className:
    'flex desktop:inline-flex items-center space-x-3 bg-ui-0' +
    ' desktop:bg-transparent p-3 desktop:p-0 rounded-xl cursor-pointer',
}))``;

const LeftContent = styled.div.attrs({
  className: 'inline-flex flex-1 space-x-1.5 min-w-0',
})``;

const AvatarWrapper = styled.div``;

const TextContainer = styled.div.attrs({
  className: 'flex flex-col justify-center min-w-0 ',
})``;

const DaoName = styled.p.attrs({
  className: 'text-ui-800 font-bold truncate',
})``;

const DaoAddress = styled.p.attrs({
  className: 'text-ui-500 ft-text-sm desktop:hidden truncate',
})``;
