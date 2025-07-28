export interface BaseApiResponse<T = any> {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: T;
}
