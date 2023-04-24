import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {StateEmpty} from 'components/stateEmpty';
import React from 'react';
import {useTranslation} from 'react-i18next';

const processes = ['DaoCreation', 'ProposalCreation'] as const;
export type ProcessType = typeof processes[number];

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
      <div className="py-3 px-2">
        <StateEmpty
          type="Object"
          object="warning"
          mode="inline"
          title={
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
            bgWhite: false,
          }}
        />
      </div>
    </ModalBottomSheetSwitcher>
  );
};

export default ExitProcessMenu;
