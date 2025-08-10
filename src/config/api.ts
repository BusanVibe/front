/**
 * API 설정 파일
 * 백엔드 API 통신을 위한 전역 설정
 */

export const API_CONFIG = {
  BASE_URL: 'https://api.busanVibe.site/',
  TIMEOUT: 10000, // 10초
} as const;

// API 엔드포인트들을 여기에 추가할 수 있습니다
export const API_ENDPOINTS = {
  // 예시:
  // AUTH: 'auth',
  // USER: 'user',
  // POSTS: 'posts',
} as const;

export default API_CONFIG;