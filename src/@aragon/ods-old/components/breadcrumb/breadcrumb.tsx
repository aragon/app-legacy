import React, {type ReactComponentElement, type ReactElement} from 'react';
import {styled} from 'styled-components';
import {ButtonIcon} from '../button';
import {IconChevronLeft, IconChevronRight, type IconType} from '../icons';
import {type TagProps} from '../tag';
import Crumb from './crumb';
import {shortenAddress} from '../../utils/addresses';

export type CrumbType = {
  label: ReactElement | string;
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
  function getLabel(content: ReactElement | string | undefined): string {
    if (typeof content === 'string') return shortenAddress(content);
    return shortenAddress(content?.props?.children);
  }

  if (Array.isArray(crumbs)) {
    let isLast: boolean;

    return (
      <Container data-testid="breadcrumbs">
        {crumbs.map(({label, path}, index) => {
          isLast = index === crumbs.length - 1;
          return (
            <div
              key={index}
              className="flex items-center space-x-2 xl:space-x-3"
            >
              <Crumb
                first={index === 0}
                icon={icon}
                label={getLabel(label)}
                last={isLast}
                tag={tag}
                {...(isLast ? {} : {onClick: () => onClick?.(path)})}
              />
              {!isLast && <IconChevronRight className="text-neutral-300" />}
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
          <p className="font-semibold">{getLabel(crumbs?.label)}</p>
          {tag}
        </ProcessCrumbContainer>
      </ProcessContainer>
    );
  }
};

const Container = styled.div.attrs({
  className:
    'inline-flex items-center py-1 xl:px-4 space-x-2 ' +
    'xl:space-x-3 h-10 xl:h-12 xl:bg-neutral-0 xl:rounded-xl',
})``;

const ProcessContainer = styled.div.attrs({
  className:
    'inline-flex py-1 xl:pr-4 xl:pl-1 xl:rounded-xl xl:bg-neutral-0 h-12',
})``;

const ProcessCrumbContainer = styled.div.attrs({
  className: 'flex items-center space-x-3 font-semibold text-neutral-600',
})``;
