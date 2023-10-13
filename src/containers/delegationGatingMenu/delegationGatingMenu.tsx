import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import styled from 'styled-components';
import React from 'react';
import {constants} from 'ethers';
import {useTranslation} from 'react-i18next';
import {
  ButtonText,
  IllustrationHuman,
  IlluObject,
  shortenAddress,
  Link,
  IconLinkExternal,
} from '@aragon/ods-old';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {Address, useBalance, useEnsName} from 'wagmi';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {useDelegatee} from 'services/aragon-sdk/queries/use-delegatee';
import {abbreviateTokenAmount} from 'utils/tokens';
import {useWallet} from 'hooks/useWallet';

const getDelegationLabels = (params: {
  needsSelfDelegation: boolean;
  noVotingPower: boolean;
}) => {
  const {needsSelfDelegation, noVotingPower} = params;

  let bodyLabel = 'delegationActive';
  let ctaLabel = 'delegationActive.CtaLabel';

  if (needsSelfDelegation) {
    bodyLabel = 'delegationInactive';
    ctaLabel = 'delegation.ctaLabelDelegateNow';
  } else if (noVotingPower) {
    bodyLabel = 'delegation.NoVotingPower';
    ctaLabel = 'delegation.NoVotingPower.ctaLabel';
  }

  return {bodyLabel, ctaLabel};
};

export const DelegationGatingMenu: React.FC = () => {
  const {t} = useTranslation();
  const {isOpen, close, open} = useGlobalModalContext('delegationGating');

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

  const tokenAmount = abbreviateTokenAmount(tokenBalance?.formatted ?? '0');

  const {data: delegateData} = useDelegatee(
    {tokenAddress: daoToken?.address as string},
    {enabled: daoToken != null}
  );

  // The useDelegatee hook returns null when current delegate is connected address
  const currentDelegate =
    delegateData === null ? (address as string) : delegateData;

  // For imported ERC-20 tokens, there's no self-delegation and the delegation data is set to address-zero.
  const needsSelfDelegation = delegateData === constants.AddressZero;

  // Defines the case when the user is not delegating the tokens to someone else but had no
  // voting power when the proposal has been created.
  const noVotingPower =
    !needsSelfDelegation &&
    currentDelegate?.toLowerCase() === address?.toLowerCase();

  const {data: delegateEns} = useEnsName({
    address: currentDelegate as Address,
    enabled: currentDelegate != null,
  });

  const delegateName = delegateEns ?? shortenAddress(currentDelegate ?? '');

  const handleCtaClick = () => {
    if (noVotingPower) {
      close();
    } else {
      open('delegateVoting', {reclaimMode: true});
    }
  };

  const {bodyLabel, ctaLabel} = getDelegationLabels({
    noVotingPower,
    needsSelfDelegation,
  });

  return (
    <ModalBottomSheetSwitcher
      onClose={close}
      isOpen={isOpen}
      title={t('modal.delegationActive.label')}
    >
      <div className="flex flex-col gap-3 px-2 py-3 text-center">
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
          <p className="text-xl text-ui-800">{t(`modal.${bodyLabel}.title`)}</p>
          <p className="text-ui-600">
            {t(`modal.${bodyLabel}.desc`, {
              balance: tokenAmount,
              tokenSymbol: daoToken?.symbol,
              walletAddressDelegation: delegateName,
            })}
          </p>
        </ContentGroup>
        <ContentGroup>
          <ButtonText
            label={t(`modal.${ctaLabel}`)}
            mode="primary"
            size="large"
            onClick={handleCtaClick}
          />
          {noVotingPower ? (
            <Link
              label={t('modal.delegation.NoVotingPower.Link')}
              href={t('modal.delegation.NoVotingPower.LinkURL')}
              target="_blank"
              className="self-center"
              iconRight={<IconLinkExternal />}
            />
          ) : (
            <ButtonText
              label={t('modal.delegationActive.BtnSecondaryLabel')}
              mode="secondary"
              size="large"
              onClick={() => close()}
            />
          )}
        </ContentGroup>
      </div>
    </ModalBottomSheetSwitcher>
  );
};

const ContentGroup = styled.div.attrs({
  className: 'flex flex-col gap-1.5' as string,
})``;
