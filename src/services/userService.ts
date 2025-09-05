import { CONFIG } from '../config';
import { MyPageDto, MyPageResponse } from '../types/user';
import { PlaceListItem, PlaceType } from '../types/place';

export class UserService {
  private static baseUrl = CONFIG.API_BASE_URL;

  static async getMyPage(accessToken: string): Promise<MyPageDto> {
    const url = `${this.baseUrl}api/users/mypage`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      console.log('=== User MyPage API ===');
      console.log('response:', response);
      const responseText = await response.text();

      if (!response.ok) {
        console.error('마이페이지 API 실패:', response.status, response.statusText, responseText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MyPageResponse = JSON.parse(responseText);

      if (!data.is_success || !data.result) {
        console.error('마이페이지 API 비정상 응답:', data);
        throw new Error('마이페이지 데이터 로드 실패');
      }

      return data.result;
    } catch (error) {
      console.error('마이페이지 API 호출 중 오류:', error);
      throw error;
    }
  }

  /**
   * 좋아요 목록 조회
   * @param accessToken 사용자 액세스 토큰
   * @param option 서버 옵션(e.g. 'restaurant', 'sight', 'festival', 'all')
   */
  static async getLikes(accessToken: string, option: string = 'restaurant'): Promise<PlaceListItem[]> {
    const normalized = String(option).toUpperCase();
    const url = `${this.baseUrl}api/users/likes?option=${encodeURIComponent(normalized)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const text = await response.text();
      // 안전 로깅: 민감정보 제외, 응답 일부만 출력
      console.log('=== User Likes API RAW ===');
      console.log('endpoint:', url);
      console.log('status:', response.status, 'ok:', response.ok);
      console.log('bodySnippet:', text.slice(0, 600));
      if (!response.ok) {
        console.error('좋아요 목록 API 실패:', response.status, response.statusText, text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = JSON.parse(text);
      const result = data?.result ?? {};
      console.log('=== User Likes API PARSED ===');
      console.log('sort:', result?.sort);
      let list: any[] = [];

      // result_list가 ["java.util.ArrayList", [ ... ]] 형태이거나 그냥 배열일 수 있음
      if (Array.isArray(result.result_list)) {
        if (Array.isArray(result.result_list[1])) {
          list = result.result_list[1] as any[];
        } else {
          list = result.result_list as any[];
        }
      }
      console.log('listLength:', Array.isArray(list) ? list.length : 0);

      const toPlaceType = (typeEn: string): PlaceType => {
        switch (String(typeEn).toUpperCase()) {
          case 'SIGHT':
            return PlaceType.SIGHT;
          case 'RESTAURANT':
            return PlaceType.RESTAURANT;
          case 'CULTURE':
            return PlaceType.CULTURE;
          default:
            return PlaceType.SIGHT;
        }
      };

      // option이 restaurant인 경우 축제는 제외하고 장소로 매핑
      const places: PlaceListItem[] = (list as any[])
        .filter(item => String(item?.type_en ?? '').toUpperCase() !== 'FESTIVAL')
        .map(item => {
          const placeItem: unknown = {
            id: Number(item.id), // 'id' 속성을 추가하여 PlaceListItem 형식에 맞춤
            name: String(item.name ?? ''),
            congestion_level: Number(item.congestion_level ?? 0),
            is_like: Boolean(item.is_liked ?? false),
            type: toPlaceType(item.type_en ?? 'SIGHT'),
            address: String(item.address ?? ''),
            img: '',
            latitude: item.latitude == null ? undefined : Number(item.latitude),
            longitude: item.longitude == null ? undefined : Number(item.longitude),
          };
          return placeItem as PlaceListItem;
        });

      console.log('=== User Likes MAPPED ===');
      console.log('mappedCount:', places.length);
      if (places.length > 0) {
        const p = places[0];
        console.log('firstItem:', { id: p.id, name: p.name, type: p.type });
      }
      return places;
    } catch (error) {
      console.error('좋아요 목록 API 호출 중 오류:', error);
      throw error;
    }
  }
}

export default UserService;


