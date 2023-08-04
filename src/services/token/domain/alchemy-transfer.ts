export type AlchemyTransfer = {
  from: string;
  rawContract: {
    address: string;
    value: string;
    decimals: string;
  };
  metadata: {
    blockTimestamp: string;
  };
  hash: string;
};
