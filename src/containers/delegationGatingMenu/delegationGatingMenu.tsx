import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import styled from 'styled-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  ButtonText,
  IllustrationHuman,
  IlluObject,
  Link,
  IconLinkExternal,
} from '@aragon/ods-old';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {Address, useBalance} from 'wagmi';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {useDelegatee} from 'services/aragon-sdk/queries/use-delegatee';
import {abbreviateTokenAmount} from 'utils/tokens';
import {useWallet} from 'hooks/useWallet';
import {TokenVotingProposal} from '@aragon/sdk-client';
import {useGetMember} from 'services/aragon-sdk/queries/use-get-member';

export interface IDelegationGatingMenuState {
  proposal?: TokenVotingProposal;
}

const getDelegationLabels = (params: {
  hasBalance: boolean;
  hasPastBalance: boolean;
  needsSelfDelegation: boolean;
}) => {
  const {hasBalance, hasPastBalance, needsSelfDelegation} = params;

  const firstKey = hasPastBalance ? 'sentence1b' : 'sentence1a';
  const secondKey = needsSelfDelegation
    ? 'sentence2b'
    : !hasBalance
    ? 'sentence2c'
    : 'sentence2a';

  return {firstKey, secondKey};
};

export const DelegationGatingMenu: React.FC = () => {
  const {t} = useTranslation();
  const {isOpen, modalState, close, open} =
    useGlobalModalContext<IDelegationGatingMenuState>('delegationGating');

  const {proposal} = modalState ?? {};

  const {network, address} = useWallet();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress ?? ''
  );

  const {data: tokenBalance} = useBalance({
    address: address as Address,
    token: daoToken?.address as Address,
    chainId: CHAIN_METADATA[network as SupportedNetworks].id,
    enabled: address != null && daoToken != null,
  });

  const hasBalance = tokenBalance != null && tokenBalance.value > 0;

  const {data: daoMember} = useGetMember(
    {
      tokenAddress: daoToken?.address as string,
      blockNumber: proposal?.creationBlockNumber as number,
    },
    {enabled: daoToken != null && proposal != null}
  );
  const pastBalance = daoMember?.balance ?? 0;
  const parsedPastBalance = abbreviateTokenAmount(pastBalance.toString());

  const {data: delegateData} = useDelegatee(
    {tokenAddress: daoToken?.address as string},
    {enabled: daoToken != null}
  );

  // The useDelegatee hook returns null when current delegate is connected address
  const currentDelegate =
    delegateData === null ? (address as string) : delegateData;

  // For imported ERC-20 tokens, there's no self-delegation and the delegation data is set to address-zero.
  const needsSelfDelegation =
    hasBalance && currentDelegate?.toLowerCase() !== address?.toLowerCase();

  const handleCtaClick = () => {
    if (!needsSelfDelegation) {
      close();
    } else {
      open('delegateVoting', {reclaimMode: true});
    }
  };

  const {firstKey, secondKey} = getDelegationLabels({
    hasBalance,
    hasPastBalance: pastBalance > 0,
    needsSelfDelegation,
  });
  const firstSentence = t(`modal.delegation.CantVote.${firstKey}`, {
    tokenSymbol: daoToken?.symbol,
    balance: parsedPastBalance,
  });
  const secondSentence = t(`modal.delegation.CantVote.${secondKey}`, {
    tokenSymbol: daoToken?.symbol,
  });

  const ctaLabel = needsSelfDelegation
    ? 'modal.delegationActive.CtaLabel'
    : 'modal.delegation.NoVotingPower.ctaLabel';

  return (
    <ModalBottomSheetSwitcher
      onClose={close}
      isOpen={isOpen}
      title={t('modal.delegationActive.label')}
    >
      <div className="flex flex-col gap-6 px-4 py-6 text-center">
        <ContentGroup className="items-center">
          {needsSelfDelegation ? (
            <IllustrationHuman
              width={343}
              height={193}
              body="elevating"
              expression="excited"
              hair="curly"
              accessory="piercings_tattoo"
            />
          ) : (
            <IlluObject object="warning" />
          )}
          <p className="text-2xl leading-tight text-neutral-800">
            {t(`modal.delegation.CantVote.title`)}
          </p>
          <p className="text-neutral-600">
            {t('modal.delegation.CantVote.description', {
              sentence1: firstSentence,
              sentence2: secondSentence,
            })}
          </p>
        </ContentGroup>
        <ContentGroup>
          <ButtonText
            label={t(ctaLabel)}
            mode="primary"
            size="large"
            onClick={handleCtaClick}
          />
          {needsSelfDelegation && (
            <ButtonText
              label={t('modal.delegationActive.BtnSecondaryLabel')}
              mode="secondary"
              size="large"
              onClick={() => close()}
            />
          )}
          <Link
            label={t('modal.delegation.NoVotingPower.Link')}
            href={t('modal.delegation.NoVotingPower.LinkURL')}
            target="_blank"
            className="my-3 self-center"
            iconRight={<IconLinkExternal />}
          />
        </ContentGroup>
      </div>
    </ModalBottomSheetSwitcher>
  );
};

const ContentGroup = styled.div.attrs({
  className: 'flex flex-col gap-3' as string,
})``;
