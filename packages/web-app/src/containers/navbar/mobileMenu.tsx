import {useReactiveVar} from '@apollo/client';
import React from 'react';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import {DaoSelector} from 'components/daoSelector';
import NavLinks from 'components/navLinks';
import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {usePrivacyContext} from 'context/privacyContext';

const MobileNavMenu: React.FC = () => {
  const currentDao = useReactiveVar(selectedDaoVar);
  const {open, close, isMobileMenuOpen} = useGlobalModalContext();

  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  return (
    <BottomSheet isOpen={isMobileMenuOpen} onClose={() => close('mobileMenu')}>
      <div className="tablet:w-50">
        <CardWrapper className="rounded-xl">
          <DaoSelector
            daoAddress={currentDao.ensDomain}
            daoName={currentDao.name}
            src={currentDao.avatar}
            onClick={() => {
              close('mobileMenu');
              handleWithFunctionalPreferenceMenu(() => open('selectDao'));
            }}
          />
        </CardWrapper>
        <div className="py-3 px-2 space-y-3">
          <NavLinks onItemClick={() => close('mobileMenu')} />
        </div>
      </div>
    </BottomSheet>
  );
};

export default MobileNavMenu;

const CardWrapper = styled.div`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;
