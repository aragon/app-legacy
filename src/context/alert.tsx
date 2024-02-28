import {AlertChip} from '@aragon/ods-old';
import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import {IconType} from '@aragon/ods';

const AlertContext = createContext<AlertContextType | null>(null);

type AlertContextType = {
  isShown: boolean;
  alert: (label: string, icon?: IconType) => void;
};

type Props = Record<'children', ReactNode>;

const AlertProvider: React.FC<Props> = ({children}) => {
  const [isShown, setIsShown] = useState<AlertContextType['isShown']>(false);
  const [label, setLabel] = useState<string>('');
  const [icon, setIcon] = useState<IconType>();

  /**
   * @param label Alert text
   * This method will show the alert then wait for 1200 sec and close the modal
   *
   * We can add others method in future to have better control if needed
   */

  const alert = (label: string, icon?: IconType) => {
    if (icon) {
      setIcon(icon);
    }

    setLabel(label);
    setIsShown(true);
    setTimeout(() => {
      setIsShown(false);

      // clear the icon once it has ben shown
      setIcon(undefined);
    }, 1200);
  };

  const value = useMemo(
    (): AlertContextType => ({
      isShown,
      alert,
    }),
    [isShown]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertChip {...{isShown, label}} icon={icon} showIcon />
    </AlertContext.Provider>
  );
};

function useAlertContext(): AlertContextType {
  return useContext(AlertContext) as AlertContextType;
}

export {AlertProvider, useAlertContext};
