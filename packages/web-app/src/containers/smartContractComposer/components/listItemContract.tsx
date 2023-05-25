import {
  Dropdown,
  IconMenuVertical,
  ListItemAction,
  ListItemActionProps,
  ListItemProps,
} from '@aragon/ui-components';
import React from 'react';

type Props = Omit<ListItemActionProps, 'iconLeft'> & {
  logo?: string;
  dropdownItems?: ListItemProps[];
};

export const ListItemContract: React.FC<Props> = ({
  logo,
  dropdownItems,
  iconRight,
  ...rest
}) => {
  if (dropdownItems && !iconRight) {
    iconRight = (
      <Dropdown
        align="start"
        trigger={
          <button>
            <IconMenuVertical />
          </button>
        }
        sideOffset={8}
        listItems={dropdownItems}
      />
    );
  }
  return (
    <ListItemAction
      {...{iconRight, ...rest}}
      iconLeft={logo || rest.title}
      truncateText
    />
  );
};
