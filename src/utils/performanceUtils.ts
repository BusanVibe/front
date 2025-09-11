/**
 * 성능 최적화 유틸리티 함수들
 */

// 디바운스 함수 - 검색 등에 사용
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 스로틀 함수 - 스크롤 이벤트 등에 사용
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 이미지 캐시 키 생성
export const generateImageCacheKey = (url: string): string => {
  return url.replace(/[^a-zA-Z0-9]/g, '_');
};

// 메모리 사용량 모니터링 (개발용)
export const logMemoryUsage = () => {
  if (__DEV__) {
    // React Native에서는 performance.memory가 없으므로 
    // 개발 중에만 사용할 수 있는 로깅
    console.log('Memory monitoring - 개발 환경에서만 사용');
  }
};
