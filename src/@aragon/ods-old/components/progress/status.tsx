import React from 'react';
import {styled} from 'styled-components';
import {type LabelProps} from '../label';
import {Spinner} from '../spinner';
import {Icon, IconType} from '@aragon/ods';

export type ModeType = 'active' | 'failed' | 'done' | 'succeeded' | 'upcoming';
export type ProgressStatusProps = {
  /**
   * The mode is the state of a progress' status. Simple, init? ;)
   *
   * Think about it this way: Imagine a list of todos. Each of those todos may
   * be associated with a status of progress. If the todo:
   *  - has not been tackled, its progress status would be "upcoming".
   *  - is being tackled, progress status would be "active".
   *  - has been tackled, its progress status would be "done".
   *
   * The additional states "succeeded" and "failed" can be used to additionally
   * describe a todo that is done.
   */
  mode: ModeType;
  /**
   * Describes the name of the progress step. Think of it as the name of the
   * todo in the example above.
   */
  label: string;
  /**
   * Describes when the progress status was last changed. Every mode of progress
   * status MUST have a date, EXCEPT for:
   * - "upcoming"  which NEVER has a date, (as it is in the future)
   * - "failed" might not have a date of failure (in the case of a failed execution)
   *
   * If no date is passed when one is required, a fallback text will be displayed.
   * */
  date?: string;
  /**
   * If the progress status changed due to an event on a blockchain, the
   * corresponding block MAY be passed. Note that upcoming, active and rejected
   * mode can NEVER have a block associated.
   */
  block?: string;
};

export const ProgressStatus: React.FC<ProgressStatusProps> = ({
  label,
  mode,
  date,
  block,
}) => {
  if (mode !== 'upcoming' && mode !== 'failed' && !date) {
    date = 'No information available';
  }
  const mayHaveBlock = mode === 'done' || mode === 'succeeded';
  return (
    <TopContainer data-testid="progressStatus">
      <LeftContainer mode={mode}>
        <IconContainer>
          <VariableIcon mode={mode} />
        </IconContainer>
        <LabelContainer>
          <CustomLabel label={label} helpText={date} />
        </LabelContainer>
      </LeftContainer>
      {block && mayHaveBlock && (
        <BlockContainer>
          <p>{block}</p>
          <div className="pt-0.5">
            <Icon
              icon={IconType.BLOCKCHAIN_BLOCK}
              className="text-neutral-400"
            />
          </div>
        </BlockContainer>
      )}{' '}
    </TopContainer>
  );
};

type ModeProps = {
  mode: ModeType;
};

const TopContainer = styled.div.attrs({
  className: 'flex justify-between gap-x-3',
})``;

const LeftContainer = styled.div.attrs<ModeProps>(({mode}) => {
  const className: string | undefined = `flex space-x-3 ${textColors[mode]}`;
  return {className};
})<ModeProps>``;

const IconContainer = styled.div.attrs({className: 'my-4'})``;

const LabelContainer = styled.div.attrs({className: 'my-3'})``;

const BlockContainer = styled.div.attrs({
  className:
    'flex items-start max-h-full space-x-2 my-4 text-neutral-500 ft-text-sm',
})``;

const textColors: Record<ModeType, string> = {
  active: 'text-primary-500',
  upcoming: 'text-primary-500',
  done: 'text-neutral-800',
  succeeded: 'text-success-800',
  failed: 'text-critical-800',
};

const iconColors: Record<ModeType, string> = {
  active: 'text-primary-500',
  upcoming: 'text-primary-500',
  done: 'text-neutral-600',
  succeeded: 'text-success-500',
  failed: 'text-critical-500',
};

const VariableIcon: React.FC<ModeProps> = ({mode}) => {
  switch (mode) {
    case 'active':
      return <Spinner size="xs" className={iconColors[mode]} />;
    case 'upcoming':
      return <Icon icon={IconType.RADIO} className={iconColors[mode]} />;
    case 'failed':
      return <Icon icon={IconType.REMOVE} className={iconColors[mode]} />;
    default:
      return <Icon icon={IconType.SUCCESS} className={iconColors[mode]} />;
  }
};

type CustomLabelProps = Pick<LabelProps, 'label' | 'helpText'>;

/* Lord knows it hurts. */
const CustomLabel: React.FC<CustomLabelProps> = ({label, helpText}) => {
  return (
    <VStack>
      <LabelLine>
        <Heading>{label}</Heading>
      </LabelLine>
      {helpText && <HelpText>{helpText}</HelpText>}
    </VStack>
  );
};

const VStack = styled.div.attrs({
  className: 'space-y-1',
})``;

const LabelLine = styled.div.attrs({
  className: 'flex space-x-3',
})``;

const Heading = styled.p.attrs({
  className: 'font-semibold',
})``;

const HelpText = styled.p.attrs({
  className: 'ft-text-sm font-normal text-neutral-500',
})``;
