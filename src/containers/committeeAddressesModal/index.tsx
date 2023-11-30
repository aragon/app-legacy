import React from 'react';
import {useFormContext} from 'react-hook-form';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {FilteredAddressList} from '../../components/filteredAddressList';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {DaoMember} from 'utils/paths';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';

const CommitteeAddressesModal: React.FC = () => {
  const {getValues} = useFormContext();
  const {isOpen, close} = useGlobalModalContext('committeeMembers');
  const [committee] = getValues(['committee']);

  const {network} = useNetwork();
  const navigate = useNavigate();
  const {dao} = useParams();

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      data-testid="communityModal"
    >
      <FilteredAddressList
        wallets={committee}
        onVoterClick={user => {
          dao
            ? navigate(
                generatePath(DaoMember, {
                  network,
                  dao,
                  user,
                })
              )
            : window.open(
                `${CHAIN_METADATA[network].explorer}address/${user}`,
                '_blank'
              );
        }}
      />
    </ModalBottomSheetSwitcher>
  );
};

export default CommitteeAddressesModal;
