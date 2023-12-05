import {MultisigVotingSettings} from '@aragon/sdk-client';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {EditSettings} from 'utils/paths';
import {Views} from '..';
import {MultisigProposerEligibility} from 'components/multisigEligibility';

type CompareMyCommunityProps = {
  daoAddressOrEns: string;
  daoSettings: MultisigVotingSettings;
  view: Views;
};

export const CompareMsCommunity: React.FC<CompareMyCommunityProps> = ({
  daoAddressOrEns,
  daoSettings,
  view,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {getValues} = useFormContext();

  const eligibilityType: MultisigProposerEligibility =
    getValues('eligibilityType');

  let displayedInfo;
  if (view === 'new') {
    displayedInfo = {
      proposalEligibility:
        eligibilityType === 'anyone'
          ? t('labels.anyWallet')
          : t('labels.multisigMembers'),
    };
  } else {
    displayedInfo = {
      proposalEligibility: daoSettings?.onlyListed
        ? t('labels.multisigMembers')
        : t('labels.anyWallet'),
    };
  }

  return (
    <DescriptionListContainer
      title={t('navLinks.members')}
      onEditClick={() =>
        navigate(generatePath(EditSettings, {network, dao: daoAddressOrEns}))
      }
      editLabel={t('settings.edit')}
    >
      <Dl>
        <Dt>{t('labels.proposalCreation')}</Dt>
        <Dd>{displayedInfo.proposalEligibility}</Dd>
      </Dl>
    </DescriptionListContainer>
  );
};
