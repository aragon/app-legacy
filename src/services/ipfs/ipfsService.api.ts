export type IPinDataProps = string | ArrayBuffer | Blob;

export interface IPinDataResult {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}
