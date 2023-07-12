import React, {ReactNode, useEffect} from 'react';
import styled, {CSSProperties} from 'styled-components';

export interface BackdropProps {
  /**
   * The `visible` prop determines whether your modal is visible.
   */
  visible?: boolean;
  /**
   * The `onClose` prop allows passing a function that will be called once the modal has been dismissed.
   */
  onClose?: () => void;
  /**
   * Children Element
   */
  children?: ReactNode;
}

/**
 * Backdrop UI component
 */
export const Backdrop: React.FC<BackdropProps> = ({
  visible = false,
  children,
  onClose,
  ...props
}) => {
  // TODO:Implement Backdrop to use as wrapper

  useEffect(() => {
    const html = document.querySelector('html');
    if (!html) return;
    html.style.overflow = visible ? 'hidden' : 'auto';
  }, [visible]);

  useEffect(() => {
    function lockScrollOnResize() {
      const html = document.querySelector('html');
      if (!visible || !html) return;
      html.style.overflow = 'hidden';
    }

    window?.addEventListener?.('resize', lockScrollOnResize);

    return () => {
      window?.removeEventListener?.('resize', lockScrollOnResize);
    };
  }, [visible]);

  return (
    <StyledBackdrop
      data-testid="backdrop-container"
      visible={visible}
      onClick={onClose}
      {...props}
    >
      {children}
    </StyledBackdrop>
  );
};

type StyledBackdropProps = {
  visible: boolean;
};

export const BackdropStyles = ({visible}: {visible: boolean}) => {
  const className: string = visible
    ? 'visible opacity-100 z-20'
    : 'invisible opacity-0';

  const css: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(167.96deg, rgba(31, 41, 51, 0.24) 0%, #1F2933 100%)',
    transition: 'visibility 0.2s, opacity 0.2s linear',
    backdropFilter: 'blur(24px)',
    cursor: 'pointer',
    marginTop: 0,
  };

  return {className, css};
};

const StyledBackdrop = styled.div.attrs(({visible}: StyledBackdropProps) => {
  const {className, css} = BackdropStyles({visible});
  return {className, style: css};
})<StyledBackdropProps>``;
