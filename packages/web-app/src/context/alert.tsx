import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from 'react';
import {AlertChip} from '@aragon/ui-components';

const AlertContext = createContext<AlertContextType | null>(null);

type AlertContextType = {
  isShown: boolean;
  alert: (label: string) => void;
};

type Props = Record<'children', ReactNode>;

const AlertProvider: React.FC<Props> = ({children}) => {
  const [isShown, setIsShown] = useState<AlertContextType['isShown']>(false);
  const [label, setLabel] = useState<string>('');

  /**
   * @param label Alert text
   * This method will show the alert then wait for 1200 sec and close the modal
   *
   * We can add others method in future to have better control if needed
   */

  const alert = (label: string) => {
    setLabel(label);
    setIsShown(true);
    setTimeout(() => {
      setIsShown(false);
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
      <AlertChip {...{isShown, label}} showIcon />
    </AlertContext.Provider>
  );
};

function useAlertContext(): AlertContextType {
  return useContext(AlertContext) as AlertContextType;
}

export {useAlertContext, AlertProvider};
