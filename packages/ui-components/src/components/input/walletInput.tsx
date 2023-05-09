import React, {
  ReactEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';

import {
  IsAddress,
  isEnsDomain,
  shortenAddress,
  shortenENS,
} from '../../utils/addresses';
import {ButtonIcon, ButtonText} from '../button';
import {IconCopy, IconLinkExternal} from '../icons';
import {AlertChip} from '../alerts';

/** Input Wallet value type */
export type InputValue = {
  ensName: string | null;
  address: string | null;
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
  value: InputValue;

  /**
   * A callback function that is called when the value of the input field changes.
   * It takes the new value as an argument.
   */
  onValueChange: (newValue: InputValue) => void;

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
  onViewExplorerButtonClick?: ReactEventHandler<HTMLButtonElement>;

  /**
   * The URL to be used for opening the ENS name and address in an external block explorer.
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
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const wasNotEditingRef = useRef(true);

    const [showAlert, setShowAlert] = useState(false);
    const [alertLabel, setAlertLabel] = useState('');

    const [truncate, setTruncate] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [displayMode, setDisplayMode] = useState<DisplayMode>();
    const [initialHeight, setInitialHeight] = useState(0);
    const [resolvedValues, setResolvedValues] = useState<InputValue>();

    const canToggle = Boolean(value.address) && Boolean(value.ensName);
    const togglerLabel = displayMode === 'address' ? 'ENS' : '0x...';

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
      if (isEditing) return fullValue;

      if (displayMode === 'address') return shortenAddress(value.address);

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
      async function resolveValues() {
        const newValue = {...value};

        if (displayMode === 'address') {
          // clear previous ens & fetch new resolved ens
          newValue.ensName = '';
          try {
            // only fetch when it's a valid address
            if (IsAddress(fullValue)) {
              const result = await resolveEnsNameFromAddress?.(fullValue);
              newValue.ensName = result?.toLowerCase() ?? null;
            }
          } catch (error) {
            console.warn('Unable to resolve ens subdomain');
          }
        } else if (resolveAddressFromEnsName) {
          // clear previous address & fetch new address
          newValue.address = '';
          try {
            // only fetch when it's a valid ens
            if (isEnsDomain(fullValue)) {
              const result = await resolveAddressFromEnsName(fullValue);
              newValue.address = result?.toLowerCase() ?? null;
            }
          } catch (error) {
            console.warn('Unable to lookup address');
          }
        }

        setResolvedValues(newValue);
      }

      if (
        displayMode &&
        value[displayMode] &&
        JSON.stringify(value) !== JSON.stringify(resolvedValues)
      )
        resolveValues();
    }, [
      resolveEnsNameFromAddress,
      displayMode,
      resolveAddressFromEnsName,
      fullValue,
      resolvedValues,
      value,
    ]);

    useEffect(() => {
      if (resolvedValues) {
        // update the controller value if it is not he same as the resolved values;
        // this works in conjunction with the previous hook
        const resolvedType = displayMode === 'address' ? 'ensName' : 'address';
        if (value[resolvedType] !== resolvedValues[resolvedType])
          onValueChange(resolvedValues);
      }
    }, [displayMode, onValueChange, resolvedValues, value]);

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
            if (prev) return prev;
            else return getTextAreaHeight(textareaRef.current);
          });
        }

        // adjust height so input grows as filled
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + 'px';
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

    /*************************************************
     *             Callbacks and handlers            *
     *************************************************/
    const alert = useCallback((label: string) => {
      setAlertLabel(label);
      setShowAlert(true);

      setTimeout(() => {
        setShowAlert(false);
      }, 1200);
    }, []);

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
        // if clearing the input, clear resolved data as well
        if (addressOrEns === '') {
          setResolvedValues({ensName: '', address: ''});
          return {ensName: '', address: ''};
        }

        // set proper display mode based on the value
        if (IsAddress(addressOrEns)) {
          setDisplayMode('address');
          return {...value, address: addressOrEns.toLowerCase()};
        } else {
          setDisplayMode('ensName');
          return {...value, ensName: addressOrEns.toLowerCase()};
        }
      },
      [value]
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
        alert('Cleared');
        onClearButtonClick?.(event);
      },
      [alert, onClearButtonClick, onValueChange, setValue]
    );

    const handlePasteFromClipboard = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        try {
          const clipboardData = await navigator.clipboard.readText();

          setIsEditing(true);
          onValueChange(setValue(clipboardData));
          alert('Pasted');
          onPasteButtonClick?.(event);
        } catch (err) {
          console.error('Failed to read clipboard contents: ', err);
        }
      },
      [alert, onPasteButtonClick, onValueChange, setValue]
    );

    const handleCopyToClipboard = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        navigator.clipboard.writeText(
          (displayMode === 'address' ? value.address : value.ensName) || ''
        );
        alert('Copied');
        onCopyButtonClick?.(event);
      },
      [alert, displayMode, onCopyButtonClick, value.address, value.ensName]
    );

    /*************************************************
     *                    Render                     *
     *************************************************/
    return (
      <>
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
              <ButtonText
                label="Paste"
                size="small"
                mode="secondary"
                bgWhite
                onClick={handlePasteFromClipboard}
                disabled={disabled}
              />
            )}
            {displayedValue && isEditing && (
              <ButtonText
                label="Clear"
                size="small"
                mode="secondary"
                bgWhite
                onMouseDown={handleClearInput}
                disabled={disabled}
              />
            )}

            {displayedValue && !isEditing && (
              <AdornmentWrapper>
                {canToggle && (
                  <ButtonText
                    label={togglerLabel}
                    size="small"
                    mode="secondary"
                    bgWhite={true}
                    onClick={toggleDisplayMode}
                    disabled={adornmentsDisabled}
                  />
                )}
                <ButtonIcon
                  icon={<IconCopy />}
                  mode="secondary"
                  size="small"
                  bgWhite
                  onClick={handleCopyToClipboard}
                  disabled={adornmentsDisabled}
                />
                {showExternalButton && (
                  <ButtonIcon
                    icon={<IconLinkExternal />}
                    mode="secondary"
                    size="small"
                    bgWhite
                    disabled={adornmentsDisabled}
                    onClick={e => {
                      window.open(blockExplorerURL);
                      onViewExplorerButtonClick?.(e);
                    }}
                  />
                )}
              </AdornmentWrapper>
            )}
          </div>
        </Container>
        <div className="absolute right-0 w-full">
          <AlertChip label={alertLabel} isShown={showAlert} />
        </div>
      </>
    );
  }
);

