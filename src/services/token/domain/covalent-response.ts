export type CovalentResponse<TData> = {
  data: TData;
  error: boolean;
  error_message: string | null;
};
