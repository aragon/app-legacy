import React from 'react';
import {Modal, ModalProps} from '@aragon/ods-old';
import BottomSheet, {BottomSheetProps} from 'components/bottomSheet';
import useScreen from 'hooks/useScreen';

type ModalBottomSheetSwitcherProps = ModalProps &
  Omit<BottomSheetProps, 'isOpen'>;

const ModalBottomSheetSwitcher: React.FC<ModalBottomSheetSwitcherProps> = ({
  title,
  subtitle,
  isOpen = false,
  onClose,
  children,
  closeOnDrag,
  onOpenAutoFocus,
}) => {
  const {isDesktop} = useScreen();

  if (isDesktop) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        onOpenAutoFocus={onOpenAutoFocus}
      >
        {children}
      </Modal>
    );
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      closeOnDrag={closeOnDrag}
    >
      {children}
    </BottomSheet>
  );
};

export default ModalBottomSheetSwitcher;
