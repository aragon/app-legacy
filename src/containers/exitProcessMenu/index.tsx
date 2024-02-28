import {CardEmptyState} from '@aragon/ods';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import React from 'react';
import {useTranslation} from 'react-i18next';

const processes = ['DaoCreation', 'ProposalCreation'] as const;
export type ProcessType = (typeof processes)[number];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ctaCallback: () => void;
  /** defaults to onClose */
  cancelCallback?: () => void;
  processType: ProcessType;
};

const ExitProcessMenu: React.FC<Props> = ({
  isOpen,
  onClose,
  processType,
  ctaCallback,
  cancelCallback,
}) => {
  const {t} = useTranslation();

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <CardEmptyState
        objectIllustration={{object: 'WARNING'}}
        heading={
          processType === 'DaoCreation'
            ? t('modal.exitProcess.titleDaoCreation')
            : t('modal.exitProcess.titleProposalCreation')
        }
        description={t('modal.exitProcess.description')}
        primaryButton={{
          label: t('modal.exitProcess.ctaLabel'),
          onClick: ctaCallback,
        }}
        secondaryButton={{
          label: t('modal.exitProcess.cancelLabel'),
          onClick: cancelCallback || onClose,
        }}
      />
    </ModalBottomSheetSwitcher>
  );
};

export default ExitProcessMenu;
