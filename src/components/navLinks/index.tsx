import React from 'react';
import styled from 'styled-components';

import NavLink from 'components/navLink';
import {NAV_LINKS_DATA} from 'utils/constants';

type NavLinksProps = {
  onItemClick?: () => void;
};

const NavLinks: React.FC<NavLinksProps> = ({onItemClick}) => {
  return (
    <div>
      <StyledNavList data-testid="navLinks">
        {NAV_LINKS_DATA.map(d => (
          <li key={d.label}>
            <NavLink caller="navlinks" data={d} onItemClick={onItemClick} />
          </li>
        ))}
      </StyledNavList>
    </div>
  );
};

const StyledNavList = styled.ul.attrs({
  className: 'space-y-2 xl:space-y-0 xl:flex xl:space-x-3 xl:items-center',
})``;

export default NavLinks;
