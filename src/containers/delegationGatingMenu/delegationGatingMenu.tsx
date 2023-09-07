import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import styled from 'styled-components';
import React from 'react';
import {constants} from 'ethers';
import {useTranslation} from 'react-i18next';
import {ButtonText, IllustrationHuman, shortenAddress} from '@aragon/ods';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {Address, useBalance, useEnsName} from 'wagmi';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {useDelegatee} from 'services/aragon-sdk/queries/use-delegatee';
import {abbreviateTokenAmount} from 'utils/tokens';
import {useWallet} from 'hooks/useWallet';

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
  const isDelegationActive = delegateData !== constants.AddressZero;
  // The useDelegatee hook returns null when current delegate is connected address
  const currentDelegate =
    delegateData === null ? (address as string) : delegateData;

  const {data: delegateEns} = useEnsName({
    address: currentDelegate as Address,
    enabled: currentDelegate != null,
  });

  const delegateName = delegateEns ?? shortenAddress(currentDelegate ?? '');
  const delegationLabel = isDelegationActive
    ? 'delegationActive'
    : 'delegationInactive';

  const handleReclaimClick = () => {
    close();
    open('delegateVoting', {reclaimMode: true});
  };

  return (
    <ModalBottomSheetSwitcher
      onClose={close}
      isOpen={isOpen}
      title={t('modal.delegationActive.title')}
    >
      <div className="flex flex-col gap-3 py-3 px-2 text-center">
        <ContentGroup>
          <IllustrationHuman
            width={343}
            height={193}
            body="elevating"
            expression="excited"
            hair="curly"
            accessory="piercings_tattoo"
          />
          <p className="text-xl text-ui-800">
            {t(`modal.${delegationLabel}.title`)}
          </p>
          <p className="text-ui-600">
            {t(`modal.${delegationLabel}.desc`, {
              balance: tokenAmount,
              tokenSymbol: daoToken?.symbol,
              walletAddressDelegation: delegateName,
            })}
          </p>
        </ContentGroup>
        <ContentGroup>
          <ButtonText
            label={t('modal.delegationActive.CtaLabel')}
            mode="primary"
            size="large"
            onClick={handleReclaimClick}
          />
          <ButtonText
            label={t('modal.delegationActive.BtnSecondaryLabel')}
            mode="secondary"
            size="large"
            onClick={() => close()}
          />
        </ContentGroup>
      </div>
    </ModalBottomSheetSwitcher>
  );
};

const ContentGroup = styled.div.attrs({className: 'flex flex-col gap-1.5'})``;
