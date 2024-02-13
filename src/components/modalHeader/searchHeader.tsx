import React from 'react';
import styled from 'styled-components';
import {Button, Icon, IconType} from '@aragon/ods';

type SearchHeader = {
  onClose?: () => void;
  selectedValue?: string;
  onSearch?: (search: string) => void;
  buttonIcon?: IconType;
  searchPlaceholder: string;
  onHomeButtonClick?: () => void;
};

const SearchHeader: React.FC<SearchHeader> = props => {
  return (
    <Container>
      <LeftContent>
        <Button
          iconLeft={props.buttonIcon || IconType.HOME}
          variant="secondary"
          size="md"
          onClick={props.onHomeButtonClick}
        />
        <Icon icon={IconType.CHEVRON_RIGHT} />
        {props.selectedValue && (
          <>
            <SelectedValue>{props.selectedValue}</SelectedValue>
            <Icon icon={IconType.CHEVRON_RIGHT} />
          </>
        )}

        <ActionSearchInput
          type="text"
          placeholder={props.searchPlaceholder}
          onChange={e => props.onSearch?.(e.target.value)}
        />
      </LeftContent>
      <Button
        variant="secondary"
        size="md"
        iconLeft={IconType.CLOSE}
        onClick={props.onClose}
      />
    </Container>
  );
};

export default SearchHeader;

const Container = styled.div.attrs({
  className:
    'flex sticky top-0 justify-between items-center py-5 px-6 bg-neutral-0 border-b border-neutral-100',
})``;

const LeftContent = styled.div.attrs({
  className: 'flex gap-x-2 items-center text-neutral-300 ft-text-base',
})``;

const SelectedValue = styled.p.attrs({
  className: 'font-semibold text-neutral-600 ft-text-base',
})``;

const ActionSearchInput = styled.input.attrs({
  className:
    'flex-1 text-neutral-300 bg-neutral-0 ft-text-base focus:outline-none',
})``;
