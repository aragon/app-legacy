import React, {useEffect} from 'react';
import styled from 'styled-components';
import {GridLayout} from 'components/layout';
import ExplorerCTA from 'containers/explorerCta';
import {DaoExplorer} from 'containers/daoExplorer';
import Hero from 'containers/hero';
import {useNetwork} from 'context/network';
import {translateToNetworkishName} from 'utils/library';
import {SupportedNetworks} from '@aragon/osx-commons-configs';

export const Explore: React.FC = () => {
  const {network, setNetwork} = useNetwork();

  useEffect(() => {
    //FIXME: temporarily when network not supported by the SDK, default to ethereum
    const translatedNetwork = translateToNetworkishName(
      network
    ) as SupportedNetworks;

    // when network not supported by the SDK, don't set network
    if (!Object.values(SupportedNetworks).includes(translatedNetwork)) {
      console.warn('Unsupported network, defaulting to ethereum');
      setNetwork('ethereum');
    }
  }, [network, setNetwork]);

  return (
    <>
      <Hero />
      <GridLayout>
        <ContentWrapper>
          <DaoExplorer />
          <ExplorerCTA />
        </ContentWrapper>
      </GridLayout>
    </>
  );
};

/* STYLES =================================================================== */

const ContentWrapper = styled.div.attrs({
  className:
    'col-span-full xl:col-start-2 xl:col-end-12 space-y-10 xl:space-y-16 my-12 xl:mb-20',
})``;
