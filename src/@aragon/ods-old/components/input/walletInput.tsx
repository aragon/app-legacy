import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactEventHandler,
} from 'react';
import {styled} from 'styled-components';

import {
  IsAddress,
  isEnsDomain,
  shortenAddress,
  shortenENS,
} from '../../utils/addresses';
import {Button, IconType} from '@aragon/ods';

/** Input Wallet value type */
export type WalletInputValue = {
  ensName: string;
  address: string;
};

// Toggle type for value to show in textarea input
type DisplayMode = 'address' | 'ensName';

/**
 * WalletInputProps is a type that defines the properties for a wallet input component.
 * It extends the properties of an HTMLTextAreaElement, except for 'value' and 'onChange'.
 */
export type WalletInputProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange'
> & {
  /** Input field props */
  /**
   * The current value of the input field. Note that this is the full value.
   */
  value: WalletInputValue;

  /**
   * A callback function that is called when the value of the input field changes.
   * It takes the new value as an argument.
   */
  onValueChange: (newValue: WalletInputValue) => void;

  /**
   * Changes the input's color schema.
   */
  state?: 'success' | 'warning' | 'critical';

  /** Button event handlers */
  /**
   * An optional event handler that is called when the toggle button is clicked.
   */
  onToggleButtonClick?: ReactEventHandler<HTMLButtonElement>;

  /**
   * An optional event handler that is called when the clear button is clicked.
   */
  onClearButtonClick?: ReactEventHandler<HTMLButtonElement>;

  /**
   * An optional event handler that is called when the paste button is clicked.
   */
  onPasteButtonClick?: ReactEventHandler<HTMLButtonElement>;

  /**
   * An optional event handler that is called when the copy button is clicked.
   */
  onCopyButtonClick?: ReactEventHandler<HTMLButtonElement>;

  /**
   * An optional event handler that is called when the view explorer button is clicked.
   */
  onViewExplorerButtonClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    addressOrEns: string
  ) => void;

  /**
   * The URL to be used for opening the ENS name and address in an external block explorer.
   * This requires a format where the ENS name or address can be appended to the end of the
   * given URL
   */
  blockExplorerURL?: string;

  /** ENS and address resolvers */
  /**
   * Function to get ENS subdomain using an address.
   */
  resolveEnsNameFromAddress?: (
    address: string | Promise<string>
  ) => Promise<string | null>;

  /**
   * Function to get address from an ENS subdomain.
   */
  resolveAddressFromEnsName?: (
    ensName: string | Promise<string>
  ) => Promise<string | null>;

  /**
   * An optional event handler to be called when the corresponding address has been found
   */
  onEnsResolved?: (ensName: string | null) => void;

  /**
   * An optional event handler to be called when the address has been validated
   */
  onAddressValidated?: (address: string | null) => void;

  /**
   * An optional event handler to be called when an error occurs while resolving
   * an address or ENS name
   */
  onResolvingError?: (error: Error) => void;
};

export const WalletInput = React.forwardRef<
  HTMLTextAreaElement,
  WalletInputProps
