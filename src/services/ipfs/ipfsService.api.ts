import {Client} from '@aragon/sdk-client';

export interface IAddDataProps {
  client: Client;
  data: string | ArrayBuffer | Blob;
}

export interface IPinDataProps {
  client: Client;
  cid: string;
}
