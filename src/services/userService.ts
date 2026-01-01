import {CONFIG} from '../config';
import {MyPageDto, MyPageResponse} from '../types/user';
import {PlaceListItem, PlaceType} from '../types/place';

export class UserService {
  private static baseUrl = CONFIG.API_BASE_URL;

  static async getMyPage(accessToken: string): Promise<MyPageDto> {
    const url = `${this.baseUrl}api/users/mypage`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MyPageResponse = JSON.parse(responseText);

      if (!data.is_success || !data.result) {
        throw new Error('마이페이지 데이터 로드 실패');
      }

      return data.result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 좋아요 목록 조회
   */
  static async getLikes(
    accessToken: string,
    option: string = 'restaurant',
  ): Promise<PlaceListItem[]> {
    const normalized = String(option).toUpperCase();
    const url = `${this.baseUrl}api/users/likes?option=${encodeURIComponent(
      normalized,
    )}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = JSON.parse(text);
      const result = data?.result ?? {};
      let list: unknown[] = [];

      if (Array.isArray(result.result_list)) {
        if (Array.isArray(result.result_list[1])) {
          list = result.result_list[1];
        } else {
          list = result.result_list;
        }
      }

      const toPlaceType = (typeEn: string): PlaceType => {
        switch (String(typeEn).toUpperCase()) {
          case 'SIGHT':
            return PlaceType.SIGHT;
          case 'RESTAURANT':
            return PlaceType.RESTAURANT;
          case 'CULTURE':
            return PlaceType.CULTURE;
          case 'FESTIVAL':
            return PlaceType.FESTIVAL;
          default:
            return PlaceType.SIGHT;
        }
      };

      interface LikeItem {
        id: number;
        name?: string;
        congestion_level?: number;
        is_like?: boolean;
        type_en?: string;
        address?: string;
        img_url?: string;
        latitude?: number;
        longitude?: number;
        start_date?: string;
        end_date?: string;
        like_count?: number;
      }

      const places: PlaceListItem[] = (list as LikeItem[]).map(item => {
        const placeItem: PlaceListItem = {
          id: Number(item.id),
          name: String(item.name ?? ''),
          congestion_level: Number(item.congestion_level ?? 0),
          is_like: item.is_like == null ? true : Boolean(item.is_like),
          type: toPlaceType(item.type_en ?? 'SIGHT'),
          address: String(item.address ?? ''),
          img: String(item.img_url ?? ''),
          latitude: item.latitude == null ? undefined : Number(item.latitude),
          longitude:
            item.longitude == null ? undefined : Number(item.longitude),
          ...(String(item.type_en ?? '').toUpperCase() === 'FESTIVAL' && {
            start_date: item.start_date,
            end_date: item.end_date,
            like_count: item.like_count,
          }),
        };
        return placeItem;
      });

      return places;
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
