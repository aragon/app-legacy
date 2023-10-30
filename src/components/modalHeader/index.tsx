import {ButtonIcon, IconChevronLeft, IconClose} from '@aragon/ods-old';
import React from 'react';
import styled from 'styled-components';

type Props = {
  title: string;
  subTitle?: string;
  onBackButtonClicked: () => void;
  onClose?: () => void;
  showBackButton?: boolean;
  showCloseButton?: boolean;
};

// NOTE: While this header is technically a ui-component,
// keeping it here so we can progressively build it up as needed
// Also, because this will be ui-component, it is encouraged for now
// to use classNames to hide if necessary instead of useScreen and JS
const ModalHeader: React.FC<Props> = props => {
  const {
    showBackButton,
    showCloseButton,
    onBackButtonClicked,
    onClose,
    title,
    subTitle,
    ...otherProps
  } = props;

  return (
    <Header>
      <ButtonWrapper className="h-8 w-8">
        {showBackButton && (
          <ButtonIcon
            mode="secondary"
            size="small"
            icon={<IconChevronLeft />}
            onClick={onBackButtonClicked}
            bgWhite
            {...otherProps}
          />
        )}
      </ButtonWrapper>
      <div className="flex-1">
        <Title>{title}</Title>
        {subTitle && <SubTitle dangerouslySetInnerHTML={{__html: subTitle}} />}
      </div>
      <ButtonWrapper className="h-8 w-8">
        {showCloseButton && (
          <ButtonIcon
            mode="secondary"
            size="small"
            icon={<IconClose />}
            onClick={onClose}
            bgWhite
            className="hidden xl:block"
          />
        )}
      </ButtonWrapper>
    </Header>
  );
};

export default ModalHeader;

const Header = styled.div.attrs({
  className: 'flex rounded-xl space-x-4 xl:space-x-6 p-4 xl:p-6 bg-neutral-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Title = styled.div.attrs({
  className: 'font-semibold text-neutral-800 text-center xl:text-left',
})``;

const SubTitle = styled.div.attrs({
  className: 'mt-1 text-sm leading-normal text-neutral-600',
})``;

const ButtonWrapper = styled.div.attrs({className: 'w-8 h-8' as string})``;
