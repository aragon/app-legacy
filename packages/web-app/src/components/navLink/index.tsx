import {ListItemAction} from '@aragon/ui-components';
import {useNetwork} from 'context/network';
import useScreen from 'hooks/useScreen';
import React from 'react';
import {
  generatePath,
  matchRoutes,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import styled from 'styled-components';
import {NavLinkData} from 'utils/constants';

type NavLinkProps = {
  /** Where this component is called from. This has an impact on this
   * component's styling. */
  caller: 'dropdown' | 'navlinks';
  /**
   * Contains dao-page's path, label and icon.
   */
  data: NavLinkData;
  /**
   * Function to be performed when the NavLink is clicked IN ADDITION TO
   * NAVIGATION. Navigation itseld is already taken care of within Navlink.
   */
  onItemClick?: () => void;
};

/**
 * Takes information about the basic navigation links for a dao (gov, fin, etc.)
 * and renders them into a navigation link. The navigation link is
 * automotatically set to active if the current route matches the path. The
 * navigation link's styling is dependent on the screen size.
 */
const NavLink = ({caller, data, onItemClick}: NavLinkProps) => {
  const {pathname} = useLocation();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const daoMatch = useMatch('daos/:network/:dao/*');

  // This logic is used to determine whether this NavLink is active or not.
  // I.e., whether the Navlink is the current page (or a subpage of it). It
  // should no longer be necessary after refactoring, as the NavItem and
  // ListItem can then be wrapped in a component that handles this logic.
  const basePath = pathname.split('/').slice(0, 5).join('/');
  const matches = matchRoutes([{path: data.path}], basePath) !== null;

  const handleOnClick = () => {
    const dao = daoMatch?.params?.dao;
    onItemClick?.();
    navigate(generatePath(data.path, {network, dao}));
  };

  if (caller === 'dropdown') {
    return (
      <ListItemAction
        bgWhite
        title={data.label}
        iconLeft={<data.icon />}
        onClick={handleOnClick}
        mode={matches ? 'selected' : 'default'}
      />
    );
  } else if (isDesktop) {
    return (
      <NavItem isSelected={matches} onClick={handleOnClick}>
        {data.label}
      </NavItem>
    );
  } else {
    return (
      <ListItemAction
        title={data.label}
        iconLeft={<data.icon />}
        onClick={handleOnClick}
        mode={matches ? 'selected' : 'default'}
      />
    );
  }
};

const NavItem = styled.button.attrs(({isSelected}: {isSelected: boolean}) => {
  let className =
    'py-1.5 px-2 rounded-xl font-bold hover:text-primary-500 ' +
    'active:text-primary-700 disabled:text-ui-300 disabled:bg-ui-50' +
    ' focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none ';

  if (isSelected) className += 'text-primary-500 bg-ui-0';
  else className += 'text-ui-600';

  return {className};
})<{isSelected: boolean}>``;

export default NavLink;
