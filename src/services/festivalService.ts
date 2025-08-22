/**
 * 축제 관련 API 서비스
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, API_ENDPOINTS} from '../config/api';
import {BaseApiResponse} from '../types/common';
import {
  FestivalListResult,
  FestivalListParams,
  FestivalSortType,
  FestivalStatusType,
} from '../types/festival';

export class FestivalService {
  private static baseUrl = API_CONFIG.BASE_URL;

  /**
   * 지역축제 목록 조회
   */
  static async getFestivalList(
    params?: FestivalListParams,
  ): Promise<BaseApiResponse<FestivalListResult>> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('=== FestivalService API 요청 시작 ===');
      console.log('accessToken:', accessToken);
      // 수동으로 쿼리 스트링 구성
      const sort = params?.sort || FestivalSortType.DEFAULT;
      const status = params?.status || FestivalStatusType.ALL;

      const queryString = `sort=${encodeURIComponent(
        sort,
      )}&status=${encodeURIComponent(status)}`;
      const url = `${this.baseUrl}${API_ENDPOINTS.FESTIVALS}?${queryString}`;

      console.log('=== 지역축제 목록 조회 API 호출 ===');
      console.log('API URL:', url);
      console.log('요청 파라미터:', params);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT,
      );

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('=== API 응답 정보 ===');
      console.log('응답 상태:', response.status);
      console.log('응답 상태 텍스트:', response.statusText);

      const responseText = await response.text();
      console.log('응답 데이터:', responseText);

      if (!response.ok) {
        console.error('=== 지역축제 목록 조회 API 호출 실패 ===');
        console.error('상태 코드:', response.status);
        console.error('응답 내용:', responseText);

        throw new Error(
          `HTTP error! status: ${response.status}, response: ${responseText}`,
        );
      }

      const data: BaseApiResponse<FestivalListResult> =
        JSON.parse(responseText);

      console.log('=== 지역축제 목록 조회 API 응답 성공 ===');
      console.log('응답 데이터:', {
        isSuccess: data.is_success,
        code: data.code,
        message: data.message,
        festivalCount: data.result?.festival_list?.[1]?.length || 0,
      });

      return data;
    } catch (error) {
      console.error('=== 지역축제 목록 조회 API 에러 ===');
      console.error('에러 상세:', error);
      throw error;
    }
  }
}
