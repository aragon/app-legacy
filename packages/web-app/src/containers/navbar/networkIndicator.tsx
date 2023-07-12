import React from 'react';
// import {AlertBanner} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import {useWallet} from 'hooks/useWallet';

const NetworkIndicator: React.FC = () => {
  const {isOnWrongNetwork} = useWallet();
  const {t} = useTranslation();

  if (isOnWrongNetwork)
    return (
      // <AlertBanner label={t('alert.wrongWalletNetwork')} mode={'warning'} />
      <div />
    );
  return null;
};

export default NetworkIndicator;
