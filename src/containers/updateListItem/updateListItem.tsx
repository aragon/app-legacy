import React, {useEffect} from 'react';
import {Link} from '@aragon/ods-old';
import {Button, Icon, IconType, Tag} from '@aragon/ods';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {Markdown} from 'tiptap-markdown';
import styled from 'styled-components';

import {IReleaseNote} from 'services/aragon-sdk/domain/release-note';

export const Icons = {
  multiSelect: {
    active: <Icon icon={IconType.CHECKBOX_SELECTED} />,
    default: <Icon icon={IconType.CHECKBOX} />,
    error: <Icon icon={IconType.CHECKBOX} />,
  },
  radio: {
    active: <Icon icon={IconType.RADIO_SELECTED} />,
    default: <Icon icon={IconType.RADIO} />,
    error: <Icon icon={IconType.RADIO} />,
  },
};

export type CheckboxListItemProps = {
  label?: string;
  linkLabel: string;
  releaseNote?: IReleaseNote;
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
  linkLabel,
  releaseNote,
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
  const editor = useEditor({
    editable: false,
    extensions: [StarterKit, Markdown],
  });

  // Update editor content on release notes change
  useEffect(() => {
    editor?.commands.setContent(releaseNote?.summary ?? '');
  }, [editor, releaseNote]);

  return (
    <Container data-testid="checkboxListItem" {...{type, disabled, onClick}}>
      <Wrapper>
        <div className="flex flex-col space-y-2">
          <HStack {...{disabled, type}}>
            <div className="flex space-x-2">
              <p className="font-semibold ft-text-base">{label}</p>
              {tagLabelNatural && <Tag label={tagLabelNatural} />}
              {tagLabelInfo && <Tag label={tagLabelInfo} variant="info" />}
            </div>
            {Icons[multiSelect ? 'multiSelect' : 'radio'][type]}
          </HStack>
          <Helptext>
            <EditorContent editor={editor} />
          </Helptext>
          <span>
            <Link
              label={linkLabel}
              iconRight={<Icon icon={IconType.LINK_EXTERNAL} />}
              href={releaseNote?.html_url}
            />
          </span>
        </div>
        {(buttonPrimaryLabel || buttonSecondaryLabel) && (
          <div className="mt-6 flex flex-col gap-y-3 md:flex-row">
            {buttonSecondaryLabel && (
              <Button
                variant="tertiary"
                disabled={disabled}
                size="md"
                onClick={onClickActionSecondary}
              >
                {buttonSecondaryLabel}
              </Button>
            )}
            {buttonPrimaryLabel && (
              <Button
                variant="primary"
                disabled={disabled}
                size="md"
                onClick={onClickActionPrimary}
              >
                {buttonPrimaryLabel}
              </Button>
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
  className: `flex-1 py-3 px-4 rounded-xl border-2 focus:outline-none focus-visible:ring focus-visible:ring-primary w-full ${
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
