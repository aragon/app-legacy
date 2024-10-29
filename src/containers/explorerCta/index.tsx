import React, {useMemo, useCallback} from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import CTACard from 'components/ctaCard';
import {CTACards} from 'components/ctaCard/data';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';

const ExplorerCTA: React.FC = () => {
  const navigate = useNavigate();
  const {methods, isConnected} = useWallet();

  // TODO
  // this prevents the user from entering the creation
  // flow without a wallet, but this should be updated
  // when the rest of CTAs are enabled
  const handleCTAClick = useCallback(
    (path: string) => {
      if (path === '/create') {
        trackEvent('landing_createDaoBtn_clicked');
      }

      if (path.startsWith('http')) {
        window.open(path, '_blank');
        return;
      }

      if (isConnected) {
        navigate(path);
        return;
      }

      methods
        .selectWallet()
        .then(() => {
          navigate(path);
        })
        .catch((err: Error) => {
          // To be implemented: maybe add an error message when
          // the error is different from closing the window
          console.error(err);
        });
    },
    [isConnected, methods, navigate]
  );

  const ctaList = useMemo(
    () =>
      CTACards.map(card => (
        <CTACard
          key={card.title}
          {...card}
          className="flex-1"
          onClick={handleCTAClick}
        />
      )),
    [handleCTAClick]
  );

  return <CTAContainer>{ctaList}</CTAContainer>;
};

const CTAContainer = styled.div.attrs({
  className: 'relative flex lg:flex-row flex-col lg:space-x-6 max-w-fit',
})``;

export const ActiveIndicator = styled.li.attrs({
  className: 'inline-block bg-primary-500 h-1.5 w-12 ml-2 rounded-xl',
})``;

export const Indicator = styled.li.attrs({
  className: 'inline-block bg-neutral-200 h-1.5 w-4 ml-2 rounded-xl',
})``;

export default ExplorerCTA;
