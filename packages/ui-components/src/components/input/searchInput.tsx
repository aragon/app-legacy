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
          <LeftAdornmentWrapper>
            <Spinner size={'small'} />
          </LeftAdornmentWrapper>
        ) : (
          <LeftAdornmentWrapper>
            <IconSearch className="text-ui-300" />
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
              <IconClose className="text-ui-300" />
            </RightAdornmentWrapper>
          </button>
        )
      }
      {...props}
    />
  );
};

const LeftAdornmentWrapper = styled.div.attrs({
  className: 'pl-2 pr-1.5',
})``;

const RightAdornmentWrapper = styled.div.attrs({
  className: 'pr-2',
})``;
