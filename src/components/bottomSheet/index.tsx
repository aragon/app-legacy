import React, {useEffect, ReactNode} from 'react';
import {motion, PanInfo, useAnimationControls} from 'framer-motion';
import {Backdrop} from '@aragon/ods-old';
import styled from 'styled-components';

import usePrevious from 'hooks/usePrevious';

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
  const prevIsOpen = usePrevious(isOpen);
  const controls = useAnimationControls();

  // For adding drag on bottom sheet
  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (!closeOnDrag) {
      controls.start('visible');
      return;
    }

    const shouldClose =
      info.velocity.y > 20 || (info.velocity.y >= 0 && info.point.y > 45);
    if (shouldClose) {
      controls.start('hidden');
      onClose?.();
    } else {
      controls.start('visible');
    }
  }
  // For Run animation on each state change
  useEffect(() => {
    if (prevIsOpen && !isOpen) {
      controls.start('hidden');
    } else if (!prevIsOpen && isOpen) {
      controls.start('visible');
    }
  }, [controls, isOpen, prevIsOpen]);

  return (
    <>
      <Backdrop visible={isOpen} onClose={onClose} />
      <StyledMotionContainer
        drag="y"
        onDragEnd={onDragEnd}
        initial="hidden"
        animate={controls}
        transition={{
          type: 'spring',
          damping: 40,
          stiffness: 400,
        }}
        variants={{
          visible: {y: 0, height: 'auto'},
          hidden: {y: 100, height: 0},
        }}
        dragConstraints={{top: 0}}
        dragElastic={0.2}
      >
        {title && (
          <ModalTitleContainer>
            <ModalTitle>{title}</ModalTitle>
            {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}
          </ModalTitleContainer>
        )}
        {children}
      </StyledMotionContainer>
    </>
  );
}

const StyledMotionContainer = styled(motion.div).attrs({
  className:
    'bg-neutral-50 block left-0 fixed bottom-0 md:bottom-6 w-full md:w-max md:max-w-full rounded-t-xl md:rounded-xl md:left-0 md:right-0 md:mx-auto z-30',
})`
  &:before {
    content: '';
    display: inline-block;
    background: #e4e7eb;
    width: 120px;
    height: 6px;
    border-radius: 8px;
    position: absolute;
    margin: 0px auto 0px auto;
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
