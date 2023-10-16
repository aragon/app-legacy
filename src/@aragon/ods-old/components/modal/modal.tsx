import {
  Close,
  Content,
  Overlay,
  Portal,
  Root,
  Title,
} from '@radix-ui/react-dialog';
import React, {type CSSProperties, type ReactNode} from 'react';
import {styled} from 'styled-components';
import {BackdropStyles} from '../backdrop';
import {IconClose} from '../icons';

export interface ModalProps {
  /**
   * The controlled open state of the Modal.
   */
  isOpen?: boolean;
  /**
   * Modal title. if the title exists close button will appear
   */
  title?: string;
  /**
   * Modal subtitle
   */
  subtitle?: string;
  /**
   * Content
   */
  children: ReactNode;
  /**
   * Styles
   */
  style?: CSSProperties | undefined;
  /**
   * The `onClose` prop allows passing a function that will be called once the modal has been dismissed.
   */
  onClose?: () => void;

  onOpenAutoFocus?: (e: Event) => void;

  onInteractOutside?: () => void;
}

/**
 * Default UI component
 */
export const Modal: React.FC<ModalProps> = ({
  title,
  subtitle,
  children,
  isOpen = true,
  onClose,
  onOpenAutoFocus = e => e.preventDefault(),
  onInteractOutside = onClose,
  ...props
}) => {
  return (
    <Root open={isOpen}>
      <Portal>
        <ModalOverlay />
        <ModalContainer
          data-testid="modal-content"
          onInteractOutside={onInteractOutside}
          onEscapeKeyDown={onClose}
          onOpenAutoFocus={onOpenAutoFocus}
          {...props}
        >
          {title && (
            <ModalHeader>
              <ModalTitleContainer>
                <ModalTitle>{title}</ModalTitle>
                {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
              </ModalTitleContainer>
              <ModalClose onClick={onClose}>
                <IconClose height={10} width={10} className="mx-auto" />
              </ModalClose>
            </ModalHeader>
          )}
          {children}
        </ModalContainer>
      </Portal>
    </Root>
  );
};

type StyledContentProps = Pick<ModalProps, 'style'>;

const ModalContainer = styled(Content).attrs(({style}: StyledContentProps) => {
  const className = 'bg-neutral-50 z-30';
  const currentStyle: CSSProperties = style ?? {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    boxShadow:
      '0px 24px 32px rgba(31, 41, 51, 0.04), 0px 16px 24px rgba(31, 41, 51, 0.04), 0px 4px 8px rgba(31, 41, 51, 0.04), 0px 0px 1px rgba(31, 41, 51, 0.04)',
    borderRadius: 12,
    width: '90vw',
    maxWidth: '448px',
    maxHeight: '75vh',
    outline: 'none',
    overflow: 'auto',
  };

  return {style: currentStyle, className};
})<StyledContentProps>``;

const ModalHeader = styled.div.attrs({
  className:
    'flex justify-between items-start bg-white rounded-xl p-3 space-x-3 sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const ModalTitleContainer = styled.div.attrs({
  className: 'space-y-0.5',
})``;

const ModalTitle = styled(Title).attrs({
  className: 'font-bold text-neutral-800',
})``;

const ModalSubtitle = styled.div.attrs({
  className: 'ft-text-sm text-neutral-500',
})``;

const ModalClose = styled(Close).attrs({
  className: 'shrink-0 text-neutral-500 w-4 h-4 rounded-lg bg-neutral-50 outline:none',
})``;

const ModalOverlay = styled(Overlay).attrs(() => {
  const {className, css} = BackdropStyles({visible: true});

  return {className, style: css};
})``;
