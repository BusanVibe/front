/**
 * 인증 관련 타입 정의
 */

export interface TokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface KakaoLoginResult {
  id: number;
  tokenResponseDTO: TokenResponseDTO;
  email: string;
  newUser: boolean;
}

export interface KakaoLoginResponse {
  is_success: boolean;
  code: string;
  message: string;
  result: KakaoLoginResult;
}

export interface User {
  id: number;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenIssuedAt: number; // 토큰 발급 시간 (timestamp)
}
