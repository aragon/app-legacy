import {ListItemAction} from '@aragon/ods-old';
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
    // timeout is to allow any state changes triggered by onItemClick to take effect
    // before navigation occurs, potentially unmounting components
    setTimeout(() => navigate(generatePath(data.path, {network, dao})), 100);
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

const NavItem = styled.button.attrs<{isSelected: boolean}>(({isSelected}) => {
  let className =
    'py-3 px-4 rounded-xl font-semibold hover:text-primary-500 ' +
    'active:text-primary-700 disabled:text-neutral-300 disabled:bg-neutral-50' +
    ' focus-visible:ring focus-visible:ring-primary focus-visible:outline-none ';

  if (isSelected) className += 'text-primary-500 bg-neutral-0';
  else className += 'text-neutral-600';

  return {className};
})<{isSelected: boolean}>``;

export default NavLink;
