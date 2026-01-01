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
  FestivalDetailResult,
} from '../types/festival';

export class FestivalService {
  private static baseUrl = API_CONFIG.BASE_URL;

  /**
   * 지역축제 좋아요 API
   */
  static async toggleFestivalLike(
    festivalId: number,
  ): Promise<BaseApiResponse<{success: boolean; message: string}>> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const url = `${this.baseUrl}${API_ENDPOINTS.FESTIVALS}/like/${festivalId}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.TIMEOUT,
      );

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${responseText}`,
        );
      }

      const data: BaseApiResponse<{success: boolean; message: string}> =
        JSON.parse(responseText);

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 지역축제 목록 조회
   */
  static async getFestivalList(
    params?: FestivalListParams,
  ): Promise<BaseApiResponse<FestivalListResult>> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const sort = params?.sort || FestivalSortType.DEFAULT;
      const status = params?.status || FestivalStatusType.ALL;

      const queryString = `sort=${encodeURIComponent(
        sort,
      )}&status=${encodeURIComponent(status)}`;
      const url = `${this.baseUrl}${API_ENDPOINTS.FESTIVALS}?${queryString}`;

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

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${responseText}`,
        );
      }

      const data: BaseApiResponse<FestivalListResult> =
        JSON.parse(responseText);

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 지역축제 상세 조회
   */
  static async getFestivalDetail(
    festivalId: number,
  ): Promise<BaseApiResponse<FestivalDetailResult>> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const url = `${this.baseUrl}${API_ENDPOINTS.FESTIVALS}/${festivalId}`;

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

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, response: ${responseText}`,
        );
      }

      const data: BaseApiResponse<FestivalDetailResult> =
        JSON.parse(responseText);

      return data;
    } catch (error) {
      throw error;
    }
  }
}
