import React from 'react';
import {styled} from 'styled-components';

import {type TagProps} from '../tag';
import {Icon, IconType} from '@aragon/ods';

type CrumbProps = {
  first?: boolean;
  label: string;
  last?: boolean;
  icon?: IconType;
  tag?: React.FunctionComponentElement<TagProps>;
  onClick?: React.MouseEventHandler;
};

const Crumb: React.FC<CrumbProps> = props => {
  return (
    <CrumbContainer
      onClick={props.onClick}
      className={
        props.last ? 'cursor-default text-neutral-600' : 'text-primary-500'
      }
    >
      {props.first && props.icon && (
        <Icon icon={props.icon} className="xl:h-5 xl:w-5" />
      )}
      <p className="font-semibold">{props.label}</p>
      {props.last && props.tag}
    </CrumbContainer>
  );
};

export default Crumb;

const CrumbContainer = styled.button.attrs({
  className: 'flex items-center space-x-2 xl:space-x-3' as string,
})``;
