import {VotingMode} from '@aragon/sdk-client';
import {
  AvatarDao,
  ButtonGroup,
  ListItemLink,
  Option,
} from '@aragon/ui-components';
import React, {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {getDHMFromSeconds} from 'utils/date';
import {EditSettings} from 'utils/paths';
import {ProposalResource} from 'utils/types';

const CompareSettings: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {data: daoId, isLoading: areParamsLoading} = useDaoParam();
  const {getValues} = useFormContext();

  const {data: daoDetails, isLoading: areDetailsLoading} = useDaoDetails(
    daoId!
  );
  const {data: daoSettings, isLoading: areSettingsLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );
  const {data: daoToken, isLoading: tokensAreLoading} = useDaoToken(
    daoDetails?.plugins?.[0]?.instanceAddress || ''
  );

  const [selectedButton, setSelectedButton] = useState<'new' | 'old'>('new');

  const onButtonGroupChangeHandler = () => {
    setSelectedButton(prev => (prev === 'new' ? 'old' : 'new'));
  };

  if (
    areParamsLoading ||
    areDetailsLoading ||
    areSettingsLoading ||
    tokensAreLoading
  ) {
    return <Loading />;
  }

  let displayedInfo;
  const [
    daoName,
    daoSummary,
    daoLogo,
    daoLinks,
    minimumApproval,
    minimumParticipation,
    tokenTotalSupply,
    durationDays,
    durationHours,
    durationMinutes,
    earlyExecution,
    voteReplacement,
  ] = getValues([
    'daoName',
    'daoSummary',
    'daoLogo',
    'daoLinks',
    'minimumApproval',
    'minimumParticipation',
    'tokenTotalSupply',
    'durationDays',
    'durationHours',
    'durationMinutes',
    'earlyExecution',
    'voteReplacement',
  ]);
  if (selectedButton === 'new') {
    displayedInfo = {
      name: daoName,
      summary: daoSummary,
      avatar: daoLogo,
      links: daoLinks.filter((l: ProposalResource) => l.name && l.url),
      approvalThreshold: `>${minimumApproval}%`,
      minParticipation: `≥${minimumParticipation}% (≥${
        (parseInt(minimumParticipation) * (tokenTotalSupply || 0)) / 100
      } ${daoToken?.symbol})`,
      days: durationDays,
      hours: durationMinutes,
      minutes: durationHours,
      votingMode: {
        earlyExecution: earlyExecution ? t('labels.yes') : t('labels.no'),
        voteReplacement: voteReplacement ? t('labels.yes') : t('labels.no'),
      },
    };
  } else {
    const duration = getDHMFromSeconds(daoSettings.minDuration);
    displayedInfo = {
      name: daoDetails?.metadata.name,
      summary: daoDetails?.metadata.description,
      avatar: daoDetails?.metadata.avatar,
      links: daoDetails?.metadata.links.filter(l => l.name && l.url),
      approvalThreshold: `>${Math.round(daoSettings.supportThreshold * 100)}%`,
      minParticipation: `≥${Math.round(
        daoSettings.minParticipation * 100
      )}% (≥${daoSettings.minParticipation * (tokenTotalSupply || 0)} ${
        daoToken?.symbol
      })`,
      days: duration.days,
      hours: duration.hours,
      minutes: duration.minutes,
      votingMode: {
        earlyExecution:
          daoSettings.votingMode === VotingMode.EARLY_EXECUTION
            ? t('labels.yes')
            : t('labels.no'),
        voteReplacement:
          daoSettings.votingMode === VotingMode.VOTE_REPLACEMENT
            ? t('labels.yes')
            : t('labels.no'),
      },
    };
  }

  return (
    <div className="space-y-2">
      <div className="flex">
        <ButtonGroup
          bgWhite={false}
          defaultValue={selectedButton}
          onChange={onButtonGroupChangeHandler}
        >
          <Option value="new" label={t('settings.newSettings')} />
          <Option value="old" label={t('settings.oldSettings')} />
        </ButtonGroup>
      </div>

      <DescriptionListContainer
        title={t('labels.review.daoMetadata')}
        onEditClick={() =>
          navigate(generatePath(EditSettings, {network, dao: daoId}))
        }
        editLabel={t('settings.edit')}
      >
        <Dl>
          <Dt>{t('labels.logo')}</Dt>
          <Dd>
            <AvatarDao daoName={displayedInfo.avatar} />
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.daoName')}</Dt>
          <Dd>{displayedInfo.name}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.summary')}</Dt>
          <Dd>{displayedInfo.summary}</Dd>
        </Dl>
        {displayedInfo.links && displayedInfo.links.length > 0 && (
          <Dl>
            <Dt>{t('labels.links')}</Dt>
            <Dd>
              <div className="space-y-1.5">
                {displayedInfo.links.map(
                  (link: {name: string; url: string}) => (
                    <ListItemLink
                      key={link.name + link.url}
                      label={link.name}
                      href={link.url}
                    />
                  )
                )}
              </div>
            </Dd>
          </Dl>
        )}
      </DescriptionListContainer>

      <DescriptionListContainer
        title={t('labels.review.governance')}
        onEditClick={() =>
          navigate(generatePath(EditSettings, {network, dao: daoId}))
        }
        editLabel={t('settings.edit')}
      >
        <Dl>
          <Dt>{t('labels.minimumApproval')}</Dt>
          <Dd>{displayedInfo.approvalThreshold}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumParticipation')}</Dt>
          <Dd>{displayedInfo.minParticipation}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumDuration')}</Dt>
          <Dd>
            {t('governance.settings.preview', {
              days: displayedInfo.days,
              hours: displayedInfo.hours,
              minutes: displayedInfo.minutes,
            })}
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.review.earlyExecution')}</Dt>
          <Dd>{displayedInfo.votingMode.earlyExecution}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.review.voteReplacement')}</Dt>
          <Dd>{displayedInfo.votingMode.voteReplacement}</Dd>
        </Dl>
      </DescriptionListContainer>
    </div>
  );
};

export default CompareSettings;
