import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
// import {DAOFactory} from 'typechain';
// TODO reintroduce this by adding back the postInstall script in packages.json
// that executes the generate-abis-and-types command.
import {
  AlertCard,
  Breadcrumb,
  ButtonText,
  IconChevronRight,
} from '@aragon/ods-old';
import {useNavigate} from 'react-router-dom';

import Blockchain from './blockchain';
import DaoMetadata from './daoMetadata';
import Community from './community';
import Governance from './governance';
import goLive from 'public/goLive.svg';
import {Landing} from 'utils/paths';
import {useCreateDaoContext} from 'context/createDao';
import {useWallet} from 'hooks/useWallet';
import {useGlobalModalContext} from 'context/globalModals';
import {trackEvent} from 'services/analytics';

export const GoLiveHeader: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const clickHandler = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-neutral-0 px-2 pb-3 pt-2 md:rounded-xl md:p-3 xl:p-6 xl:pt-3">
      <div className="xl:hidden">
        <Breadcrumb
          crumbs={{label: t('createDAO.title'), path: Landing}}
          onClick={clickHandler}
        />
      </div>
      <div className="flex justify-between">
        <div className="w-full pt-3">
          <h1 className="font-semibold text-3xl text-neutral-800">
            {t('createDAO.review.title')}
          </h1>
          <p className="mt-2 text-lg text-neutral-600">
            {t('createDAO.review.description')}
          </p>
        </div>
        <ImageContainer src={goLive} />
      </div>
    </div>
  );
};

const GoLive: React.FC = () => {
  const {t} = useTranslation();

  return (
    <Container>
      <Blockchain />
      <DaoMetadata />
      <Community />
      <Governance />
      <AlertCard title={t('createDAO.review.daoUpdates')} />
    </Container>
  );
};

export const GoLiveFooter: React.FC = () => {
  const {watch, setValue, getValues} = useFormContext();
  const {reviewCheck} = watch();
  const {t} = useTranslation();
  const {handlePublishDao} = useCreateDaoContext();
  const {open} = useGlobalModalContext();
  const {isConnected, provider, isOnWrongNetwork} = useWallet();

  const IsButtonDisabled = () =>
    !Object.values(reviewCheck).every(v => v === true);

  const publishDao = (e: React.MouseEvent) => {
    e.stopPropagation();
    isConnected &&
      trackEvent('daoCreation_publishYourDAO_clicked', {
        network: getValues('blockchain')?.network,
        wallet_provider: provider?.connection.url,
        governance_type: getValues('membership'),
      });

    if (isConnected) {
      if (isOnWrongNetwork) {
        open('network');
      } else {
        handlePublishDao();
      }
    } else {
      open('wallet');
    }
  };

  const showInvalidFields = () => {
    if (IsButtonDisabled()) {
      setValue('reviewCheckError', true);
    }
  };

  return (
    <div className="flex justify-center pt-3">
      <div onClick={showInvalidFields}>
        <ButtonText
          size="large"
          iconRight={<IconChevronRight />}
          label={t('createDAO.review.title')}
          onClick={publishDao}
          disabled={IsButtonDisabled()}
        />
      </div>
    </div>
  );
};

export default GoLive;

const Container = styled.div.attrs({
  className: 'md:mx-auto md:w-3/4 space-y-5',
})``;

const ImageContainer = styled.img.attrs({
  className: 'w-[200px] hidden md:block',
})``;
