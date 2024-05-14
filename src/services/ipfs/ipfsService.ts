import {resolveIpfsCid} from '@aragon/sdk-client-common';
import {IPinDataProps} from './ipfsService.api';
import {pinataAPI} from 'utils/constants';

class IpfsService {
  constructor(
    private gateway: string = import.meta.env.VITE_PINATA_GATEWAY,
    private apiKey: string = import.meta.env.VITE_PINATA_JWT_API_KEY,
    private CIDVersion: string = import.meta.env.VITE_PINATA_CID_VERSION
  ) {}

  getData = async (cid: string) => {
    const resolvedCid = cid.startsWith('ipfs') ? resolveIpfsCid(cid) : cid;

    const response = await fetch(`${this.gateway}/${resolvedCid}`, {
      method: 'GET',
    });

    const data = await response.json();

    return typeof data === 'string' ? JSON.parse(data) : data;
  };

  pinData = async (data: IPinDataProps) => {
    const processedData = await this.processData(data);

    const res = await fetch(pinataAPI, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataOptions: {
          cidVersion: this.CIDVersion,
        },
        pinataContent: processedData,
      }),
    });

    return res.json();
  };

  private processData = async (
    data: IPinDataProps
  ): Promise<string | Uint8Array> => {
    let processedData: string | Uint8Array;

    if (data instanceof Blob) {
      const dataBuffer = await data.arrayBuffer();
      processedData = new Uint8Array(dataBuffer);
    } else if (typeof data !== 'string') {
      processedData = new Uint8Array(data);
    } else {
      processedData = data;
    }

    return processedData;
  };
}

export const ipfsService = new IpfsService();
