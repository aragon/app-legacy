import {
  Erc20WrapperTokenDetails,
  InstalledPluginListItem,
  SetAllowanceSteps,
  TokenVotingClient,
  UnwrapTokensStep,
  WrapTokensStep,
} from '@aragon/sdk-client';
import GovTokensWrappingModal from 'containers/govTokensWrappingModal/GovTokensWrappingModal';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {ethers} from 'ethers';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import React, {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useForm, useWatch} from 'react-hook-form';
import {generatePath, useLocation, useNavigate} from 'react-router-dom';
import {useTokenAllowance} from 'services/aragon-sdk/queries/use-token-allowance';
import {CHAIN_METADATA} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {Community} from 'utils/paths';
import {fetchBalance} from 'utils/tokens';
import {TokensWrappingFormData} from 'utils/types';
import {useQueryClient} from 'wagmi';
import {useGlobalModalContext} from './globalModals';

interface IGovTokensWrappingContextType {
  handleOpenModal: () => void;
}

const GovTokensWrappingContext =
  createContext<IGovTokensWrappingContextType | null>(null);

const GovTokensWrappingProvider: FC<{children: ReactNode}> = ({children}) => {
  const navigate = useNavigate();
  const {address: userAddress, isConnected, isOnWrongNetwork} = useWallet();
  const {network} = useNetwork();
  const loc = useLocation();
  const wagmiQueryClient = useQueryClient();
  const {api: provider} = useProviders();
  const {open} = useGlobalModalContext();

  const {data: daoDetails, isLoading: isDaoDetailsLoading} =
    useDaoDetailsQuery();
  const {id: pluginType} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);
  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType as PluginTypes);

  /* Underlying token */
  const {data: daoTokenData, isLoading: isTokenDataLoading} = useDaoToken(
    daoDetails?.plugins?.[0]?.instanceAddress || ''
  );
  const underlyingToken = (daoTokenData as Erc20WrapperTokenDetails | undefined)
    ?.underlyingToken;
  const [daoTokenBalance, setDaoTokenBalance] = useState('');

  /* Wrapped token */
  const wrappedDaoToken = daoTokenData;
  const isWrappedDaoTokenDataLoading = isTokenDataLoading;
  const [wrappedDaoTokenBalance, setWrappedDaoTokenBalance] = useState('');

  const [showModal, setShowModal] = useState(false);
  const isLoading =
    isDaoDetailsLoading || isTokenDataLoading || isWrappedDaoTokenDataLoading;

  const [isFlowFinished, setIsFlowFinished] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [isTxError, setIsTxError] = useState(false);

  const {data: tokenAllowance} = useTokenAllowance(
    {
      token: underlyingToken?.address as string,
      owner: userAddress as string,
      spender: wrappedDaoToken?.address as string,
    },
    {
      enabled:
        underlyingToken != null &&
        userAddress != null &&
        wrappedDaoToken != null,
    }
  );

  /* User-Input data configuration */
  const form = useForm<TokensWrappingFormData>({
    mode: 'onChange',
    defaultValues: {
      mode: 'wrap',
      amount: '',
    },
  });

  const [mode, amount] = useWatch({
    name: ['mode', 'amount'],
    control: form.control,
  });

  /*************************************************
   *             Callbacks & Handlers              *
   *************************************************/

  const loadDaoTokenBalance = useCallback(async () => {
    if (!underlyingToken || !userAddress) return;
    try {
      const balanceResult = await fetchBalance(
        underlyingToken.address,
        userAddress,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );

      // To exclude from showing super small balances like 1e^x
      if (Number(balanceResult) && Number(balanceResult) >= 0.000001) {
        setDaoTokenBalance(balanceResult);
      }
    } catch (e) {
      console.error(e);
    }
  }, [underlyingToken, network, provider, userAddress]);

  const loadWrappedDaoTokenBalance = useCallback(async () => {
    if (!wrappedDaoToken || !userAddress) return;
    try {
      const balanceResult = await fetchBalance(
        wrappedDaoToken.address,
        userAddress,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );

      // To exclude from showing super small balances like 1e^x
      if (Number(balanceResult) && Number(balanceResult) >= 0.000001) {
        setWrappedDaoTokenBalance(balanceResult);
      }
    } catch (e) {
      console.error(e);
    }
  }, [network, provider, userAddress, wrappedDaoToken]);

  const reset = useCallback(() => {
    setIsFlowFinished(false);
    setIsTxError(false);
    setIsTxLoading(false);
    setCurrentStep(1);
    form.reset();
    loadDaoTokenBalance();
    loadWrappedDaoTokenBalance();
  }, [form, loadDaoTokenBalance, loadWrappedDaoTokenBalance]);

  const handleOpenModal = useCallback(() => {
    loadDaoTokenBalance();
    loadWrappedDaoTokenBalance();
    setShowModal(true);
  }, [loadDaoTokenBalance, loadWrappedDaoTokenBalance]);

  const handleCloseModal = useCallback(
    (redirectPage = true) => {
      if (isTxLoading) return;
      setShowModal(false);
      reset();

      if (isFlowFinished && daoDetails && redirectPage) {
        const communityPagePath = generatePath(Community, {
          network,
          dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
        });

        const isOnCommunityPage = communityPagePath === loc.pathname;

        if (isOnCommunityPage) {
          location.reload();
        } else {
          navigate(
            generatePath(Community, {
              network,
              dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
            })
          );
        }
      }
    },
    [isTxLoading, reset, isFlowFinished, daoDetails, network, loc, navigate]
  );

  const ensureOnRightNetwork = useCallback(
    (callback: () => unknown) => {
      if (!isConnected) {
        handleCloseModal();
        open('wallet');
      } else if (isOnWrongNetwork) {
        handleCloseModal();
        open('network');
      } else {
        callback();
      }
    },
    [handleCloseModal, isConnected, isOnWrongNetwork, open]
  );

  // Invalidate wagmi balance cache to display the correct token balances after
  // the wrap / unwrap processes
  const invalidateDaoTokenBalanceCache = useCallback(() => {
    wagmiQueryClient.invalidateQueries([
      {
        entity: 'balance',
        address: userAddress,
        token: wrappedDaoToken?.address,
      },
    ]);
    wagmiQueryClient.invalidateQueries([
      {
        entity: 'balance',
        address: userAddress,
        token: daoTokenData?.address,
      },
    ]);
  }, [wagmiQueryClient, userAddress, wrappedDaoToken, daoTokenData]);

  const handleApprove = useCallback(async () => {
    if (isTxLoading || !wrappedDaoToken || !underlyingToken) return;
    if (!client) throw new Error('SDK client is not initialized correctly');

    setIsTxError(false);
    setIsTxLoading(true);

    const setAllowanceSteps = client.methods.setAllowance({
      amount: BigInt(
        ethers.utils.parseUnits(amount, wrappedDaoToken.decimals).toString()
      ),
      spender: wrappedDaoToken.address,
      tokenAddress: underlyingToken.address,
    });

    try {
      for await (const step of setAllowanceSteps) {
        try {
          switch (step.key) {
            case SetAllowanceSteps.ALLOWANCE_SET:
              setIsTxError(false);
              setCurrentStep(2);
              break;
          }
        } catch (err) {
          setIsTxError(true);
          console.error(err);
        }
      }
    } catch (e) {
      setIsTxError(true);
    } finally {
      setIsTxLoading(false);
    }
  }, [isTxLoading, wrappedDaoToken, underlyingToken, client, amount]);

  const handleWrap = useCallback(async () => {
    if (isTxLoading || !wrappedDaoToken || !pluginClient) return;
    setIsTxError(false);
    setIsTxLoading(true);

    const wrapTokenSteps = (
      pluginClient as TokenVotingClient
    ).methods.wrapTokens({
      wrappedTokenAddress: wrappedDaoToken.address,
      amount: BigInt(
        ethers.utils.parseUnits(amount, wrappedDaoToken.decimals).toString()
      ),
    });

    try {
      for await (const step of wrapTokenSteps) {
        try {
          switch (step.key) {
            case WrapTokensStep.DONE: {
              setIsTxError(false);
              setIsFlowFinished(true);
              invalidateDaoTokenBalanceCache();
              break;
            }
          }
        } catch (err) {
          console.error(err);
          setIsTxError(true);
        }
      }
    } catch (e) {
      setIsTxError(true);
    } finally {
      setIsTxLoading(false);
    }
  }, [
    isTxLoading,
    wrappedDaoToken,
    pluginClient,
    amount,
    invalidateDaoTokenBalanceCache,
  ]);

  const handleAddWrappedTokenToWallet = useCallback(async () => {
    if (!window.ethereum || !wrappedDaoToken) return;

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: wrappedDaoToken.address,
            symbol: wrappedDaoToken.symbol,
            decimals: wrappedDaoToken.decimals,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }, [wrappedDaoToken]);

  const handleUnwrap = useCallback(async () => {
    if (isTxLoading || !wrappedDaoToken || !pluginClient) return;
    setIsTxError(false);
    setIsTxLoading(true);

    const unwrapTokenSteps = (
      pluginClient as TokenVotingClient
    ).methods.unwrapTokens({
      wrappedTokenAddress: wrappedDaoToken.address,
      amount: BigInt(
        ethers.utils.parseUnits(amount, wrappedDaoToken.decimals).toString()
      ),
    });

    try {
      for await (const step of unwrapTokenSteps) {
        try {
          switch (step.key) {
            case UnwrapTokensStep.DONE: {
              setIsTxError(false);
              setIsFlowFinished(true);
              invalidateDaoTokenBalanceCache();
              break;
            }
          }
        } catch (err) {
          console.error(err);
          setIsTxError(true);
        }
      }
    } catch (e) {
      setIsTxError(true);
    } finally {
      setIsTxLoading(false);
    }
  }, [
    amount,
    isTxLoading,
    pluginClient,
    wrappedDaoToken,
    invalidateDaoTokenBalanceCache,
  ]);

  /*************************************************
   *               Lifecycle hooks                 *
   *************************************************/

  useEffect(() => {
    loadDaoTokenBalance();
  }, [loadDaoTokenBalance]);

  useEffect(() => {
    loadWrappedDaoTokenBalance();
  }, [loadWrappedDaoTokenBalance]);

  useEffect(() => {
    setCurrentStep(1);
    setIsTxError(false);
    form.resetField('amount');
  }, [form, mode]);

  useEffect(() => {
    if (wrappedDaoToken == null || amount === '' || tokenAllowance == null) {
      return;
    }

    const wrapAmount = BigInt(
      ethers.utils.parseUnits(amount, wrappedDaoToken.decimals).toString()
    );

    if (tokenAllowance.gte(wrapAmount)) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [wrappedDaoToken, amount, tokenAllowance]);

  /*************************************************
   *                   Render                      *
   *************************************************/
  const contextValue = useMemo(() => ({handleOpenModal}), [handleOpenModal]);

  return (
    <GovTokensWrappingContext.Provider value={contextValue}>
      {children}
      <GovTokensWrappingModal
        isOpen={showModal}
        onClose={handleCloseModal}
        isLoading={isLoading}
        daoToken={underlyingToken}
        wrappedDaoToken={wrappedDaoToken}
        balances={{
          wrapped: wrappedDaoTokenBalance,
          unwrapped: daoTokenBalance,
        }}
        form={form}
        isFinished={isFlowFinished}
        currentStep={currentStep}
        isTxLoading={isTxLoading}
        isTxError={isTxError}
        handleApprove={() => {
          ensureOnRightNetwork(handleApprove);
        }}
        handleWrap={() => {
          ensureOnRightNetwork(handleWrap);
        }}
        handleAddWrappedTokenToWallet={() => {
          ensureOnRightNetwork(handleAddWrappedTokenToWallet);
        }}
        handleUnwrap={() => {
          ensureOnRightNetwork(handleUnwrap);
        }}
      />
    </GovTokensWrappingContext.Provider>
  );
};

function useGovTokensWrapping(): IGovTokensWrappingContextType {
  return useContext(GovTokensWrappingContext) as IGovTokensWrappingContextType;
}

export {GovTokensWrappingProvider, useGovTokensWrapping};
