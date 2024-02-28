import React, {useState} from 'react';
import {Button, IconType, Dropdown} from '@aragon/ods';

import NavLink from 'components/navLink';
import {NAV_LINKS_DATA} from 'utils/constants';

export const NavlinksDropdown: React.FC = () => {
  const [showCrumbMenu, setShowCrumbMenu] = useState(false);
  return (
    <Dropdown.Container
      align="start"
      open={showCrumbMenu}
      onOpenChange={setShowCrumbMenu}
      customTrigger={
        <Button
          variant="tertiary"
          size="lg"
          iconLeft={showCrumbMenu ? IconType.CLOSE : IconType.MENU}
        />
      }
    >
      {NAV_LINKS_DATA.map((d, i) => (
        <Dropdown.Item key={i}>
          <NavLink caller="dropdown" data={d} />
        </Dropdown.Item>
      ))}
    </Dropdown.Container>
  );
};
