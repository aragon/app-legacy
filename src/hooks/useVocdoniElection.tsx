import {ChakraProps} from '@chakra-ui/system';
import {
  CensusType,
  CspVote,
  PublishedElection,
  VocdoniSDKClient,
  Vote,
} from '@vocdoni/sdk';
import {
  ComponentType,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {FieldValues} from 'react-hook-form';
import {useClient} from '../../client';
import {areEqualHexStrings} from '../../utils';
import {HR} from '../layout';
import {ElectionActions} from './Actions';
import {ElectionDescription} from './Description';
import {ElectionFormError} from './FormError';
import {ElectionHeader} from './Header';
import {ElectionQuestions} from './Questions';
import {ElectionResults} from './Results';
import {ElectionSchedule} from './Schedule';
import {ElectionStatusBadge} from './StatusBadge';
import {ElectionTitle} from './Title';
import {VoteButton} from './VoteButton';

export type ElectionProviderProps = {
  id?: string;
  election?: PublishedElection;
  ConnectButton?: ComponentType;
  fetchCensus?: boolean;
  beforeSubmit?: (vote: Vote) => boolean;
  autoUpdateInterval?: number;
  autoUpdate?: boolean;
};

export const useElectionProvider = ({
  id,
  election: data,
  fetchCensus,
  beforeSubmit,
  autoUpdateInterval,
  autoUpdate,
  ...rest
}: ElectionProviderProps) => {
  const {client: c, localize} = useClient();
  const [client, setClient] = useState<VocdoniSDKClient>(c);
  const [loading, setLoading] = useState<boolean>(false);
  const [voting, setVoting] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [voted, setVoted] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [election, setElection] = useState<PublishedElection | undefined>(data);
  const [isAbleToVote, setIsAbleToVote] = useState<boolean | undefined>(
    undefined
  );
  const [votesLeft, setVotesLeft] = useState<number>(0);
  const [isInCensus, setIsInCensus] = useState<boolean>(false);
  const [formError, setFormError] = useState<boolean>(false);
  const [voterAddress, setVoterAddress] = useState<string | undefined>(
    undefined
  );
  const [censusType, setCensusType] = useState<CensusType | undefined>(
    undefined
  );
  const [voteInstance, setVoteInstance] = useState<Vote | undefined>(undefined);
  const [cspVotingToken, setCspVotingToken] = useState<string | undefined>(
    undefined
  );
  const [authToken, setAuthToken] = useState<any>(null);
  const [handler] = useState<string>('github'); // Hardcoded until we let to choose

  const fetchElection = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const e = await client.fetchElection(id);
        setLoaded(true);
        setElection(e);
        setError('');
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  // CSP OAuth flow
  // As vote setting and voting token are async, we need to wait for both to be set
  useEffect(() => {
    if (cspVotingToken && voteInstance) {
      cspVote(cspVotingToken, voteInstance);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cspVotingToken, voteInstance]);

  // fetch election
  useEffect(() => {
    if (!id || !client || loading) return;
    if (loaded && areEqualHexStrings(election?.id, id)) return;

    fetchElection(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [election, id, client, loading, loaded]);

  // properly set election data in case it comes from props (and/or updates)
  useEffect(() => {
    if (!data) return;
    if (loaded && areEqualHexStrings(election?.id, id)) return;

    setElection(data);
    setLoaded(true);
  }, [data, election?.id, id, loaded]);

  // check if logged in user is able to vote
  useEffect(() => {
    if (!fetchCensus || !election || !loaded || loading || !client.wallet)
      return;
    (async () => {
      const address = await client.wallet?.getAddress();
      if (
        isAbleToVote !== undefined &&
        areEqualHexStrings(voterAddress, address)
      )
        return;

      try {
        setLoading(true);
        setVoterAddress(address);
        const isIn = await client.isInCensus(election.id);
        setIsInCensus(isIn);
        const censusType: CensusType = election.census.type;
        setCensusType(censusType);

        let left = 0;
        if (isIn || censusType === CensusType.WEIGHTED) {
          // no need to check votes left if member ain't in census
          left = await client.votesLeftCount(election.id);
          setVotesLeft(left);

          const voted = await client.hasAlreadyVoted(election.id);
          setVoted(voted);
        }
        setIsAbleToVote((left > 0 && isIn) || censusType === CensusType.CSP);
      } catch (e) {
        console.warn('could not check census belonging:', e);
        setIsAbleToVote(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [
    fetchCensus,
    election,
    loaded,
    client,
    isAbleToVote,
    loading,
    voterAddress,
  ]);

  // auto update metadata (if enabled)
  useEffect(() => {
    if (!autoUpdate || !(election && election.id)) return;

    const interval = setInterval(
      () => fetchElection(election.id),
      autoUpdateInterval || 30000
    );

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdate, autoUpdateInterval, election]);

  // CSP OAuth flow
  // Listening for the popup window meessage (oauth flows)
  useEffect(() => {
    (async () => {
      const handleMessage = (event: any) => {
        if (event.data.code && event.data.handler) {
          getOAuthToken(client, event.data.code, event.data.handler);
        }
      };

      if (window.opener || !client || censusType !== CensusType.CSP) {
        return;
      }

      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, censusType]);

  // CSP OAuth flow
  // Posting the message to the main window
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return;
      if (window.location.href.split('?').length < 2) return;

      const params: URLSearchParams = new URLSearchParams(
        window.location.search
      );
      const code: string | null = params.get('code');
      const handler: string | null = params.get('handler');
      if (!code || !handler) return;

      if (window.opener) {
        // If it is, send the code to the parent window and close the popup
        window.opener.postMessage({code, handler}, '*');
        window.close();
      }
    })();
  }, []);

  // context vote function (the one to be used with the given components)
  const vote = async (values: FieldValues) => {
    if (!client) {
      throw new Error('no client initialized');
    }
    if (!client.wallet) {
      throw new Error('no signer provided');
    }
    if (!election) {
      throw new Error('no election initialized');
    }

    setVoting(true);
    setError('');

    client.setElectionId(election.id);
    // map questions back to expected Vote[] values
    const mapped = election.questions.map((q, k) =>
      parseInt(values[k.toString()], 10)
    );

    try {
      const vote = new Vote(mapped);
      setVoteInstance(vote);
      if (typeof beforeSubmit === 'function' && !beforeSubmit(vote)) {
        return;
      }

      if (censusType === CensusType.CSP) {
        await cspAuthAndVote();
      } else if (censusType === CensusType.WEIGHTED) {
        const vid = await weightedVote(vote);
        setVoted(vid);
        setVotesLeft(votesLeft - 1);
        setIsAbleToVote(isInCensus && votesLeft - 1 > 0);
        return vid;
      } else {
        throw new Error('unknown census type');
      }
    } catch (e: any) {
      if ('reason' in e) {
        return setError(e.reason as string);
      }
      if ('message' in e) {
        return setError(e.message as string);
      }
      console.error('could not vote:', e);
    } finally {
      setVoting(false);
    }
  };

  const weightedVote = async (vote: Vote): Promise<string> => {
    if (!vote) {
      throw new Error('no vote instance');
    }
    if (censusType !== CensusType.WEIGHTED) {
      throw new Error('not a Weighted election');
    }

    return await client.submitVote(vote);
  };

  // CSP OAuth flow
  const cspAuthAndVote = async () => {
    if (!client) {
      throw new Error('no client initialized');
    }
    if (!election) {
      throw new Error('no election initialized');
    }
    if (censusType !== CensusType.CSP) {
      throw new Error('not a CSP election');
    }

    const params: URLSearchParams = new URLSearchParams(window.location.search);
    if (!params.has('electionId')) {
      params.append('electionId', election.id);
    }

    if (!params.has('handler')) {
      params.append('handler', handler);
    }
    const redirectURL = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}${window.location.hash}`;

    let step0: any;
    try {
      step0 = await client.cspStep(0, [handler, redirectURL]);
    } catch (e: any) {
      if ('reason' in e) {
        return setError(e.reason as string);
      }
    }

    setAuthToken(step0.authToken);
    openLoginPopup(handler, step0['response'][0]);
  };

  // CSP OAuth flow
  // Opens a popup window to the service login page
  const openLoginPopup = (handler: string, url: string) => {
    const width = 600;
    const height = 600;
    const left = window.outerWidth / 2 - width / 2;
    const top = window.outerHeight / 2 - height / 2;
    const params = [
      `width=${width}`,
      `height=${height}`,
      `top=${top}`,
      `left=${left}`,
      'status=no',
      'resizable=yes',
      'scrollbars=yes',
    ].join(',');

    window.open(url, handler, params);
  };

  // CSP OAuth flow
  const getOAuthToken = async (
    vocdoniClient: any,
    code: string,
    handler: string
  ) => {
    if (cspVotingToken) {
      return;
    }

    if (!code) {
      throw new Error('no code provided');
    }
    if (!handler) {
      throw new Error('no handler provided');
    }

    // Extract the electionId query param from the redirectURL
    const existingParams = new URLSearchParams(window.location.search);
    const electionId = existingParams.get('electionId');
    const params: URLSearchParams = new URLSearchParams();
    params.append('electionId', electionId as string);
    params.append('handler', handler);

    const redirectURL = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}${window.location.hash}`;

    let step1;
    try {
      step1 = await vocdoniClient.cspStep(
        1,
        [handler, code, redirectURL],
        authToken
      );
      setCspVotingToken(step1.token);
    } catch (e) {
      setError('Not authorized to vote');
      return false;
    }
  };

  // CSP OAuth flow
  const cspVote = async (token: string, vote: Vote) => {
    if (!client) {
      throw new Error('no client initialized');
    }

    if (censusType !== CensusType.CSP) {
      throw new Error('not a CSP election');
    }

    try {
      const walletAddress: string =
        (await client.wallet?.getAddress()) as string;
      const signature: string = await client.cspSign(walletAddress, token);
      const cspVote: CspVote = client.cspVote(vote as Vote, signature);
      const vid: string = await client.submitVote(cspVote);
      setVoted(vid);
      setVotesLeft(votesLeft - 1);
      setCspVotingToken(undefined);
      setVoteInstance(undefined);
      return vid;
    } catch (e) {
      setError('Error submitting vote');
      return false;
    }
  };

  return {
    ...rest,
    client,
    election,
    error,
    formError,
    isAbleToVote,
    isInCensus,
    loaded,
    loading,
    setClient,
    setFormError,
    localize,
    vote,
    voted,
    votesLeft,
    voting,
  };
};

export type ElectionState = ReturnType<typeof useElectionProvider>;

export const ElectionContext = createContext<ElectionState | undefined>(
  undefined
);

export const useElection = () => {
  const ctxt = useContext(ElectionContext);
  if (!ctxt) {
    throw new Error(
      'useElection returned `undefined`, maybe you forgot to wrap the component within <ElectionProvider />?'
    );
  }

  return ctxt;
};

export type ElectionProviderComponentProps = ElectionProviderProps &
  ChakraProps;

export const ElectionProvider = ({
  children,
  ...rest
}: PropsWithChildren<ElectionProviderComponentProps>) => {
  const value = useElectionProvider(rest);

  return (
    <ElectionContext.Provider value={value}>
      {children}
    </ElectionContext.Provider>
  );
};
ElectionProvider.displayName = 'ElectionProvider';

export const Election = (props: ElectionProviderComponentProps) => (
  <ElectionProvider {...props} fetchCensus>
    <ElectionHeader />
    <ElectionTitle />
    <ElectionSchedule />
    <ElectionStatusBadge />
    <ElectionActions />
    <ElectionDescription />
    <HR />
    <ElectionQuestions />
    <ElectionFormError />
    <VoteButton />
    <ElectionResults />
  </ElectionProvider>
);
Election.displayName = 'Election';
