export interface BaseApiResponse<T = any> {
  msg: any;
  is_success: boolean;
  code: string;
  message: string;
  result?: T;
}
