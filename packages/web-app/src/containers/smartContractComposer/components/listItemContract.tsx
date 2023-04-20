import {ListItemAction, ListItemActionProps} from '@aragon/ui-components';
import React from 'react';

type Props = Omit<ListItemActionProps, 'iconLeft'> & {
  logo?: string;
};

export const ListItemContract: React.FC<Props> = ({logo, ...rest}) => {
  return <ListItemAction {...rest} iconLeft={logo || rest.title} />;
};
