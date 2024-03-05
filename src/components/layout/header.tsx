import {HTMLAttributes} from 'react';
import styled from 'styled-components';

type headerProps = HTMLAttributes<HTMLElement> & {
  isExplorePage?: boolean;
};

export const Container: React.FC<headerProps> = styled.header.attrs(
  ({isExplorePage}: headerProps) => ({
    className: `sticky top-0 w-full ${isExplorePage ? 'z-10' : ''}`,
  })
)``;
