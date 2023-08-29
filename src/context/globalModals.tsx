import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';

const GlobalModalsContext = createContext<GlobalModalsContextType | null>(null);

type GlobalModalsContextType = {
  isTransferOpen: boolean;
  isTokenOpen: boolean;
  isUtcOpen: boolean;
  isSelectDaoOpen: boolean;
  isAddActionOpen: boolean;
  isAddressesOpen: boolean;
  isWalletOpen: boolean;
  isNetworkOpen: boolean;
  isMobileMenuOpen: boolean;
  isManageWalletOpen: boolean;
  isGatingOpen: boolean;
  isDepositOpen: boolean;
  isPoapClaimOpen: boolean;
  isExportCsvOpen: boolean;
  isDelegateVotingOpen: boolean;
  open: (menu: MenuTypes) => void;
  close: (menu: MenuTypes) => void;
};

export type MenuTypes =
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
  | 'delegateVoting';

type Props = Record<'children', ReactNode>;

/* TODO This should be reworked to have one state that holds the open menu,
instead of one boolean state for each of the menus. This can be done based on a
type like MenuType. Then this context can be extended simply by adding a new
type to MenuTypes. */
export const GlobalModalsProvider: React.FC<Props> = ({children}) => {
  const [isTransferOpen, setIsTransferOpen] =
    useState<GlobalModalsContextType['isTransferOpen']>(false);
  const [isTokenOpen, setIsTokenOpen] =
    useState<GlobalModalsContextType['isTokenOpen']>(false);
  const [isUtcOpen, setIsUtcOpen] =
    useState<GlobalModalsContextType['isUtcOpen']>(false);
  const [isAddActionOpen, setIsAddActionOpen] =
    useState<GlobalModalsContextType['isAddActionOpen']>(false);
  const [isSelectDaoOpen, setIsSelectDaoOpen] =
    useState<GlobalModalsContextType['isSelectDaoOpen']>(false);
  const [isAddressesOpen, setAddressesOpen] =
    useState<GlobalModalsContextType['isAddressesOpen']>(false);
  const [isWalletOpen, setWalletOpen] =
    useState<GlobalModalsContextType['isWalletOpen']>(false);
  const [isNetworkOpen, setNetworkOpen] =
    useState<GlobalModalsContextType['isNetworkOpen']>(false);
  const [isMobileMenuOpen, setMobileMenuOpen] =
    useState<GlobalModalsContextType['isMobileMenuOpen']>(false);
  const [isManageWalletOpen, setManageWalletOpen] =
    useState<GlobalModalsContextType['isManageWalletOpen']>(false);
  const [isGatingOpen, setIsGatingOpen] =
    useState<GlobalModalsContextType['isGatingOpen']>(false);
  const [isDepositOpen, setIsDepositOpen] =
    useState<GlobalModalsContextType['isDepositOpen']>(false);
  const [isPoapClaimOpen, setIsPoapClaimOpen] =
    useState<GlobalModalsContextType['isPoapClaimOpen']>(false);
  const [isExportCsvOpen, setIsExportCsvOpen] =
    useState<GlobalModalsContextType['isExportCsvOpen']>(false);
  const [isDelegateVotingOpen, setIsDelegateVotingOpen] =
    useState<GlobalModalsContextType['isDelegateVotingOpen']>(false);

  const toggle = useCallback((type: MenuTypes, isOpen = true) => {
    switch (type) {
      case 'token':
        setIsTokenOpen(isOpen);
        break;
      case 'utc':
        setIsUtcOpen(isOpen);
        break;
      case 'addAction':
        setIsAddActionOpen(isOpen);
        break;
      case 'selectDao':
        setIsSelectDaoOpen(isOpen);
        break;
      case 'addresses':
        setAddressesOpen(isOpen);
        break;
      case 'wallet':
        setWalletOpen(isOpen);
        break;
      case 'network':
        setNetworkOpen(isOpen);
        break;
      case 'mobileMenu':
        setMobileMenuOpen(isOpen);
        break;
      case 'manageWallet':
        setManageWalletOpen(isOpen);
        break;
      case 'gating':
        setIsGatingOpen(isOpen);
        break;
      case 'deposit':
        setIsDepositOpen(isOpen);
        break;
      case 'poapClaim':
        setIsPoapClaimOpen(isOpen);
        break;
      case 'delegateVoting':
        setIsDelegateVotingOpen(isOpen);
        break;
      case 'transfer':
        setIsTransferOpen(isOpen);
        break;
      case 'exportCsv':
        setIsExportCsvOpen(isOpen);
        break;
      default:
        throw new Error(`GlobalModals: modal ${type} unsupported`);
    }
  }, []);

  const close = useCallback((type: MenuTypes) => toggle(type, false), [toggle]);
  const open = useCallback((type: MenuTypes) => toggle(type, true), [toggle]);

  /**
   * TODO: ==============================================
   * I used this context for managing all modals but we should
   * categories the modal pages and organize it in a better way
   *====================================================
   */
  // Since the modals can not be open at the same time, I actually think this is
  // a good solution. Keeps the logic in one place and makes it simply to
  // extend. [VR 10-01-2022]

  const value = useMemo(
    (): GlobalModalsContextType => ({
      isTransferOpen,
      isTokenOpen,
      isUtcOpen,
      isAddActionOpen,
      isSelectDaoOpen,
      isAddressesOpen,
      isWalletOpen,
      isNetworkOpen,
      isMobileMenuOpen,
      isManageWalletOpen,
      isGatingOpen,
      isDepositOpen,
      isPoapClaimOpen,
      isExportCsvOpen,
      isDelegateVotingOpen,
      open,
      close,
    }),
    [
      isAddActionOpen,
      isAddressesOpen,
      isDepositOpen,
      isExportCsvOpen,
      isGatingOpen,
      isManageWalletOpen,
      isMobileMenuOpen,
      isNetworkOpen,
      isPoapClaimOpen,
      isSelectDaoOpen,
      isTokenOpen,
      isTransferOpen,
      isUtcOpen,
      isWalletOpen,
      isDelegateVotingOpen,
      open,
      close,
    ]
  );

  return (
    <GlobalModalsContext.Provider value={value}>
      {children}
    </GlobalModalsContext.Provider>
  );
};

export const useGlobalModalContext = (): GlobalModalsContextType => {
  const values = useContext(GlobalModalsContext);

  if (values == null) {
    throw new Error(
      'GlobalModals: hook must be used inside the GlobalModalContext in order to work properly.'
    );
  }

  return values;
};
