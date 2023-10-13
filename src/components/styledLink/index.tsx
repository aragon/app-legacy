import {Link, LinkProps} from '@aragon/ods-old';
import styled from 'styled-components';

// Temporary local component until an inverse variant is introduced into the
// ODS link
export const StyledLink = styled(Link as React.ComponentType<LinkProps>)`
  & > div > span {
    color: #ffffff; // ui-0
  }

  & > div > div > svg {
    color: #ffffff;
  }

  &:hover {
    & > div > span {
      color: #c4d7ff; // primary-100
    }

    & > div > div > svg {
      color: #c4d7ff;
    }
  }

  &:active {
    & > div > span {
      color: #001f5c; // primary-900
    }

    & > div > div > svg {
      color: #001f5c;
    }
  }
`;
