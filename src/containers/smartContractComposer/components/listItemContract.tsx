import React from 'react';
import {ListItemAction, ListItemActionProps} from '@aragon/ods-old';
import {Icon, IconType, Dropdown} from '@aragon/ods';

type Props = Omit<ListItemActionProps, 'iconLeft'> & {
  logo?: string;
  dropdownItems?: React.ReactNode[];
};

export const ListItemContract: React.FC<Props> = ({
  logo,
  dropdownItems,
  iconRight,
  ...rest
}) => {
  if (dropdownItems && !iconRight) {
    iconRight = (
      <Dropdown.Container
        align="start"
        customTrigger={
          <button>
            <Icon icon={IconType.DOTS_VERTICAL} />
          </button>
        }
      >
        {dropdownItems}
      </Dropdown.Container>
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
