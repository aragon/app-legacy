import React from 'react';
import {styled} from 'styled-components';
import {Spinner} from '../spinner';
import {TextInput, type TextInputProps} from './textInput';
import {Icon, IconType} from '@aragon/ods';

export type SearchInputProps = Omit<
  TextInputProps,
  'leftAdornment' | 'rightAdornment'
> & {
  /**
   * Change input state into isLoading...
   */
  isLoading?: boolean;
};

export const SearchInput: React.FC<SearchInputProps> = ({
  isLoading = false,
  value,
  onChange,
  ...props
}) => {
  return (
    <TextInput
      data-testid="search-input"
      leftAdornment={
        isLoading ? (
          <LeftAdornmentWrapper>
            <Spinner size="small" />
          </LeftAdornmentWrapper>
        ) : (
          <LeftAdornmentWrapper>
            <Icon icon={IconType.SEARCH} className="text-neutral-300" />
          </LeftAdornmentWrapper>
        )
      }
      value={value}
      onChange={onChange}
      rightAdornment={
        value !== '' && (
          <button
            style={{cursor: 'pointer'}}
            onClick={() => {
              if (onChange) {
                onChange({
                  target: {
                    value: '',
                  },
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          >
            <RightAdornmentWrapper>
              <Icon icon={IconType.CLOSE} className="text-neutral-300" />
            </RightAdornmentWrapper>
          </button>
        )
      }
      {...props}
    />
  );
};

const LeftAdornmentWrapper = styled.div.attrs({
  className: 'pl-4 pr-3',
})``;

const RightAdornmentWrapper = styled.div.attrs({
  className: 'pr-4',
})``;
