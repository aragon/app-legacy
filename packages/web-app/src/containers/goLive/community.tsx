import {IconFeedback, Link} from '@aragon/ui-components';
import {Tag} from '@aragon/ods';
import React, {useMemo} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useFormStep} from 'components/fullScreenStepper';
import CommunityAddressesModal from 'containers/communityAddressesModal';
import {useGlobalModalContext} from 'context/globalModals';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';
import {gTokenSymbol} from 'utils/tokens';
import numeral from 'numeral';

const Community: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {
    membership,
    tokenName,
    tokenType,
    wallets,
    isCustomToken,
    tokenSymbol,
    tokenAddress,
    tokenTotalSupply,
    tokenTotalHolders,
    multisigWallets,
    reviewCheckError,
    eligibilityType,
    eligibilityTokenAmount,
  } = getValues();

  const isGovTokenRequiresWrapping = !isCustomToken && tokenType === 'ERC-20';

  const govTokenSymbol = isGovTokenRequiresWrapping
    ? gTokenSymbol(tokenSymbol)
    : tokenSymbol;

  const formattedTotalSupply = useMemo(() => {
    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (tokenTotalSupply > 1e14) {
      return '> 100t';
    }

    return numeral(tokenTotalSupply).format(
      tokenTotalSupply < 100 ? '0,0.[000]' : '0,0'
    );
  }, [tokenTotalSupply]);

  const formattedTotalHolders = useMemo(() => {
    if (!tokenTotalHolders) return '-';

    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (tokenTotalHolders > 1e14) {
      return '> 100t';
    }

    return numeral(tokenTotalHolders).format('0,0');
  }, [tokenTotalHolders]);

  return (
    <Controller
      name="reviewCheck.community"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.voters')}
          onEditClick={() => setStep(4)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.review.eligibleVoters')}</Dt>
            <Dd>
              {membership === 'token'
                ? t('createDAO.step3.tokenMembership')
                : t('labels.multisigMembers')}
            </Dd>
          </Dl>

          {membership === 'multisig' && (
            <>
              <Dl>
                <Dt>{t('labels.review.distribution')}</Dt>
                <Dd>
                  <Link
                    label={t('labels.review.distributionLink', {
                      walletCount: multisigWallets.length,
                    })}
                    onClick={() => open('addresses')}
                  />
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.proposalCreation')}</Dt>
                <Dd>
                  {eligibilityType === 'anyone'
                    ? t('labels.anyWallet')
                    : t('labels.multisigMembers')}
                </Dd>
              </Dl>
            </>
          )}

          {membership === 'token' && (
            <>
              <Dl>
                <Dt>{t('votingTerminal.token')}</Dt>
                <Dd>
                  <div className="flex items-center space-x-1.5">
                    <span>
                      {t('labels.review.tokenSymbolGovernance')} {tokenName} (
                      {govTokenSymbol})
                    </span>

                    {/* TODO: check the owner for token contract, if it belongs to
                    dao add this */}
                    {isCustomToken && (
                      <Tag colorScheme="info">{t('labels.new')}</Tag>
                    )}

                    {isGovTokenRequiresWrapping && (
                      <Tag colorScheme="info">
                        {t('labels.review.tokenWrapped')}
                      </Tag>
                    )}
                  </div>
                </Dd>
              </Dl>
              {!isGovTokenRequiresWrapping && (
                <Dl>
                  <Dt>{t('labels.supply')}</Dt>
                  <Dd>
                    <div className="flex items-center space-x-1.5">
                      <p>
                        {formattedTotalSupply} {tokenSymbol}
                      </p>
                      {isCustomToken && (
                        <Tag colorScheme="neutral">{t('labels.mintable')}</Tag>
                      )}
                    </div>
                  </Dd>
                </Dl>
              )}
              {!isCustomToken && !isGovTokenRequiresWrapping && (
                <Dl>
                  <Dt>{t('labels.review.existingTokens.currentHolders')}</Dt>
                  <Dd>
                    <div className="flex items-center space-x-1.5">
                      <p>{formattedTotalHolders}</p>
                    </div>
                  </Dd>
                </Dl>
              )}
              {isGovTokenRequiresWrapping && (
                <Dl>
                  <Dt>{t('labels.supplyPotential')}</Dt>
                  <Dd>
                    <div className="space-y-0.5">
                      <div>
                        {formattedTotalSupply} {govTokenSymbol}
                      </div>
                      <div className="text-ui-400 ft-text-sm">
                        {t('labels.supplyPotentialHelptext', {tokenSymbol})}
                      </div>
                    </div>
                  </Dd>
                </Dl>
              )}
              <Dl>
                <Dt>{t('labels.review.distribution')}</Dt>
                <Dd>
                  {isCustomToken ? (
                    <Link
                      label={t('createDAO.review.distributionLink', {
                        count: wallets?.length,
                      })}
                      onClick={() => open('addresses')}
                    />
                  ) : (
                    <Link
                      label={t('labels.review.distributionLinkLabel')}
                      href={
                        CHAIN_METADATA[network].explorer +
                          '/token/tokenholderchart/' +
                          tokenAddress?.address || tokenAddress
                      }
                      iconRight={<IconFeedback />}
                      external
                    />
                  )}
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.proposalCreation')}</Dt>
                <Dd>
                  {eligibilityType === 'token'
                    ? t('createDAO.review.proposalCreation', {
                        token: eligibilityTokenAmount,
                        symbol: govTokenSymbol,
                      })
                    : t('createDAO.step3.eligibility.anyWallet.title')}
                </Dd>
              </Dl>
            </>
          )}

          <CommunityAddressesModal tokenMembership={membership === 'token'} />
        </DescriptionListContainer>
      )}
    />
  );
};

export default Community;
