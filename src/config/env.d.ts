/**
 * react-native-config 환경변수 타입 정의
 */

declare module 'react-native-config' {
  export interface NativeConfig {
    // API 설정
    API_BASE_URL: string;
    WS_CHAT_URL: string;
    API_TIMEOUT: string;

    // 카카오 설정
    KAKAO_CLIENT_ID: string;
    KAKAO_MAP_API_KEY: string;

    // 앱 설정
    DEBUG_ENABLED: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