WalletInput.displayName = 'WalletInput';

function getTextAreaHeight(element: HTMLTextAreaElement | null) {
  if (element === null) return 0;

  return Number(element.style.height.split('px')[0]);
}

export const StyledInput = styled.textarea.attrs(() => {
  const baseClassName =
    'w-full items-center appearance-none bg-transparent border-none outline-none resize-none font-inherit p-0 m-0';
  const disabledClassName = 'disabled:cursor-not-allowed';

  const className: string | undefined = `${baseClassName} ${disabledClassName}`;

  return {className};
})``;

export const InputWrapper = styled.div.attrs({
  className: 'flex items-center w-full',
})``;

type StyledContainerProps = Pick<WalletInputProps, 'state' | 'disabled'>;

const AdornmentWrapper = styled.div.attrs(() => {
  const className = 'flex items-center space-x-0.75 border-blue-600';

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
      return 'border-ui-100';
  }
};

export const Container = styled.div.attrs(
  ({state, disabled}: StyledContainerProps) => {
    const baseClassName =
      'border flex space-x-1.5 py-1 pr-1 pl-2 text-ui-600 rounded-xl';
    const modeClassName = modeStyles(state);

    const focusClass = disabled
      ? 'cursor-not-allowed'
      : 'focus-within:ring-2 focus-within:ring-primary-500';

    const bgAndBorderColor = disabled ? 'bg-ui-100 border-ui-200' : 'bg-ui-0';

    return {
      className: `${baseClassName} ${modeClassName} ${focusClass} ${bgAndBorderColor}`,
    };
  }
)<StyledContainerProps>``;
