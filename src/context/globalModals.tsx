import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';

const GlobalModalsContext = createContext<GlobalModalsContextType | null>(null);

type GlobalModalsContextType<TState = Record<string, unknown>> = {
  activeDialog?: DialogType;
  modalState?: TState;
  isOpen?: boolean;
  open: (dialog: DialogType, state?: Record<string, unknown>) => void;
  close: (onClose?: () => void) => void;
};

export type DialogType =
  | 'transfer'
  | 'token'
  | 'utc'
  | 'addAction'
  | 'selectDao'
  | 'addresses'
  | 'wallet'
  | 'network'
  | 'mobileMenu'
  | 'network'
  | 'manageWallet'
  | 'gating'
  | 'deposit'
  | 'poapClaim'
  | 'exportCsv'
  | 'delegateVoting'
  | 'delegationGating';

type Props = Record<'children', ReactNode>;

export const GlobalModalsProvider: React.FC<Props> = ({children}) => {
  const [activeDialog, setActiveDialog] = useState<DialogType>();
  const [modalState, setModalState] = useState<Record<string, unknown>>();

  const close = useCallback((onClose?: () => void) => {
    setActiveDialog(undefined);
    setModalState(undefined);
    onClose?.();
  }, []);

  const open = useCallback(
    (dialog: DialogType, state?: Record<string, unknown>) => {
      setActiveDialog(dialog);
      setModalState(state);
    },
    []
  );

  const value = useMemo(
    (): GlobalModalsContextType => ({
      activeDialog,
      modalState,
      open,
      close,
    }),
    [activeDialog, modalState, open, close]
  );

  return (
    <GlobalModalsContext.Provider value={value}>
      {children}
    </GlobalModalsContext.Provider>
  );
};

export const useGlobalModalContext = <TState extends object>(
  dialog?: DialogType
): GlobalModalsContextType<TState> => {
  const values = useContext(GlobalModalsContext);

  if (values == null) {
    throw new Error(
      'GlobalModals: hook must be used inside the GlobalModalContext in order to work properly.'
    );
  }

  return {
    ...values,
    isOpen: dialog ? values.activeDialog === dialog : undefined,
    modalState: values.modalState as TState,
  };
};
