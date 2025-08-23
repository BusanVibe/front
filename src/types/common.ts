export interface BaseApiResponse<T = any> {
  is_success: boolean;
  code: string;
  message: string;
  result?: T;
}
