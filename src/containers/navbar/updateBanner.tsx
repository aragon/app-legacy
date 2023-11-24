import {ButtonText, IconClose, IconUpdate} from '@aragon/ods-old';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import styled from 'styled-components';

import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {useUpdateExists} from 'hooks/useUpdateExists';
import {useWallet} from 'hooks/useWallet';
import {useIsMember} from 'services/aragon-sdk/queries/use-is-member';
import {featureFlags} from 'utils/featureFlags';
import {NewProposal} from 'utils/paths';
import {ProposalTypes} from 'utils/types';

const UpdateBanner: React.FC = () => {
  const [bannerHidden, setBannerHidden] = useState(false);

  const {t} = useTranslation();
  const {dao} = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {network} = useNetwork();
  const {address} = useWallet();

  const updateExists = useUpdateExists();
  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: isMember} = useIsMember({
    address: address as string,
    pluginAddress: daoDetails?.plugins?.[0]?.instanceAddress as string,
    pluginType: daoDetails?.plugins?.[0]?.id as PluginTypes,
  });

  const daoUpdateEnabled =
    featureFlags.getValue('VITE_FEATURE_FLAG_OSX_UPDATES') === 'true';

  const showBanner = !!(
    !bannerHidden &&
    isMember &&
    updateExists &&
    daoUpdateEnabled
  );

  if (
    location.pathname.includes('new-proposal') ||
    location.pathname.includes('settings') ||
    location.pathname.includes('create') ||
    showBanner === false
  )
    return null;

  return (
    <UpdateContainer>
      <DummyElement />
      <MessageWrapper>
        <TextWrapper>
          <IconUpdate className="text-neutral-0" />
          <span className="font-semibold text-neutral-0 ft-text-base">
            {t('update.banner.title')}
          </span>
        </TextWrapper>
        <ButtonText
          label="View updates"
          size="small"
          bgWhite
          mode={'secondary'}
          onClick={() =>
            navigate(
              generatePath(NewProposal, {
                type: ProposalTypes.OSUpdates,
                network,
                dao: dao,
              })
            )
          }
        />
      </MessageWrapper>
      <IconClose
        className="cursor-pointer justify-self-end text-neutral-0"
        onClick={() => {
          setBannerHidden(true);
        }}
      />
    </UpdateContainer>
  );
};

const DummyElement = styled.div.attrs({
  className: 'md:block hidden',
})``;

const UpdateContainer = styled.div.attrs({
  className:
    'flex justify-between items-center py-2 px-6 bg-primary-400' as string,
})``;

const TextWrapper = styled.div.attrs({
  className: 'flex items-center gap-x-2' as string,
})``;

const MessageWrapper = styled.div.attrs({
  className:
    'block md:flex md:items-center md:space-x-6 md:space-y-0 space-y-2' as string,
})``;

export default UpdateBanner;
