import React, {ReactNode} from 'react';
import {Backdrop} from '@aragon/ods-old';
import styled from 'styled-components';

export type BottomSheetProps = {
  children?: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  closeOnDrag?: boolean;
};

export default function BottomSheet({
  children,
  isOpen,
  onClose,
  title,
  subtitle,
  closeOnDrag = true,
}: BottomSheetProps) {
  // Allow swiping menu away
  const onTouchMove = () => {
    if (!closeOnDrag) return;
    onClose?.();
  };

  const backdropClose = () => {
    onClose?.();
  };

  const openStyle = {
    transition: 'max-height 0.5s ease-out, y 0.5s ease-out',
    y: 0,
    height: 'auto',
    maxHeight: '100vh',
  };
  const closedStyle = {
    transition: 'max-height 1s ease-out, y 1s ease-out',
    y: 100,
    height: 0,
    maxHeight: '0vh',
  };
  const currentStyle = isOpen ? openStyle : closedStyle;

  return (
    <>
      <Backdrop visible={isOpen} onClose={backdropClose} />
      <BottomSheetContainer
        style={currentStyle}
        onTouchMove={onTouchMove}
        isOpen={isOpen}
      >
        {title && (
          <ModalTitleContainer>
            <ModalTitle>{title}</ModalTitle>
            {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
          </ModalTitleContainer>
        )}
        {children}
      </BottomSheetContainer>
    </>
  );
}

const BottomSheetContainer = styled.div.attrs<{isOpen: boolean}>({
  className:
    'bg-neutral-50 block left-0 fixed bottom-0 md:bottom-6 w-full md:w-max md:max-w-full rounded-t-xl md:rounded-xl md:left-0 md:right-0 md:mx-auto z-30',
})`
  &:before {
    content: '';
    display: ${props => (props.isOpen ? 'inline-block' : 'none')};
    background: #e4e7eb;
    width: 120px;
    height: 6px;
    border-radius: 8px;
    position: absolute;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: -14px;
  }
`;

const ModalTitleContainer = styled.div.attrs({
  className: 'bg-neutral-0 rounded-xl p-6 space-y-1 text-center',
})`
  box-shadow:
    0px 10px 20px rgba(31, 41, 51, 0.04),
    0px 2px 6px rgba(31, 41, 51, 0.04),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const ModalTitle = styled.h1.attrs({
  className: 'font-semibold text-neutral-800',
})``;

const ModalSubtitle = styled.div.attrs({
  className: 'text-sm leading-normal text-neutral-500',
})``;
