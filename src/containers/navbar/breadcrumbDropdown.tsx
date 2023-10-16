import {ButtonIcon, Dropdown, IconClose, IconMenu} from '@aragon/ods-old';
import React, {useState} from 'react';
import styled from 'styled-components';

import NavLink from 'components/navLink';
import {NAV_LINKS_DATA} from 'utils/constants';

export const NavlinksDropdown: React.FC = () => {
  const [showCrumbMenu, setShowCrumbMenu] = useState(false);

  return (
    <StyledDropdown
      open={showCrumbMenu}
      onOpenChange={setShowCrumbMenu}
      align="start"
      trigger={
        <ButtonIcon
          mode="secondary"
          size="large"
          icon={showCrumbMenu ? <IconClose /> : <IconMenu />}
          isActive={showCrumbMenu}
        />
      }
      sideOffset={8}
      listItems={NAV_LINKS_DATA.map(d => ({
        component: <NavLink caller="dropdown" data={d} />,
        // Navlink component already takes care of callback. Eventually we
        // should probably make this optional on the dropdown component.
        callback: () => {},
      }))}
    />
  );
};

const StyledDropdown = styled(Dropdown).attrs({
  className: 'p-1.5 w-60 rounded-xl',
})``;
