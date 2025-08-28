/**
 * 인증 관련 API 서비스
 */

import { CONFIG } from '../config';
import { KakaoLoginResponse } from '../types/auth';

export class AuthService {
  private static baseUrl = CONFIG.API_BASE_URL;

  /**
   * 카카오 OAuth 코드로 로그인
   */
  static async kakaoLogin(code: string): Promise<KakaoLoginResponse> {
    try {
      // 코드 검증
      if (!code || code.length < 10) {
        throw new Error('유효하지 않은 카카오 인증 코드입니다.');
      }

      // URL 인코딩으로 특수문자 처리
      const encodedCode = encodeURIComponent(code);
      const url = `${this.baseUrl}users/oauth/kakao?code=${encodedCode}`;
      
      console.log('=== 카카오 로그인 API 호출 ===');
      console.log('=== API 호출 디버깅 정보 ===');
      console.log('원본 코드:', code);
      console.log('인코딩된 코드:', encodedCode);
      console.log('최종 API URL:', url);
      console.log('코드 길이:', code.length);
      console.log('현재 시간:', new Date().toISOString());
      
      // 첫 번째 시도
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'BusanVibe-Mobile-App',
        },
      });

      console.log('=== 백엔드 응답 정보 ===');
      console.log('응답 상태:', response.status);
      console.log('응답 상태 텍스트:', response.statusText);
      console.log('응답 헤더:', Array.from(response.headers.entries()));

      const responseText = await response.text();
      console.log('백엔드 원본 응답:', responseText);

      // 500 에러인 경우 한 번 더 시도
      if (response.status === 500 && responseText.includes('Invalid Parameter')) {
        console.log('=== 500 에러 발생, 재시도 ===');
        
        // 잠시 대기 후 재시도
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
        console.log('재시도 응답:', retryResponseText);

        if (!response.ok) {
          console.error('=== 재시도도 실패 ===');
          console.error('상태 코드:', response.status);
          console.error('응답 내용:', retryResponseText);
          console.error('=== 백엔드 개발자용 디버깅 정보 ===');
          console.error('요청 URL:', url);
          console.error('요청 메소드:', 'GET');
          console.error('카카오 코드 길이:', code.length);
          console.error('카카오 코드 첫 10자:', code.substring(0, 10));
          console.error('카카오 코드 마지막 10자:', code.substring(code.length - 10));
          
          // 백엔드 환경 설정 문제일 가능성 안내
          if (retryResponseText.includes('Invalid Parameter')) {
            throw new Error('백엔드 카카오 설정 오류입니다. REDIRECT_URI 환경변수를 확인해주세요.');
          }
          
          throw new Error(`HTTP error! status: ${response.status}, response: ${retryResponseText}`);
        }

        const data: KakaoLoginResponse = JSON.parse(retryResponseText);
        console.log('=== 재시도 성공 ===');
        return data;
      }

      if (!response.ok) {
        console.error('=== 백엔드 API 호출 실패 ===');
        console.error('상태 코드:', response.status);
        console.error('응답 내용:', responseText);
        console.error('=== 백엔드 개발자용 디버깅 정보 ===');
        console.error('요청 URL:', url);
        console.error('요청 메소드:', 'GET');
        console.error('카카오 코드 길이:', code.length);
        console.error('카카오 코드 첫 10자:', code.substring(0, 10));
        console.error('카카오 코드 마지막 10자:', code.substring(code.length - 10));
        
        // 백엔드 환경 설정 문제일 가능성 안내
        if (responseText.includes('Invalid Parameter')) {
          throw new Error('백엔드 카카오 설정 오류입니다. REDIRECT_URI 환경변수를 https://api.busanvibe.site/users/oauth/kakao로 설정해주세요.');
        }
        
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }

      const data: KakaoLoginResponse = JSON.parse(responseText);
      console.log('=== 카카오 로그인 API 응답 성공 ===');
      console.log('응답 데이터:', {
        is_success: data.is_success,
        code: data.code,
        message: data.message,
        result: {
          id: data.result?.id,
          email: data.result?.email,
          newUser: data.result?.newUser,
          hasAccessToken: !!data.result?.tokenResponseDTO?.accessToken,
          hasRefreshToken: !!data.result?.tokenResponseDTO?.refreshToken,
          accessTokenLength: data.result?.tokenResponseDTO?.accessToken?.length,
          refreshTokenLength: data.result?.tokenResponseDTO?.refreshToken?.length,
        }
      });
      
      return data;
    } catch (error) {
      console.error('=== 카카오 로그인 API 에러 ===');
      console.error('에러 상세:', error);
      throw error;
    }
  }

  /**
   * 카카오 OAuth URL 생성
   */
  static getKakaoAuthUrl(): string {
    const clientId = '54690ce439aabad65181d8b39262d8b9';
    // 카카오 앱에 등록된 2번째 URI 사용 (운영 서버)
    const redirectUri = encodeURIComponent('https://api.busanvibe.site/users/oauth/kakao');
    const responseType = 'code';
    const scope = encodeURIComponent('profile_nickname account_email');
    
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&prompt=login`;
    
    console.log('=== 카카오 OAuth URL 생성 ===');
    console.log('Client ID:', clientId);
    console.log('Redirect URI (인코딩 전):', 'https://api.busanvibe.site/users/oauth/kakao');
    console.log('Redirect URI (인코딩 후):', redirectUri);
    console.log('Response Type:', responseType);
    console.log('Scope:', 'profile_nickname account_email');
    console.log('생성된 OAuth URL:', authUrl);
    
    return authUrl;
  }
}