/**
 * 인증 관련 API 서비스
 */

import { CONFIG } from '../config';
import { KakaoLoginResponse } from '../types/auth';

// 환경 설정
const KAKAO_CONFIG = {
  CLIENT_ID: CONFIG.KAKAO_CLIENT_ID,
  REDIRECT_URI: `${CONFIG.API_BASE_URL}users/oauth/kakao`,
};

export class AuthService {
  private static baseUrl = CONFIG.API_BASE_URL;

  /**
   * 카카오 OAuth 코드로 로그인
   */
  static async kakaoLogin(code: string): Promise<KakaoLoginResponse> {
    try {
      if (!code || code.length < 10) {
        throw new Error('유효하지 않은 카카오 인증 코드입니다.');
      }

      const encodedCode = encodeURIComponent(code);
      const url = `${this.baseUrl}users/oauth/kakao?code=${encodedCode}`;

      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'BusanVibe-Mobile-App',
        },
      });

      const responseText = await response.text();

      // 500 에러인 경우 한 번 더 시도
      if (response.status === 500 && responseText.includes('Invalid Parameter')) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'BusanVibe-Mobile-App',
          },
        });

        const retryResponseText = await response.text();

        if (!response.ok) {
          if (retryResponseText.includes('Invalid Parameter')) {
            throw new Error('백엔드 카카오 설정 오류입니다. REDIRECT_URI 환경변수를 확인해주세요.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return JSON.parse(retryResponseText);
      }

      if (!response.ok) {
        if (responseText.includes('Invalid Parameter')) {
          throw new Error('백엔드 카카오 설정 오류입니다. REDIRECT_URI 환경변수를 확인해주세요.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return JSON.parse(responseText);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 카카오 OAuth URL 생성
   */
  static getKakaoAuthUrl(): string {
    const redirectUri = encodeURIComponent(KAKAO_CONFIG.REDIRECT_URI);
    const responseType = 'code';
    const scope = encodeURIComponent('profile_nickname account_email');

    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CONFIG.CLIENT_ID}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&prompt=login`;
  }
}
