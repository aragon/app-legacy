import React, {useState} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {FormProvider, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {
  AlertInline,
  Breadcrumb,
  ButtonText,
  IconGovernance,
  Wizard,
} from '@aragon/ui-components';
import {constants} from 'ethers';
import styled from 'styled-components';
import {
  generatePath,
  useParams,
  useNavigate,
  Link as RouterLink,
} from 'react-router-dom';

import DefineMetadata from 'containers/defineMetadata';
import ConfigureCommunity from 'containers/configureCommunity';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import useScreen from 'hooks/useScreen';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {ProposeNewSettings} from 'utils/paths';
import {useNetwork} from 'context/network';

const defaultValues = {
  links: [{label: '', href: ''}],
  wallets: [{address: constants.AddressZero, amount: '0'}],
  membership: 'token',
  whitelistWallets: [],
};

const EditSettings: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<'metadata' | 'governance'>(
    'metadata'
  );
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isMobile} = useScreen();
  const {loading} = useDaoParam();
  const {network} = useNetwork();
  const {dao} = useParams();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues,
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <FormProvider {...formMethods}>
      <Container>
        <div className="-mx-2 desktop:mx-0">
          <Wizard
            includeStepper={false}
            title={t('settings.editDaoSettings')}
            description={t('settings.editSubtitle')}
            nav={
              <Breadcrumb
                icon={icon}
                crumbs={breadcrumbs}
                onClick={navigate}
                tag={tag}
              />
            }
          />

          {isMobile && (
            <div className="px-2 pb-3 -mt-1 bg-white">
              <ButtonText
                className="w-full tablet:w-max"
                label={t('settings.resetChanges')}
                mode="secondary"
                size={isMobile ? 'large' : 'medium'}
                disabled
              />
            </div>
          )}
        </div>

        <div>
          <Accordion>
            <Heading>{t('labels.review.daoMetadata')}</Heading>

            <HStack>
              <AlertInline label={t('settings.newSettings')} mode="neutral" />
              <ButtonText
                label={
                  currentMenu === 'metadata'
                    ? t('settings.resetChanges')
                    : t('settings.edit')
                }
                disabled={currentMenu === 'metadata'}
                mode={currentMenu === 'metadata' ? 'secondary' : 'primary'}
                onClick={() => setCurrentMenu('metadata')}
                bgWhite
              />
            </HStack>
          </Accordion>
          {currentMenu === 'metadata' && (
            <AccordionContent>
              <DefineMetadata />
            </AccordionContent>
          )}
        </div>

        <div>
          <Accordion>
            <Heading>{t('labels.review.governance')}</Heading>

            <HStack>
              <AlertInline label={t('settings.newSettings')} mode="neutral" />
              <ButtonText
                label={
                  currentMenu === 'governance'
                    ? t('settings.resetChanges')
                    : t('settings.edit')
                }
                disabled={currentMenu === 'governance'}
                mode={currentMenu === 'governance' ? 'secondary' : 'primary'}
                onClick={() => setCurrentMenu('governance')}
                bgWhite
              />
            </HStack>
          </Accordion>
          {currentMenu === 'governance' && (
            <AccordionContent>
              <ConfigureCommunity />
            </AccordionContent>
          )}
        </div>

        <ButtonContainer>
          <HStack>
            <RouterLink to={generatePath(ProposeNewSettings, {network, dao})}>
              <ButtonText
                className="w-full tablet:w-max"
                label={t('settings.proposeSettings')}
                iconLeft={<IconGovernance />}
                size={isMobile ? 'large' : 'medium'}
              />
            </RouterLink>
            <ButtonText
              className="w-full tablet:w-max"
              label={t('settings.resetChanges')}
              mode="secondary"
              size={isMobile ? 'large' : 'medium'}
            />
          </HStack>

          <AlertInline
            label={t('settings.proposeSettingsInfo')}
            mode="neutral"
          />
        </ButtonContainer>
      </Container>
    </FormProvider>
  );
};

export default withTransaction('EditSettings', 'component')(EditSettings);

const Container = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 desktop:mt-5 space-y-5 desktop:space-y-8',
})``;

const Accordion = styled.div.attrs({
  className:
    'desktop:flex justify-between items-center p-3 bg-white rounded-xl space-y-2 desktop:space-y-0',
})``;

const AccordionContent = styled.div.attrs({
  className: 'mx-auto mt-3 desktop:mt-5 space-y-3 desktop:w-3/5',
})``;

const Heading = styled.div.attrs({
  className: 'text-lg text-ui-800',
})``;

const HStack = styled.div.attrs({
  className:
    'desktop:flex space-x-0 desktop:space-x-3 space-y-2 desktop:space-y-0',
})``;

const ButtonContainer = styled.div.attrs({
  className: 'mx-auto mt-5 desktop:mt-8 space-y-2 desktop:w-3/5',
})``;
