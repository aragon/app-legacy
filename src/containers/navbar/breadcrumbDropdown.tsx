import React from 'react';
import {Button, IconType, Dropdown} from '@aragon/ods';

import NavLink from 'components/navLink';
import {NAV_LINKS_DATA} from 'utils/constants';

export const NavlinksDropdown: React.FC = () => {
  return (
    <Dropdown.Container
      align="start"
      customTrigger={
        <Button variant="tertiary" size="lg" iconLeft={IconType.MENU} />
      }
    >
      {NAV_LINKS_DATA.map((d, i) => (
        <NavLink caller="dropdown" data={d} key={i} />
      ))}
    </Dropdown.Container>
  );
};
