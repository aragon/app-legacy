import React from 'react';
import {
  Dropdown,
  ListItemAction,
  ListItemActionProps,
  ListItemProps,
} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';

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
            <Icon icon={IconType.MENU_VERTICAL} />
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
