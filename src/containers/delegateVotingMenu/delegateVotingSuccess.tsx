import {
  ButtonText,
  IconLinkExternal,
  IllustrationHuman,
  InputValue,
  shortenAddress,
} from '@aragon/ods-old';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {useWallet} from 'hooks/useWallet';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {CHAIN_METADATA} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {Community} from 'utils/paths';
import {abbreviateTokenAmount} from 'utils/tokens';

export interface IDelegateVotingSuccessProps {
  txHash: string;
  delegate: InputValue;
  tokenBalance: string;
  onClose: () => void;
}

export const DelegateVotingSuccess: React.FC<
  IDelegateVotingSuccessProps
> = props => {
  const {txHash, delegate, tokenBalance, onClose} = props;

  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {address} = useWallet();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress ?? ''
  );

  const delegateName =
    delegate.ensName !== ''
      ? delegate.ensName
      : shortenAddress(delegate.address);

  const tokenAmount = abbreviateTokenAmount(tokenBalance);

  const daoEns = toDisplayEns(daoDetails?.ensDomain);
  const daoName = daoEns !== '' ? daoEns : daoDetails?.address;

  const handleCommunityClick = () => {
    const pathParams = {network, dao: daoName};
    const communityPath = generatePath(Community, pathParams);
    navigate(communityPath);
    onClose();
  };

  const handleTransactionClick = () => {
    const transactionLink = `${CHAIN_METADATA[network].explorer}tx/${txHash}`;
    window.open(transactionLink, '_blank');
  };

  const isReclaim = delegate.address === address;

  const title = isReclaim ? 'successReclaimTitle' : 'successDelegateTitle';
  const description = isReclaim ? 'successReclaimDesc' : 'successDelegateDesc';

  return (
    <div className="flex flex-col gap-6 text-center">
      <FormGroup>
        <IllustrationHuman
          width={343}
          height={193}
          body="elevating"
          expression="excited"
          hair="curly"
          accessory="piercings_tattoo"
        />
        <p className="text-xl text-neutral-800">
          {t(`modal.delegation.${title}`)}
        </p>
        <p className="text-neutral-600">
          {t(`modal.delegation.${description}`, {
            balance: tokenAmount,
            tokenSymbol: daoToken?.symbol,
            delegateEns: delegateName,
          })}
        </p>
      </FormGroup>
      <FormGroup>
        <ButtonText
          label={t('modal.delegation.successCtaLabel')}
          mode="primary"
          size="large"
          onClick={handleCommunityClick}
        />
        <ButtonText
          label={t('modal.delegation.successBtnSecondaryLabel')}
          mode="secondary"
          size="large"
          iconRight={<IconLinkExternal />}
          onClick={handleTransactionClick}
        />
      </FormGroup>
    </div>
  );
};

const FormGroup = styled.div.attrs({className: 'flex flex-col gap-3'})``;
