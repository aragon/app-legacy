import {
  ButtonIcon,
  ButtonText,
  CheckboxListItem,
  IconChevronLeft,
} from '@aragon/ods-old';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';

export type CookiesType = {
  analytics: boolean;
  functional: boolean;
};

type CookieSettingsMenuProps = {
  show: boolean;
  onClose: () => void;
  onAcceptClick: (selections: CookiesType) => void;
  onRejectAllClick: () => void;
};

const CookieSettingsMenu: React.FC<CookieSettingsMenuProps> = props => {
  const {t} = useTranslation();
  const [analyticsSelected, setAnalyticsSelected] = useState<boolean>(false);
  const [functionalSelected, setFunctionalSelected] = useState<boolean>(true);

  return (
    <Modal show={props.show}>
      <div>
        <ModalHeader>
          <ButtonIcon
            mode="secondary"
            size="small"
            icon={<IconChevronLeft />}
            onClick={props.onClose}
            bgWhite
          />
          <Title>{t('privacyPolicy.cookieSettings')}</Title>
          <div role="presentation" className="h-4 w-4" />
        </ModalHeader>
        <BottomSheetContentContainer>
          <div className="space-y-1.5">
            <CheckboxListItem
              label={t('privacyPolicy.functional')}
              type={functionalSelected ? 'active' : 'default'}
              onClick={() => setFunctionalSelected(!functionalSelected)}
              helptext={t('privacyPolicy.functionalHelpText')}
              multiSelect
            />
            <CheckboxListItem
              label={t('privacyPolicy.analytics')}
              type={analyticsSelected ? 'active' : 'default'}
              onClick={() => setAnalyticsSelected(!analyticsSelected)}
              helptext={t('privacyPolicy.analyticsHelpText')}
              multiSelect
            />
          </div>
          <div className="flex space-x-2">
            <ButtonText
              className="flex-1"
              label={t('privacyPolicy.acceptSelectedCookies')}
              size="large"
              onClick={() =>
                props.onAcceptClick({
                  analytics: analyticsSelected,
                  functional: functionalSelected,
                })
              }
            />
            <ButtonText
              className="flex-1"
              label={t('privacyPolicy.rejectAllCookies')}
              size="large"
              mode="secondary"
              onClick={props.onRejectAllClick}
            />
          </div>
        </BottomSheetContentContainer>
      </div>
    </Modal>
  );
};

export default CookieSettingsMenu;

const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-center ft-text-base text-neutral-800',
})``;

const ModalHeader = styled.div.attrs({
  className: 'flex items-center p-2 space-x-2 bg-neutral-0 rounded-xl',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const BottomSheetContentContainer = styled.div.attrs({
  className: 'py-3 px-2 space-y-3',
})``;

type Props = {
  show: boolean;
};

// For the sake of consistency height of modal is halfway screen size, but modals need to be higher
const Modal = styled.div.attrs<{show: Props}>(({show}) => ({
  className: `${show ? 'block' : 'hidden'} fixed z-20 bg-neutral-50
  bottom-0 w-full rounded-t-xl
  md:bottom-3 md:left-1/2 md:w-56 md:rounded-b-xl
  md:-translate-x-1/2
  xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2`,
}))<Props>`
  box-shadow:
    0px 24px 32px rgba(31, 41, 51, 0.04),
    0px 16px 24px rgba(31, 41, 51, 0.04),
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