>(
  (
    {
      state,
      value,
      disabled,
      blockExplorerURL,
      onFocus,
      onWheel,
      onValueChange,
      onToggleButtonClick,
      onClearButtonClick,
      onPasteButtonClick,
      onCopyButtonClick,
      onViewExplorerButtonClick,
      resolveEnsNameFromAddress,
      resolveAddressFromEnsName,
      onAddressValidated,
      onEnsResolved,
      onResolvingError,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const wasNotEditingRef = useRef(true);

    const [truncate, setTruncate] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [displayMode, setDisplayMode] = useState<DisplayMode>(() =>
      value.ensName ? 'ensName' : 'address'
    );
    const [initialHeight, setInitialHeight] = useState(0);

    const canToggle = !!value.address && !!value.ensName;
    const togglerLabel = displayMode === 'address' ? 'ENS' : '0x…';
    const ensSupported =
      !!resolveAddressFromEnsName && !!resolveEnsNameFromAddress;

    // holds the full format of the potentially shortened value in the input
    const fullValue: string = useMemo(() => {
      return String(displayMode === 'address' ? value.address : value.ensName);
    }, [displayMode, value.address, value.ensName]);

    // Only show see on scan button if the input is valid
    const showExternalButton =
      blockExplorerURL && (IsAddress(fullValue) || isEnsDomain(fullValue));
    const adornmentsDisabled = disabled && !fullValue;

    // This displays the truncated address/ens when the value is not being
    // edited by the user, or in the case of ens, when the length of the name
    // would have otherwise overflown
    const displayedValue = useMemo(() => {
      // show full value if user is editing
      if (isEditing) {
        return fullValue;
      }

      if (displayMode === 'address') {
        return shortenAddress(value.address);
      }

      // Get the current height and compare it with the initial height.
      // because the input row is set to 1, when the input gets filled,
      // the height is being adjusted so that the overflow is not hidden.
      // The height being modified means that the text would have otherwise
      // wrapped/overflown.
      if (getTextAreaHeight(textareaRef.current) > initialHeight || truncate) {
        setTruncate(false);
        return shortenENS(value.ensName);
      } else {
        return value.ensName as string;
      }
    }, [
      displayMode,
      fullValue,
      initialHeight,
      isEditing,
      truncate,
      value.address,
      value.ensName,
    ]);

    /*************************************************
     *               Hooks & Effects                 *
     *************************************************/
    useEffect(() => {
      // Use the isActive flag to avoid racing conditions when changing the input value
      // and resolving the ENS names or addresses
      let isActive = true;

      async function resolveValues() {
        const newValue = {...value};

        if (displayMode === 'address') {
          try {
            // only fetch when it's a valid address
            if (IsAddress(fullValue)) {
              onAddressValidated?.(fullValue);

              // resolve ens name
              const result = await resolveEnsNameFromAddress?.(fullValue);
              newValue.ensName = result?.toLowerCase() ?? '';
            }
          } catch (error) {
            onResolvingError?.(error as Error);
            newValue.ensName = '';
          }
        } else if (resolveAddressFromEnsName) {
          try {
            // only fetch when it's a valid ens
            if (isEnsDomain(fullValue)) {
              const result = await resolveAddressFromEnsName?.(fullValue);
              newValue.address = result?.toLowerCase() ?? '';

              // wait until the corresponding ens value is resolved
              newValue.address && onEnsResolved?.(value.address);
            }
          } catch (error) {
            onResolvingError?.(error as Error);
            newValue.address = '';
          }
        }

        const didChange =
          value.address !== newValue.address ||
          value.ensName !== newValue.ensName;
        if (isActive && didChange) {
          onValueChange(newValue);
        }
      }

      if (ensSupported && value[displayMode]) {
        resolveValues();
      }

      return () => {
        isActive = false;
      };
    }, [
      displayMode,
      ensSupported,
      fullValue,
      onAddressValidated,
      onEnsResolved,
      onResolvingError,
      resolveAddressFromEnsName,
      resolveEnsNameFromAddress,
      onValueChange,
      value,
    ]);

    // resolve the forwarded ref and local ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(textareaRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          textareaRef.current;
      }
    }, [ref]);

    // adjust textarea height so that it grows as filled
    useEffect(() => {
      if (textareaRef.current) {
        // get the initial height of the text area
        if (textareaRef.current.style.height !== null) {
          setInitialHeight(prev => {
            if (prev) {
              return prev;
            } else {
              return getTextAreaHeight(textareaRef.current);
            }
          });
        }

        // adjust height so input grows as filled
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing, value, displayedValue]);

    // select text on focus, this needs to be done here instead of onFocus because
    // updating the isEditing state will remove the focus when the component re-renders
    useEffect(() => {
      if (wasNotEditingRef && isEditing) {
        textareaRef.current?.select();
      }
    }, [isEditing]);

    useEffect(() => {
      if (!isEditing) {
        if (getTextAreaHeight(textareaRef.current) > initialHeight) {
          setTruncate(true);
        }
      }
    }, [initialHeight, isEditing, displayedValue]);

    // Update wallet display mode on value change
    useEffect(() => {
      if (
        IsAddress(value.address) ||
        !ensSupported ||
        value.address.startsWith('0x')
      ) {
        setDisplayMode('address');
      } else {
        setDisplayMode('ensName');
      }
    }, [value.address, ensSupported]);

    /*************************************************
     *             Callbacks and handlers            *
     *************************************************/
    // Show ens or address
    const toggleDisplayMode = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        const newDisplayMode: DisplayMode =
          displayMode === 'address' ? 'ensName' : 'address';

        setDisplayMode(newDisplayMode);
        onToggleButtonClick?.(event);
      },
      [displayMode, onToggleButtonClick]
    );

    const handleContainerBlur = useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsEditing(false);
        wasNotEditingRef.current = false;
      },
      []
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsEditing(true);
        wasNotEditingRef.current = true;
        onFocus?.(event);
      },
      [onFocus]
    );

    const handleOnWheel = useCallback(
      (event: React.WheelEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        event.currentTarget.blur();
        onWheel?.(event);
      },
      [onWheel]
    );

    const setValue = useCallback(
      (addressOrEns: string) => {
        const newValue = {ensName: '', address: ''};

        if (
          IsAddress(addressOrEns) ||
          !ensSupported ||
          addressOrEns.startsWith('0x')
        ) {
          newValue.address = addressOrEns.toLowerCase();
        } else {
          newValue.ensName = addressOrEns.toLowerCase();
        }

        return newValue;
      },
      [ensSupported]
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(setValue(event.target.value));
      },

      [onValueChange, setValue]
    );

    const handleClearInput = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        onValueChange(setValue(''));
        setIsEditing(true);
        onClearButtonClick?.(event);
      },
      [onClearButtonClick, onValueChange, setValue]
    );

    const handlePasteFromClipboard = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        try {
          const clipboardData = await navigator.clipboard.readText();

          setIsEditing(false);
          onValueChange(setValue(clipboardData));
          onPasteButtonClick?.(event);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to read clipboard contents: ', err);
        }
      },
      [onPasteButtonClick, onValueChange, setValue]
    );

    const handleCopyToClipboard = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        navigator.clipboard.writeText(
          (displayMode === 'address' ? value.address : value.ensName) || ''
        );
        onCopyButtonClick?.(event);
      },
      [displayMode, onCopyButtonClick, value.address, value.ensName]
    );

    const handleViewOnExplorer = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        window.open(blockExplorerURL + fullValue);
        onViewExplorerButtonClick?.(event, fullValue);
      },
      [blockExplorerURL, fullValue, onViewExplorerButtonClick]
    );

    /*************************************************
     *                    Render                     *
     *************************************************/
    return (
      <Container
        data-testid="input-wallet"
        state={state}
        disabled={disabled}
        onBlur={handleContainerBlur}
      >
        <InputWrapper>
          <StyledInput
            {...props}
            ref={textareaRef}
            rows={1}
            value={displayedValue}
            onFocus={handleFocus}
            onWheel={handleOnWheel}
            onChange={handleChange}
            disabled={disabled}
          />
        </InputWrapper>

        <div>
          {!displayedValue && (
            <Button
              size="sm"
              variant="tertiary"
              onClick={handlePasteFromClipboard}
              disabled={disabled}
            >
              Paste
            </Button>
          )}
          {displayedValue && isEditing && (
            <Button
              size="sm"
              variant="tertiary"
              onMouseDown={handleClearInput}
              disabled={disabled}
            >
              Clear
            </Button>
          )}

          {displayedValue && !isEditing && (
            <AdornmentWrapper>
              {canToggle && (
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={toggleDisplayMode}
                  disabled={adornmentsDisabled}
                >
                  {togglerLabel}
                </Button>
              )}
              <Button
                iconLeft={IconType.COPY}
                variant="tertiary"
                size="sm"
                onClick={handleCopyToClipboard}
                disabled={adornmentsDisabled}
              />
              {showExternalButton && (
                <Button
                  iconLeft={IconType.LINK_EXTERNAL}
                  variant="tertiary"
                  size="sm"
                  disabled={adornmentsDisabled}
                  onClick={handleViewOnExplorer}
                />
              )}
            </AdornmentWrapper>
          )}
        </div>
      </Container>
    );
  }
);

