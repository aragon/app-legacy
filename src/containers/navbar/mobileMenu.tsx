import {useReactiveVar} from '@apollo/client';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Button, IconType} from '@aragon/ods';

import BottomSheet from 'components/bottomSheet';
import {DaoSelector} from 'components/daoSelector';
import NavLinks from 'components/navLinks';
import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {usePrivacyContext} from 'context/privacyContext';
import {toDisplayEns} from 'utils/library';

type MobileNavMenuProps = {
  onFeedbackClick: () => void;
};

const MobileNavMenu = (props: MobileNavMenuProps) => {
  const currentDao = useReactiveVar(selectedDaoVar);
  const {open, close, isOpen} = useGlobalModalContext('mobileMenu');
  const {t} = useTranslation();

  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  return (
    <BottomSheet isOpen={Boolean(isOpen)} onClose={close}>
      <div className="md:w-[400px]">
        <CardWrapper className="rounded-xl">
          <DaoSelector
            daoAddress={toDisplayEns(currentDao?.ensDomain)}
            daoName={
              currentDao?.metadata?.name || toDisplayEns(currentDao?.ensDomain)
            }
            src={currentDao?.metadata?.avatar}
            onClick={() => {
              close();
              handleWithFunctionalPreferenceMenu(() => open('selectDao'));
            }}
          />
        </CardWrapper>
        <div className="space-y-6 px-4 py-6">
          <NavLinks onItemClick={close} />

          <Button
            className="w-full"
            size="lg"
            variant="tertiary"
            iconRight={IconType.FEEDBACK}
            onClick={props.onFeedbackClick}
          >
            {t('navButtons.giveFeedback')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};

export default MobileNavMenu;

const CardWrapper = styled.div`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
