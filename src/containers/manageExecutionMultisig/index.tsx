import AddAddresses from '../actionBuilder/addAddresses';
import RemoveAddresses from '../actionBuilder/removeAddresses';
import React from 'react';
import {MultisigDaoMember} from '../../hooks/useDaoMembers';
import UpdateMinimumApproval from '../actionBuilder/updateMinimumApproval';
import ExecutionExpirationTime from '../../components/executionExpirationTime';
import {Web3Address} from '../../utils/library';
import {CustomRowValidator} from '../actionBuilder/addAddresses/addressRow';
import {useProviders} from '../../context/providers';
import {useTranslation} from 'react-i18next';
import {ValidateResult} from 'react-hook-form';

type ManageExecutionMultisigProps = {
  members: MultisigDaoMember[] | undefined;
  minTallyApprovals: number;
};

export const ManageExecutionMultisig: React.FC<
  ManageExecutionMultisigProps
> = ({members, minTallyApprovals}) => {
  const {api: provider} = useProviders();
  const {t} = useTranslation();

  if (!members) return null;

  // Custom row validation is needed to let the first row to be added and empty,
  // so we can add an empty box for UX purposes
  const customRowValidator: CustomRowValidator = async (
    {address, ensName},
    memberWallets,
    index
  ) => {
    const web3Address = new Web3Address(provider, address, ensName);
    let validationResult: ValidateResult = true;

    // check if address is valid
    // empty field, but permit first address to be empty
    if (
      memberWallets!.length > 1 &&
      !web3Address.address &&
      !web3Address.ensName
    )
      validationResult = t('errors.required.walletAddress');

    // invalid ens
    if (web3Address.ensName && !web3Address.address)
      validationResult = (await web3Address.isValidEnsName())
        ? true
        : t('inputWallet.ensAlertCirtical');

    // invalid address
    if (web3Address.address && !web3Address.ensName)
      validationResult = web3Address.isAddressValid()
        ? true
        : t('inputWallet.addressAlertCritical');

    // check if there is duplicated address in the Multisig plugin
    if (
      members?.some(
        member =>
          member.address.toLowerCase() === web3Address.address?.toLowerCase()
      )
    )
      validationResult = t('errors.duplicateAddressOnCurrentMembersList');

    // check if there is a duplicate in the form
    if (
      memberWallets?.some(
        ({address}, memberWalletIndex) =>
          address === web3Address.address && memberWalletIndex !== index
      )
    )
      validationResult = t('errors.duplicateAddress');
    return validationResult;
  };

  return (
    <>
      <AddAddresses
        actionIndex={0}
        useCustomHeader
        currentDaoMembers={members}
        customRowValidator={customRowValidator}
        isEditSettingsPage={true}
      />
      <RemoveAddresses
        actionIndex={1}
        useCustomHeader
        currentDaoMembers={members}
        isEditSettingsPage={true}
      />
      <UpdateMinimumApproval
        actionIndex={2}
        useCustomHeader
        currentDaoMembers={members}
        currentMinimumApproval={minTallyApprovals}
        isGasless={true}
      />
      <ExecutionExpirationTime borderless={true} />
    </>
  );
};
