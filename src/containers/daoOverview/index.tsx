import {
  Breadcrumb,
  ButtonText,
  IconChevronRight,
  IlluObject,
} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import CardWithImage from 'components/cardWithImage';
import {useFormStep} from 'components/fullScreenStepper';
import {ActiveIndicator, Indicator, StyledCarousel} from 'containers/carousel';
import useScreen from 'hooks/useScreen';
import {trackEvent} from 'services/analytics';
import {i18n} from '../../../i18n.config';

type OverviewDAOHeaderProps = {
  navLabel: string;
  returnPath: string;
  onExitButtonClick?: () => void;
};

export const OverviewDAOHeader: React.FC<OverviewDAOHeaderProps> = ({
  navLabel,
  returnPath,
  onExitButtonClick,
}) => {
  const {t} = useTranslation();
  const {next} = useFormStep();

  const handleSetupClick = () => {
    trackEvent('daoCreation_setupDAO_clicked');
    next();
  };

  return (
    <div className="bg-neutral-0 p-2 md:rounded-xl md:p-6">
      <div className="mb-3 xl:hidden">
        <Breadcrumb
          crumbs={{
            label: navLabel,
            path: returnPath,
          }}
          onClick={onExitButtonClick}
        />
      </div>

      <div className="items-end md:flex md:space-x-6">
        <div className="w-full">
          <h1 className="font-bold text-neutral-800 ft-text-3xl">
            {t('createDAO.overview.title')}
          </h1>
          <p className="mt-2 text-neutral-600 ft-text-lg">
            {t('createDAO.overview.description')}
          </p>
        </div>
        <div className="mt-2 flex space-x-2 md:mt-0">
          {/* <ButtonText
          size="large"
          mode="secondary"
          bgWhite
          className="whitespace-nowrap"
          label={'Continue Draft'}
        /> */}
          <ButtonText
            size="large"
            className="w-full whitespace-nowrap md:w-max"
            iconRight={<IconChevronRight />}
            label={t('createDAO.overview.button')}
            onClick={handleSetupClick}
          />
        </div>
      </div>
    </div>
  );
};

const OverviewCards = [
  <CardWithImage
    key="SelectBlockchain"
    imgSrc={<IlluObject object="chain" />}
    caption={i18n.t('createDAO.step1.label')}
    title={i18n.t('createDAO.step1.title')}
  />,
  <CardWithImage
    key="DefineMetadata"
    imgSrc={<IlluObject object="labels" />}
    caption={i18n.t('createDAO.step2.label')}
    title={i18n.t('createDAO.step2.title')}
  />,
  <CardWithImage
    key="SetupCommunity"
    imgSrc={<IlluObject object="users" />}
    caption={i18n.t('createDAO.step3.label')}
    title={i18n.t('createDAO.step3.title')}
  />,
  <CardWithImage
    key="ConfigureGovernance"
    imgSrc={<IlluObject object="settings" />}
    caption={i18n.t('createDAO.step4.label')}
    title={i18n.t('createDAO.step4.shortTitle')}
  />,
];

export const OverviewDAOStep: React.FC = () => {
  const {isDesktop} = useScreen();

  if (isDesktop) {
    return (
      <div className="space-y-3 md:flex md:space-x-3 md:space-y-0">
        {OverviewCards}
      </div>
    );
  }
  return (
    <MobileCTA>
      <StyledCarousel
        swipeable
        emulateTouch
        centerMode
        autoPlay
        preventMovementUntilSwipeScrollTolerance
        swipeScrollTolerance={100}
        interval={4000}
        showArrows={false}
        showStatus={false}
        transitionTime={300}
        centerSlidePercentage={92}
        showThumbs={false}
        infiniteLoop
        renderIndicator={(onClickHandler, isSelected, index, label) => {
          if (isSelected) {
            return (
              <ActiveIndicator
                aria-label={`Selected: ${label} ${index + 1}`}
                title={`Selected: ${label} ${index + 1}`}
              />
            );
          }
          return (
            <Indicator
              onClick={onClickHandler}
              onKeyDown={onClickHandler}
              value={index}
              key={index}
              role="button"
              tabIndex={0}
              title={`${label} ${index + 1}`}
              aria-label={`${label} ${index + 1}`}
            />
          );
        }}
      >
        {OverviewCards}
      </StyledCarousel>
    </MobileCTA>
  );
};

const MobileCTA = styled.div.attrs({
  className: 'mb-5 -mx-2 md:-mx-3 xl:mx-0',
})``;
