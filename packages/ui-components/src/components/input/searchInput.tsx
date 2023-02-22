import React from 'react';
import styled from 'styled-components';

import {IconClose, IconSearch} from '../icons';
import {Spinner} from '../spinner';
import {TextInput, TextInputProps} from './textInput';

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
          <AdornmentWrapper>
            <Spinner size={'small'} />
          </AdornmentWrapper>
        ) : (
          <AdornmentWrapper>
            <IconSearch className="text-ui-300" />
          </AdornmentWrapper>
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
            <IconClose className="text-ui-300" />
          </button>
        )
      }
      {...props}
    />
  );
};

const AdornmentWrapper = styled.div.attrs({
  className: 'pl-2 pr-1.5',
})``;
