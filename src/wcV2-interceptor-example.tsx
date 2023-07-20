import {
  WcActionRequest,
  useWalletConnectInterceptor,
} from 'hooks/useWalletConnectInterceptor';
import React, {useState} from 'react';

export const ExampleWalletConnectInterceptor: React.FC = () => {
  const [address, setAddress] = useState(
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik Buterin
  );
  const [uri, setUri] = useState('');

  function onActionRequest(request: WcActionRequest) {
    console.log(request);
  }

  const {activeSessions, wcConnect, wcDisconnect} = useWalletConnectInterceptor(
    {
      onActionRequest,
    }
  );

  return (
    <div>
      <input
        placeholder="Wallet Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
        type="text"
      />
      <input
        placeholder="WalletConnect V2 URI"
        value={uri}
        onChange={e => setUri(e.target.value)}
        type="text"
      />
      <button
        disabled={uri == null}
        onClick={() =>
          wcConnect({
            uri,
            onError: e => console.log(e),
          })
        }
      >
        Connect
      </button>
      <button
        disabled={activeSessions.length > 0}
        onClick={() => wcDisconnect(activeSessions[0].topic)}
      >
        Disconnect
      </button>
    </div>
  );
};
