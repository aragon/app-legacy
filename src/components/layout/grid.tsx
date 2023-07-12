import styled from 'styled-components';

export const GridLayout = styled.main.attrs({
  className:
    'grid grid-cols-4 tablet:grid-cols-8 ' +
    'desktop:grid-cols-12 gap-x-2 gap-y-2 desktop:gap-x-3 desktop:gap-y-3 ' +
    'wide:gap-x-4 wide:gap-y-4 mx-2 tablet:mx-3 desktop:mx-5 wide:mx-auto wide:w-190',
})``;
