import {
  ListItemAction,
  ListItemActionProps,
} from '@aragon/ui-components/src/components/listItem/action';
import React from 'react';

type SCCListItemActionProps = Omit<ListItemActionProps, 'iconLeft'> & {
  logo?: string;
};

export const SCCListItemAction: React.FC<SCCListItemActionProps> = ({
  logo,
  ...rest
}) => {
  return <ListItemAction {...rest} iconLeft={logo || rest.title} />;
};
