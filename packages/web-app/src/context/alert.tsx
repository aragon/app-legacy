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
  isOpen: boolean;
  alert: (label: string) => void;
};

type Props = Record<'children', ReactNode>;

const AlertProvider: React.FC<Props> = ({children}) => {
  const [isOpen, setIsOpen] = useState<AlertContextType['isOpen']>(false);
  const [label, setLabel] = useState<string>('');

  const alert = (label: string) => {
    setLabel(label);
    setIsOpen(true);
    setTimeout(() => {
      setIsOpen(false);
      setLabel('');
    }, 1000);
  };

  const value = useMemo(
    (): AlertContextType => ({
      isOpen,
      alert,
    }),
    [isOpen]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertChip {...{isOpen, label}} />
    </AlertContext.Provider>
  );
};

function useAlertContext(): AlertContextType {
  return useContext(AlertContext) as AlertContextType;
}

export {useAlertContext, AlertProvider};
