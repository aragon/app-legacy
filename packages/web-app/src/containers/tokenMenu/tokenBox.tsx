import React from 'react';
import styled from 'styled-components';
import {AvatarToken} from '@aragon/ui-components';

export type TokenProps = {
  tokenName: string;
  tokenLogo: string;
  tokenSymbol: string;
  tokenBalance: string;
};

export default function TokenBox({
  tokenName,
  tokenLogo,
  tokenSymbol,
  tokenBalance,
}: TokenProps) {
  return (
    <Box>
      <AvatarTokenWrapper>
        <AvatarToken size="medium" src={tokenLogo} />
      </AvatarTokenWrapper>
      <TextWrapper>
        <Name>{tokenName}</Name>
        <Price>{tokenBalance ? `${tokenBalance} ${tokenSymbol}` : '-'}</Price>
      </TextWrapper>
    </Box>
  );
}

const Box = styled.div.attrs({
  className: `flex items-center gap-x-2 py-1.5 px-2 
    bg-white rounded-xl cursor-pointer
    hover:text-ui-800 hover:bg-ui-100`,
})``;

const AvatarTokenWrapper = styled.span``;

const TextWrapper = styled.div.attrs({
  className: 'flex overflow-hidden gap-x-2 w-full',
})``;

const Name = styled.span.attrs({
  className:
    'ft-text-base font-semibold ft-text-base flex-1 text-left truncate text-ui-600',
})``;

const Price = styled.span.attrs({
  className:
    'ft-text-base font-normal flex-none w-1/3 text-ui-500 text-right truncate',
})``;
