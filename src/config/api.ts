/**
 * API 설정 파일
 * 백엔드 API 통신을 위한 전역 설정
 */

import { CONFIG } from './environment';

export const API_CONFIG = {
  BASE_URL: CONFIG.API_BASE_URL,
  TIMEOUT: CONFIG.API_TIMEOUT,
} as const;

// API 엔드포인트들을 여기에 추가할 수 있습니다
export const API_ENDPOINTS = {
  FESTIVALS: 'api/festivals',
  SEARCH: 'api/search/search',
} as const;

export default API_CONFIG;
