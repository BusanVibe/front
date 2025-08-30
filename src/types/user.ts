export interface MyPageDto {
  nickname: string;
  email: string;
  user_image_url: string;
}

export type MyPageResponse = import('./common').BaseApiResponse<MyPageDto>;


