import React, {useEffect, useState} from 'react';
import {styled} from 'styled-components';
import {useScreen} from '../../hooks';
import {ButtonIcon, ButtonText} from '../button';
import {IconChevronLeft, IconChevronRight} from '../icons/interface';
export interface PaginationProps {
  /**
   * white background
   */
  bgWhite?: boolean;
  /**
   * Number of total pages
   */
  totalPages?: number;
  /**
   * active page
   */
  activePage?: number;
  /**
   * With this parameter we can define break points for
   * change pagination from 1...567...9 to 1...789
   * views
   */
  distance?: number;
  onChange?: (page: number) => void;
}

/**
 * Default UI component
 */
export const Pagination: React.FC<PaginationProps> = ({
  totalPages = 10,
  activePage = 1,
  bgWhite = false,
  distance = 3,
  onChange,
}) => {
  const [page, setPage] = useState<number>(activePage);

  useEffect(() => {
    onChange && onChange(page);
  }, [onChange, page]);

  function ButtonList() {
    const list = [];

    const {isMobile} = useScreen();

    if (isMobile) {
      if (totalPages - page <= 1) {
        const penultimatePage = totalPages - 1;
        return (
          <>
            <Separator>...</Separator>
            <ButtonText
              mode="secondary"
              size="large"
              onClick={() => setPage(penultimatePage)}
              isActive={penultimatePage === page}
              {...(bgWhite && {bgWhite})}
              label={penultimatePage.toString()}
            />
            <ButtonText
              mode="secondary"
              size="large"
              onClick={() => setPage(totalPages)}
              isActive={page === totalPages}
              {...(bgWhite && {bgWhite})}
              label={totalPages.toString()}
            />
          </>
        );
      }

      return (
        <>
          <ButtonText
            mode="secondary"
            size="large"
            onClick={() => setPage(page)}
            isActive
            {...(bgWhite && {bgWhite})}
            label={page.toString()}
          />
          <Separator>...</Separator>
          <ButtonText
            mode="secondary"
            size="large"
            onClick={() => setPage(totalPages)}
            {...(bgWhite && {bgWhite})}
            label={`${totalPages}`}
          />
        </>
      );
    }

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        list.push(
          <ButtonText
            mode="secondary"
            size="large"
            isActive={page === i}
            onClick={() => setPage(i)}
            {...(bgWhite && {bgWhite})}
            label={`${i}`}
            key={i}
          />
        );
      }
      return <>{list}</>;
    }

    if (page - 1 <= distance) {
      for (let i = 1; i <= 5; i++) {
        list.push(
          <ButtonText
            mode="secondary"
            size="large"
            isActive={page === i}
            onClick={() => setPage(i)}
            {...(bgWhite && {bgWhite})}
            label={`${i}`}
            key={i}
          />
        );
      }
      return (
        <>
          {list}
          <Separator>...</Separator>
          <ButtonText
            mode="secondary"
            size="large"
            onClick={() => setPage(totalPages)}
            {...(bgWhite && {bgWhite})}
            label={`${totalPages}`}
          />
        </>
      );
    }

    if (totalPages - page <= distance) {
      for (let i = totalPages - 4; i <= totalPages; i++) {
        list.push(
          <ButtonText
            mode="secondary"
            size="large"
            isActive={page === i}
            onClick={() => setPage(i)}
            {...(bgWhite && {bgWhite})}
            label={`${i}`}
            key={i}
          />
        );
      }
      return (
        <>
          <ButtonText
            mode="secondary"
            size="large"
            onClick={() => setPage(1)}
            {...(bgWhite && {bgWhite})}
            label={`${1}`}
          />
          <Separator>...</Separator>
          {list}
        </>
      );
    }

    for (let i = page - 1; i <= page + 1; i++) {
      list.push(
        <ButtonText
          mode="secondary"
          size="large"
          isActive={page === i}
          onClick={() => setPage(i)}
          {...(bgWhite && {bgWhite})}
          label={`${i}`}
          key={i}
        />
      );
    }
    return (
      <>
        <ButtonText
          mode="secondary"
          size="large"
          onClick={() => setPage(1)}
          {...(bgWhite && {bgWhite})}
          label="1"
        />
        <Separator>...</Separator>
        {list}
        <Separator>...</Separator>
        <ButtonText
          mode="secondary"
          size="large"
          onClick={() => setPage(totalPages)}
          {...(bgWhite && {bgWhite})}
          label={`${totalPages}`}
        />
      </>
    );
  }

  return (
    <HStack data-testid="pagination">
      <ButtonIcon
        mode="secondary"
        size="large"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        icon={<IconChevronLeft />}
        {...(bgWhite && {bgWhite})}
      />
      <ButtonList />
      <ButtonIcon
        mode="secondary"
        size="large"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        icon={<IconChevronRight />}
        {...(bgWhite && {bgWhite})}
      />
    </HStack>
  );
};

const HStack = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const Separator = styled.div.attrs({
  className: 'flex items-center justify-center w-12 h-12',
})``;
