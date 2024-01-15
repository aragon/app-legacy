import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  ButtonIcon,
  ButtonText,
  IconClose,
  IconReload,
  Modal,
} from '@aragon/ods-old';
import {Icon, IconType, Switch, Toggle, ToggleGroup} from '@aragon/ods';
import styled from 'styled-components';

import {quickFilters, blockchainFilters, governanceFilters} from './data';
import useScreen from 'hooks/useScreen';
import BottomSheet from 'components/bottomSheet';

type DaoFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DaoFilterModal: React.FC<DaoFilterModalProps> = props => {
  const {isDesktop} = useScreen();
  const {isOpen, onClose} = props;

  return isDesktop ? (
    <StyledModal isOpen={isOpen} onClose={onClose}>
      <Header onClose={onClose} />
      <ModalContent />
    </StyledModal>
  ) : (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Header onClose={onClose} />
      <ModalContent />
    </BottomSheet>
  );
};

type HeaderProps = {onClose: DaoFilterModalProps['onClose']};
const Header: React.FC<HeaderProps> = ({onClose}) => {
  const {t} = useTranslation();

  return (
    <ModalHeader>
      <p className="flex-1 font-semibold text-neutral-600 ft-text-lg">
        {t('explore.modal.filterDAOs.title')}
      </p>
      <ButtonIcon
        icon={<IconClose />}
        className="lg:hidden"
        mode="secondary"
        size="small"
        bgWhite
        onClick={onClose}
      />
      <ButtonIcon
        icon={<IconClose />}
        className="hidden lg:block"
        mode="secondary"
        size="large"
        bgWhite
        onClick={onClose}
      />
    </ModalHeader>
  );
};

const ModalContent: React.FC = () => {
  const {t} = useTranslation();

  const [showTestnets, setShowTestnets] = useState(false);

  const displayedChains = showTestnets
    ? blockchainFilters
    : blockchainFilters.filter(f => !f.testnet);

  return (
    <>
      <Main>
        {/* Quick Filters */}
        <FilterSection>
          <ToggleGroup isMultiSelect>
            {quickFilters.map(f => (
              <Toggle key={f.value} label={t(f.label)} value={f.value} />
            ))}
          </ToggleGroup>
        </FilterSection>

        {/* Blockchain Filters */}
        <FilterSection>
          <TitleWrapper>
            <Title>
              <Icon icon={IconType.BLOCKCHAIN} />
              <TitleLabel>
                {t('explore.modal.filterDAOs.label.blockchains')}
              </TitleLabel>
            </Title>
            <LineDiv />
          </TitleWrapper>
          <ToggleGroup isMultiSelect>
            {displayedChains.flatMap(f => (
              <Toggle key={f.value} label={t(f.label)} value={f.value} />
            ))}
          </ToggleGroup>
          <Switch
            checked={showTestnets}
            onCheckedChanged={setShowTestnets}
            label={t('explore.modal.filterDAOS.label.showTesnets')}
          />
        </FilterSection>

        {/* Governance Filters */}
        <FilterSection>
          <TitleWrapper>
            <Title>
              <Icon icon={IconType.APP_GOVERNANCE} />
              <TitleLabel>
                {t('explore.modal.filterDAOs.label.governanceType')}
              </TitleLabel>
            </Title>
            <LineDiv />
          </TitleWrapper>
          <ToggleGroup isMultiSelect>
            {governanceFilters.map(f => (
              <Toggle key={f.value} label={t(f.label)} value={f.value} />
            ))}
          </ToggleGroup>
        </FilterSection>
      </Main>

      {/* Footer */}
      <Footer>
        <ButtonText
          className="w-full lg:w-auto"
          size="large"
          label={t('explore.modal.filterDAOs.ctaLabel.see{{amount}}', {
            amount: 'amount',
          })}
        />
        <ButtonText
          className="w-full lg:w-auto"
          size="large"
          mode="ghost"
          label={t('explore.modal.filterDAOs.buttonLabel.clearFilters')}
          bgWhite
          iconLeft={<IconReload />}
        />
      </Footer>
    </>
  );
};

export default DaoFilterModal;

const FilterSection = styled.div.attrs({
  className: 'space-y-3 lg:space-y-4',
})``;

const Main = styled.div.attrs({
  className: 'py-6 px-4 space-y-6 lg:space-y-10 lg:px-6',
})``;

const Footer = styled.div.attrs({
  className:
    'gap-y-3 border-t border-neutral-100 p-4 flex flex-col lg:flex-row lg:gap-x-4 lg:border-none',
})``;

const TitleWrapper = styled.div.attrs({
  className: 'flex items-center gap-x-6',
})``;

const Title = styled.div.attrs({
  className: 'flex items-center gap-x-2 text-neutral-400',
})``;

const TitleLabel = styled.span.attrs({
  className: 'text-neutral-600 truncate text-sm leading-tight lg:text-base',
})``;

const LineDiv = styled.div.attrs({className: 'h-0.25 flex-1 bg-neutral-100'})``;

const ModalHeader = styled.div.attrs({
  className:
    'flex items-center space-x-3 lg:space-x-4 rounded-2xl bg-neutral-0 p-4',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const StyledModal = styled(Modal).attrs({
  style: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 12,
    width: '720px',
    outline: 'none',
    overflow: 'auto',
    boxShadow: `0px 24px 32px rgba(31, 41, 51, 0.04),
       0px 16px 24px rgba(31, 41, 51, 0.04),
       0px 4px 8px rgba(31, 41, 51, 0.04),
       0px 0px 1px rgba(31, 41, 51, 0.04)`,
  },
})``;
