import {resolveIpfsCid} from '@aragon/sdk-client-common';
import {IPinDataProps} from './ipfsService.api';
import {pinataJSONAPI, pinataFileAPI, DataType} from 'utils/constants';

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

    if (type === DataType.File) {
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
    type: DataType;
  }> => {
    let processedData: string | Uint8Array | FormData;
    let type: DataType;

    if (data instanceof Blob) {
      const formData = new FormData();
      formData.append(DataType.File, data);
      processedData = formData;
      type = DataType.File;
    } else if (typeof data === 'string') {
      processedData = JSON.parse(data);
      type = DataType.JSON;
    } else {
      processedData = new Uint8Array(data);
      type = DataType.JSON;
    }

    return {processedData, type};
  };
}

export const ipfsService = new IpfsService();
