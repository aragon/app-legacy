export interface IRequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

export interface IEthereumProvider extends EventEmitter {
  close?: () => Promise<void>;
  request: <TResult>(args: IRequestArguments) => Promise<TResult>;
  chainId: string;
}

declare global {
  interface Window {
    ethereum: IEthereumProvider;
  }
}
