import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {Breadcrumb} from '@aragon/ods-old';
import {Button, AlertCard, IconType} from '@aragon/ods';
import {useNavigate} from 'react-router-dom';
import Blockchain from './blockchain';
import DaoMetadata from './daoMetadata';
import Community from './community';
import Governance from './governance';
import goLive from 'assets/images/goLive.svg';
import {Landing} from 'utils/paths';
import {useWallet} from 'hooks/useWallet';
import {useGlobalModalContext} from 'context/globalModals';
import Committee from './committee';
import {CreateDaoDialog} from 'containers/createDaoDialog';

export const GoLiveHeader: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const clickHandler = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-neutral-0 px-4 pb-6 pt-4 md:rounded-xl md:p-6 xl:p-12 xl:pt-6">
      <div className="xl:hidden">
        <Breadcrumb
          crumbs={{label: t('createDAO.title'), path: Landing}}
          onClick={clickHandler}
        />
      </div>
      <div className="flex justify-between">
        <div className="w-full pt-6">
          <h1 className="text-4xl font-semibold leading-tight text-neutral-800">
            {t('createDAO.review.title')}
          </h1>
          <p className="mt-4 text-xl leading-normal text-neutral-600">
            {t('createDAO.review.description')}
          </p>
        </div>
        <img className="hidden w-[200px] md:block" src={goLive} />
      </div>
    </div>
  );
};

const GoLive: React.FC = () => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();

  const {votingType} = getValues();

  return (
    <div className="space-y-10 md:mx-auto md:w-3/4">
      <Blockchain />
      <DaoMetadata />
      <Community />
      <Governance />
      {votingType === 'gasless' && <Committee />}
      <AlertCard message={t('createDAO.review.daoUpdates')} variant="info" />
    </div>
  );
};

export const GoLiveFooter: React.FC = () => {
  const {watch, setValue} = useFormContext();
  const {reviewCheck} = watch();
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isConnected, isOnWrongNetwork} = useWallet();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isButtonDisabled = !Object.values(reviewCheck).every(v => v === true);

  const publishDao = () => {
    if (isConnected) {
      if (isOnWrongNetwork) {
        open('network');
      } else {
        setIsDialogOpen(true);
      }
    } else {
      open('wallet');
    }
  };

  const showInvalidFields = () => {
    if (isButtonDisabled) {
      setValue('reviewCheckError', true);
    }
  };

  return (
    <div className="flex justify-center pt-6">
      <div onClick={showInvalidFields}>
        <Button
          size="lg"
          variant="primary"
          iconRight={IconType.CHEVRON_RIGHT}
          onClick={publishDao}
          disabled={isButtonDisabled}
        >
          {t('createDAO.review.title')}
        </Button>
        <CreateDaoDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </div>
    </div>
  );
};

export default GoLive;
