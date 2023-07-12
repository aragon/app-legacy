import {useWalletConnectInterceptor} from 'hooks/useWalletConnectInterceptor';
import React, {useState} from 'react';
import {WcRequest} from 'services/walletConnectInterceptor';

export const ExampleWalletConnectInterceptor: React.FC = () => {
  const [address, setAddress] = useState(
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik Buterin
  );
  const [uri, setUri] = useState('');

  function onActionRequest(request: WcRequest) {
    console.log(request);
  }

  const {wcConnect, canConnect, canDisconnect, wcDisconnect} =
    useWalletConnectInterceptor({
      onActionRequest,
    });

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
        disabled={!canConnect(uri)}
        onClick={() =>
          wcConnect({
            uri,
            address,
            onError: e => console.log(e),
          })
        }
      >
        Connect
      </button>
      <button disabled={!canDisconnect()} onClick={() => wcDisconnect()}>
        Disconnect
      </button>
    </div>
  );
};
