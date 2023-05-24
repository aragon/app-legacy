import React from 'react';

import useScreen from 'hooks/useScreen';
import DesktopModal from '../desktopModal';
import MobileModal from '../mobileModal';

type Props = {
  isOpen: boolean;
  actionIndex: number;
  onClose: () => void;
  onConnectNew: () => void;
  onBackButtonClicked: () => void;
  onComposeButtonClicked: () => void;
  onRemoveContract: (address: string) => void;
};

const SmartContractList: React.FC<Props> = props => {
  const {isDesktop} = useScreen();

  if (isDesktop)
    return (
      <DesktopModal
        actionIndex={props.actionIndex}
        isOpen={props.isOpen}
        onClose={props.onClose}
        onConnectNew={props.onConnectNew}
        onBackButtonClicked={props.onBackButtonClicked}
        onComposeButtonClicked={props.onComposeButtonClicked}
        onRemoveContract={props.onRemoveContract}
      />
    );

  // mobile modal
  return (
    <MobileModal
      actionIndex={props.actionIndex}
      isOpen={props.isOpen}
      onClose={props.onClose}
      onConnectNew={props.onConnectNew}
      onBackButtonClicked={props.onBackButtonClicked}
      onComposeButtonClicked={props.onComposeButtonClicked}
      onRemoveContract={props.onRemoveContract}
    />
  );
};

export default SmartContractList;