WalletInput.displayName = 'WalletInput';

function getTextAreaHeight(element: HTMLTextAreaElement | null) {
  if (element === null) {
    return 0;
  }

  return Number(element.style.height.split('px')[0]);
}

export const StyledInput = styled.textarea.attrs(() => {
  const baseClassName =
    'w-full items-center appearance-none bg-[transparent] border-none outline-none resize-none font-inherit p-0 m-0';
  const disabledClassName = 'disabled:cursor-not-allowed';

  const className: string | undefined = `${baseClassName} ${disabledClassName}`;

  return {className};
})``;

export const InputWrapper = styled.div.attrs({
  className: 'flex items-center w-full',
})``;

type StyledContainerProps = Pick<WalletInputProps, 'state' | 'disabled'>;

const AdornmentWrapper = styled.div.attrs(() => {
  const className = 'flex items-center space-x-1.5 border-blue-600';

  return {className};
})``;

const modeStyles = (state: WalletInputProps['state']) => {
  switch (state) {
    case 'success':
      return 'border-success-600';
    case 'warning':
      return 'border-warning-600';
    case 'critical':
      return 'border-critical-600';
    default:
      return 'border-neutral-100';
  }
};

export const Container = styled.div.attrs<StyledContainerProps>(
  ({state, disabled}) => {
    const baseClassName = 'border-2 flex space-x-3 py-1.5 pr-2 pl-4 rounded-xl';
    const modeClassName = modeStyles(state);

    const focusClass = disabled
      ? ''
      : 'focus-within:border-primary-500 focus-within:hover:border-primary-500';

    const bgAndBorderColor = disabled
      ? 'bg-neutral-100 border-neutral-200 text-neutral-700'
      : 'bg-neutral-0 text-neutral-600';

    return {
      className: `${baseClassName} ${modeClassName} ${bgAndBorderColor} ${focusClass}`,
    };
  }
)<StyledContainerProps>``;
