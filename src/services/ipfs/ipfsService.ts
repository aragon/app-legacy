import {IAddDataProps, IPinDataProps} from './ipfsService.api';

class IpfsService {
  addData = async ({client, data}: IAddDataProps) => {
    const processedData = await this.processData(data);

    return await client.ipfs.add(processedData);
  };

  pinData = async ({client, cid}: IPinDataProps) => {
    await client.ipfs.pin(cid);
  };

  private processData = async (
    data: IAddDataProps['data']
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
