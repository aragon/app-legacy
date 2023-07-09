import {
  ButtonIcon,
  IconChevronRight,
  IconClose,
  IconHome,
  IconType,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

type SearchHeader = {
  onClose?: () => void;
  selectedValue?: string;
  onSearch?: (search: string) => void;
  buttonIcon?: React.FunctionComponentElement<IconType>;
  onHomeButtonClick?: () => void;
};

const SearchHeader: React.FC<SearchHeader> = props => {
  const {t} = useTranslation();

  return (
    <Container>
      <LeftContent>
        <ButtonIcon
          icon={props.buttonIcon || <IconHome />}
          mode="secondary"
          bgWhite
          onClick={props.onHomeButtonClick}
        />
        <IconChevronRight />
        {props.selectedValue && (
          <>
            <SelectedValue>{props.selectedValue}</SelectedValue>
            <IconChevronRight />
          </>
        )}

        <ActionSearchInput
          type="text"
          placeholder={t('scc.labels.searchPlaceholder')}
          onChange={e => props.onSearch?.(e.target.value)}
        />
      </LeftContent>
      <ButtonIcon
        mode="secondary"
        icon={<IconClose />}
        onClick={props.onClose}
        bgWhite
      />
    </Container>
  );
};

export default SearchHeader;

const Container = styled.div.attrs({
  className:
    'flex sticky top-0 justify-between items-center py-2.5 px-3 bg-ui-0 border-b border-ui-100',
})``;

const LeftContent = styled.div.attrs({
  className: 'flex gap-x-1 items-center text-ui-300 ft-text-base',
})``;

const SelectedValue = styled.p.attrs({
  className: 'font-bold text-ui-600 ft-text-base',
})``;

export const ActionSearchInput = styled.input.attrs({
  className: 'flex-1 text-ui-300 bg-ui-0 ft-text-base focus:outline-none',
})``;
