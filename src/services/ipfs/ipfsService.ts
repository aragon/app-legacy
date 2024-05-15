import {resolveIpfsCid} from '@aragon/sdk-client-common';
import {IPinDataProps} from './ipfsService.api';
import {pinataJSONAPI, pinataFileAPI} from 'utils/constants';

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
    const {processedData, type} = await this.processData(data);
    let res;

    if (type === 'file') {
      res = await fetch(pinataFileAPI, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.apiKey,
        },
        body: processedData,
      });
    } else {
      res = await fetch(pinataJSONAPI, {
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
    }

    return res.json();
  };

  private processData = async (
    data: IPinDataProps
  ): Promise<{
    processedData: string | Uint8Array | FormData;
    type: 'file' | 'json';
  }> => {
    let processedData: string | Uint8Array | FormData;
    let type: 'file' | 'json';

    if (data instanceof Blob) {
      const formData = new FormData();
      formData.append('file', data);
      processedData = formData;
      type = 'file';
    } else if (typeof data !== 'string') {
      processedData = new Uint8Array(data);
      type = 'json';
    } else {
      processedData = data;
      type = 'json';
    }

    return {processedData, type};
  };
}

export const ipfsService = new IpfsService();
