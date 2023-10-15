import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ButtonText, IconClose, IconUpdate} from '@aragon/ods';
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {useNetwork} from 'context/network';
import {NewProposal} from 'utils/paths';
import {featureFlags} from 'utils/featureFlags';

const UpdateBanner: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {dao} = useParams();
  const location = useLocation();

  if (
    location.pathname.includes('new-proposal') ||
    location.pathname.includes('settings') ||
    location.pathname.includes('create')
  )
    return null;

  const daoUpdateEnabled =
    featureFlags.getValue('VITE_FEATURE_FLAG_OSX_UPDATES') === 'true';

  if (daoUpdateEnabled)
    return (
      <UpdateContainer>
        <DummyElement />
        <MessageWrapper>
          <TextWrapper>
            <IconUpdate className="text-ui-0" />
            <span className="font-semibold text-ui-0 ft-text-base">
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
                  type: 'os-update',
                  network,
                  dao: dao,
                })
              )
            }
          />
        </MessageWrapper>
        <IconClose className="cursor-pointer justify-self-end text-ui-0" />
      </UpdateContainer>
    );
  return null;
};

const DummyElement = styled.div.attrs({
  className: 'tablet:block hidden',
})``;

const UpdateContainer = styled.div.attrs({
  className:
    'flex justify-between items-center py-1 px-3 bg-primary-400' as string,
})``;

const TextWrapper = styled.div.attrs({
  className: 'flex items-center gap-x-1' as string,
})``;

const MessageWrapper = styled.div.attrs({
  className:
    'block tablet:flex tablet:items-center tablet:space-x-3 tablet:space-y-0 space-y-1' as string,
})``;

export default UpdateBanner;
