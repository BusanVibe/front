/**
 * 환경별 설정 파일
 */

import Config from 'react-native-config';

export type Environment = 'development' | 'staging' | 'production';

const getEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

export const CONFIG = {
  API_BASE_URL: Config.API_BASE_URL || 'https://api.busanvibe.site/',
  WS_CHAT_URL: Config.WS_CHAT_URL || 'https://api.busanvibe.site/ws-chat',
  API_TIMEOUT: parseInt(Config.API_TIMEOUT || '10000', 10),
  KAKAO_CLIENT_ID: Config.KAKAO_CLIENT_ID || '',
  KAKAO_MAP_API_KEY: Config.KAKAO_MAP_API_KEY || '',
  DEBUG: Config.DEBUG_ENABLED === 'true' || __DEV__,
};

export const ENV = getEnvironment();

export default CONFIG;
