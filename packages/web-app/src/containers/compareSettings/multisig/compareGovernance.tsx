import {MultisigVotingSettings} from '@aragon/sdk-client';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Views} from '..';

type CompareMsGovernanceProps = {
  daoSettings?: MultisigVotingSettings;
  view: Views;
};

export const CompareMsGovernance: React.FC<CompareMsGovernanceProps> = ({
  daoSettings,
  view,
}) => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();

  const [multisigMinimumApprovals, multisigWallets] = getValues([
    'multisigMinimumApprovals',
    'multisigWallets',
  ]);

  let displayedInfo;
  if (view === 'new') {
    displayedInfo = {
      minApprovals: multisigMinimumApprovals,
      totalMembers: multisigWallets.length,
    };
  } else {
    displayedInfo = {
      minApprovals: daoSettings?.minApprovals,
      totalMembers: multisigWallets.length,
    };
  }

  return (
    <DescriptionListContainer title={t('labels.review.governance')}>
      <Dl>
        <Dt>{t('labels.minimumApproval')}</Dt>
        <Dd>
          {`${displayedInfo.minApprovals} of ${displayedInfo.totalMembers} ${t(
            'labels.authorisedWallets'
          )}`}
        </Dd>
      </Dl>
    </DescriptionListContainer>
  );
};
