import React from 'react';
import {useFormContext} from 'react-hook-form';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {FilteredAddressList} from '../../components/filteredAddressList';

const CommitteeAddressesModal: React.FC = () => {
  const {getValues} = useFormContext();
  const {isCommitteeMembersOpen, close} = useGlobalModalContext();
  const [committee] = getValues(['committee']);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isCommitteeMembersOpen}
      onClose={() => close('committeeMembers')}
      data-testid="communityModal"
    >
      <FilteredAddressList wallets={committee} />
    </ModalBottomSheetSwitcher>
  );
};

export default CommitteeAddressesModal;
