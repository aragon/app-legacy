import {Erc20TokenDetails, VotingSettings} from '@aragon/sdk-client';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {formatUnits} from 'utils/library';
import {EditSettings} from 'utils/paths';
import {Views} from '..';

type CompareMyCommunityProps = {
  daoId: string;
  daoToken?: Erc20TokenDetails;
  daoSettings?: VotingSettings;
  view: Views;
};

export const CompareMvCommunity: React.FC<CompareMyCommunityProps> = ({
  daoId,
  daoToken,
  daoSettings,
  view,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {getValues} = useFormContext();

  const [eligibilityType, eligibilityTokenAmount] = getValues([
    'eligibilityType',
    'eligibilityTokenAmount',
  ]);

  let displayedInfo;
  if (view === 'new') {
    displayedInfo = {
      proposalEligibility:
        eligibilityType === 'token'
          ? t('createDAO.review.proposalCreation', {
              token: eligibilityTokenAmount,
              symbol: daoToken?.symbol,
            })
          : t('createDAO.step3.eligibility.anyone.title'),
    };
  } else {
    displayedInfo = {
      proposalEligibility: daoSettings?.minProposerVotingPower
        ? t('labels.review.tokenHoldersWithTkns', {
            tokenAmount: Math.ceil(
              Number(
                formatUnits(
                  daoSettings?.minProposerVotingPower || 0,
                  daoToken?.decimals || 18
                )
              )
            ),
            tokenSymbol: daoToken?.symbol,
          })
        : t('createDAO.step3.eligibility.anyone.title'),
    };
  }

  return (
    <DescriptionListContainer
      title={t('navLinks.community')}
      onEditClick={() =>
        navigate(generatePath(EditSettings, {network, dao: daoId}))
      }
      editLabel={t('settings.edit')}
    >
      <Dl>
        <Dt>{t('labels.review.proposalThreshold')}</Dt>
        <Dd>{displayedInfo.proposalEligibility}</Dd>
      </Dl>
    </DescriptionListContainer>
  );
};
