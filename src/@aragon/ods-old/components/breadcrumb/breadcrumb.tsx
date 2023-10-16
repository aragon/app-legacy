import React, {type ReactComponentElement} from 'react';
import {styled} from 'styled-components';
import {ButtonIcon} from '../button';
import {IconChevronLeft, IconChevronRight, type IconType} from '../icons';
import {type TagProps} from '../tag';
import Crumb from './crumb';

export type CrumbType = {
  label: string;
  path: string;
};

export type DefaultCrumbProps = {
  /**
   * Array of breadcrumbs to be displayed; each breadcrumb should
   * include a label and its corresponding path
   */
  crumbs: CrumbType[];

  /** Base path icon to be displayed */
  icon: ReactComponentElement<IconType>;
};

export type ProcessCrumbProps = {
  crumbs: CrumbType;
  icon?: ReactComponentElement<IconType>;
};

export type BreadcrumbProps = {
  /** Tag shown at the end of the list of breadcrumbs */
  tag?: React.FunctionComponentElement<TagProps>;

  /** Callback returning the path value of the breadcrumb clicked */
  onClick?: (path: string) => void;
} & (ProcessCrumbProps | DefaultCrumbProps);

/** Component displaying given list as breadcrumbs. */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  crumbs,
  icon,
  tag,
  onClick,
}) => {
  if (Array.isArray(crumbs)) {
    let isLast: boolean;

    return (
      <Container data-testid="breadcrumbs">
        {crumbs.map(({label, path}, index) => {
          isLast = index === crumbs.length - 1;
          return (
            <div
              key={index}
              className="flex items-center space-x-1 xl:space-x-1.5"
            >
              <Crumb
                first={index === 0}
                icon={icon}
                label={label}
                last={isLast}
                tag={tag}
                {...(isLast ? {} : {onClick: () => onClick?.(path)})}
              />
              {!isLast && <IconChevronRight className="text-ui-300" />}
            </div>
          );
        })}
      </Container>
    );
  } else {
    return (
      <ProcessContainer data-testid="breadcrumbs">
        <ProcessCrumbContainer>
          <ButtonIcon
            mode="secondary"
            icon={<IconChevronLeft />}
            onClick={() => onClick?.(crumbs.path)}
            bgWhite
          />
          <p className="font-bold">{crumbs?.label}</p>
          {tag}
        </ProcessCrumbContainer>
      </ProcessContainer>
    );
  }
};

const Container = styled.div.attrs({
  className:
    'inline-flex items-center py-0.5 xl:px-2 space-x-1 ' +
    'xl:space-x-1.5 h-5 xl:h-6 xl:bg-ui-0 xl:rounded-xl',
})``;

const ProcessContainer = styled.div.attrs({
  className:
    'inline-flex py-0.5 xl:pr-2 xl:pl-0.5 xl:rounded-xl xl:bg-ui-0 h-6',
})``;

const ProcessCrumbContainer = styled.div.attrs({
  className: 'flex items-center space-x-1.5 font-bold text-ui-600',
})``;
