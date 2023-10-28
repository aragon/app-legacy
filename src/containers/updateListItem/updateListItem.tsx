import {
  ButtonText,
  IconCheckboxDefault,
  IconCheckboxSelected,
  IconLinkExternal,
  IconRadioDefault,
  IconRadioSelected,
  Link,
  Tag,
} from '@aragon/ods-old';
import React from 'react';
import styled from 'styled-components';

export const Icons = {
  multiSelect: {
    active: <IconCheckboxSelected />,
    default: <IconCheckboxDefault />,
    error: <IconCheckboxDefault />,
  },
  radio: {
    active: <IconRadioSelected />,
    default: <IconRadioDefault />,
    error: <IconRadioDefault />,
  },
};

export type CheckboxListItemProps = {
  label: string;
  helptext?: string;
  LinkLabel: string;
  tagLabelNatural?: string;
  tagLabelInfo?: string;
  disabled?: boolean;
  type?: 'default' | 'error' | 'active';
  multiSelect?: boolean;
  buttonPrimaryLabel?: string;
  buttonSecondaryLabel?: string;
  onClick?: React.MouseEventHandler;
  onClickActionPrimary?: (e: React.MouseEvent) => void;
  onClickActionSecondary?: (e: React.MouseEvent) => void;
};

// TODO: This might be a component that
export const UpdateListItem: React.FC<CheckboxListItemProps> = ({
  label,
  helptext,
  LinkLabel,
  tagLabelNatural,
  tagLabelInfo,
  disabled = false,
  type = 'default',
  multiSelect = false,
  buttonPrimaryLabel,
  buttonSecondaryLabel,
  onClick,
  onClickActionPrimary,
  onClickActionSecondary,
}) => {
  return (
    <Container data-testid="checkboxListItem" {...{type, disabled, onClick}}>
      <Wrapper>
        <div className="flex flex-col space-y-2">
          <HStack {...{disabled, type}}>
            <div className="flex space-x-2">
              <p className="font-semibold ft-text-base">{label}</p>
              {tagLabelNatural && (
                <Tag label={tagLabelNatural} colorScheme="neutral" />
              )}
              {tagLabelInfo && <Tag label={tagLabelInfo} colorScheme="info" />}
            </div>
            {Icons[multiSelect ? 'multiSelect' : 'radio'][type]}
          </HStack>
          <Helptext>{helptext}</Helptext>
          <Link label={LinkLabel} iconRight={<IconLinkExternal />} />
        </div>
        {(buttonPrimaryLabel || buttonSecondaryLabel) && (
          <div className="mt-6 flex flex-col gap-y-3">
            {buttonPrimaryLabel && (
              <ButtonText
                label={buttonPrimaryLabel}
                mode="primary"
                disabled={disabled}
                size="medium"
                onClick={onClickActionPrimary}
              />
            )}
            {buttonSecondaryLabel && (
              <ButtonText
                label={buttonSecondaryLabel}
                mode="secondary"
                bgWhite
                disabled={disabled}
                size="medium"
                onClick={onClickActionSecondary}
              />
            )}
          </div>
        )}
      </Wrapper>
    </Container>
  );
};

type ContainerTypes = {
  disabled: boolean;
  type: 'default' | 'error' | 'active';
};

const Container = styled.div.attrs<ContainerTypes>(({disabled, type}) => ({
  className: `flex-1 py-3 px-4 rounded-xl border-2 focus:outline-none focus-visible:ring focus-visible:ring-primary ${
    disabled
      ? 'bg-neutral-100 border-neutral-300'
      : `bg-neutral-0 group hover:border-primary-500 cursor-pointer ${
          type === 'error'
            ? 'border-critical-500'
            : type !== 'default'
            ? 'border-primary-500'
            : 'border-neutral-100'
        }`
  }`,
  tabIndex: disabled ? -1 : 0,
}))<ContainerTypes>``;

const Wrapper = styled.div.attrs({
  className: 'flex flex-col justify-between h-full',
})``;

const HStack = styled.div.attrs<ContainerTypes>(({disabled, type}) => ({
  className:
    `flex justify-between items-center group-hover:text-primary-500 space-x-3 ${
      disabled
        ? 'text-neutral-600'
        : type === 'default' || type === 'error'
        ? 'text-neutral-600'
        : 'text-primary-500'
    }` as string,
}))<ContainerTypes>``;

const Helptext = styled.p.attrs({
  className: 'ft-text-base text-neutral-500 mr-7',
})``;
