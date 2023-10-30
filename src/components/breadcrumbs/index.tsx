import React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import {BreadcrumbData} from 'use-react-router-breadcrumbs';
import {IconChevronRight} from '@aragon/ods-old';

type Props = {
  breadcrumbs: BreadcrumbData[];
};
const Breadcrumbs: React.FC<Props> = ({breadcrumbs}) => {
  let isLast: boolean;

  return (
    <Container data-testid="breadcrumbs">
      {breadcrumbs.map(({breadcrumb, match, key}, index) => {
        isLast = index === breadcrumbs.length - 1;
        return (
          <Breadcrumb key={key}>
            <Link
              to={match.pathname}
              className={
                isLast ? 'cursor-default text-neutral-600' : 'text-primary-500'
              }
            >
              {breadcrumb}
            </Link>
            {!isLast && <IconChevronRight />}
          </Breadcrumb>
        );
      })}
    </Container>
  );
};

export default Breadcrumbs;

const Container = styled.div.attrs({
  className:
    'flex flex-row items-center h-12 py-2 px-4 space-x-3 text-neutral-600 bg-neutral-0 rounded-xl font-semibold',
})``;

const Breadcrumb = styled.div.attrs({
  className: 'flex flex-row items-center space-x-3',
})``;
