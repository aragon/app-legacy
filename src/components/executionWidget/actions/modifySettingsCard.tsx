import {VotingMode} from '@aragon/sdk-client';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionCardDlContainer, Dd, Dl, Dt} from 'components/descriptionList';
import {getDHMFromSeconds} from 'utils/date';
import {getErc20MinParticipation} from 'utils/proposals';
import {ActionUpdatePluginSettings} from 'utils/types';
import {formatUnits} from 'ethers/lib/utils';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';

export const ModifyMvSettingsCard: React.FC<{
  action: ActionUpdatePluginSettings;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();
  const {days, hours, minutes} = getDHMFromSeconds(inputs.minDuration);

  const minParticipation = useMemo(
    () => `≥ ${Math.round(inputs.minParticipation * 100)}% (≥
            ${getErc20MinParticipation(
              inputs.minParticipation,
              inputs.totalVotingWeight,
              inputs.token?.decimals || 18
            )}
            ${inputs.token?.symbol})`,
    [
      inputs.minParticipation,
      inputs.token?.decimals,
      inputs.token?.symbol,
      inputs.totalVotingWeight,
    ]
  );

  const minProposalThreshold = inputs.minProposerVotingPower
    ? t('labels.review.tokenHoldersWithTkns', {
        tokenAmount: formatUnits(
          inputs.minProposerVotingPower,
          inputs.token?.decimals
        ),
        tokenSymbol: inputs.token?.symbol,
      })
    : t('createDAO.step3.eligibility.anyWallet.title');

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateGovernanceAction')}
      smartContractName={`Token Voting v${daoDetails?.plugins[0].release}.${daoDetails?.plugins[0].build}`}
      smartContractAddress={daoDetails?.plugins[0].instanceAddress}
      blockExplorerLink={
        daoDetails?.plugins[0].instanceAddress
          ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.plugins[0].instanceAddress}`
          : undefined
      }
      methodDescription={t('labels.updateGovernanceActionDescription')}
      verified
    >
      <ActionCardDlContainer>
        <Dl>
          <Dt>{t('labels.supportThreshold')}</Dt>
          <Dd>&gt;{Math.round(inputs.supportThreshold * 100)}%</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumParticipation')}</Dt>
          <Dd>{minParticipation}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.review.proposalThreshold')}</Dt>
          <Dd>{minProposalThreshold}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumDuration')}</Dt>
          <Dd>
            <div className="space-x-3">
              <span>{t('createDAO.review.days', {days})}</span>
              <span>{t('createDAO.review.hours', {hours})}</span>
              <span>{t('createDAO.review.minutes', {minutes})}</span>
            </div>
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.earlyExecution')}</Dt>
          <Dd>
            {inputs.votingMode === VotingMode.EARLY_EXECUTION
              ? t('labels.yes')
              : t('labels.no')}
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.voteReplacement')}</Dt>
          <Dd>
            {inputs.votingMode === VotingMode.VOTE_REPLACEMENT
              ? t('labels.yes')
              : t('labels.no')}
          </Dd>
        </Dl>
      </ActionCardDlContainer>
    </AccordionMethod>
  );
};
