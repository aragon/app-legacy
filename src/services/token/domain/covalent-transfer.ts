export type CovalentTokenTransfer = {
  address: string;
  items: Array<{
    transfers: CovalentTransferInfo[];
  }>;
};

export type CovalentTransferInfo = {
  block_signed_at: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  logo_url: string;
  transfer_type: 'IN' | 'OUT';
  balance: null | string;
  delta: 'string';
};
