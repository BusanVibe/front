import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiResponse,
  ApiPlaceListResponse,
  ApiPlaceItem,
  PlaceListItem,
  PlaceCategory,
  PlaceSort,
  PlaceType,
} from '../types/place';

const BASE_URL = 'https://api.busanvibe.site';

/**
 * API에서 받은 장소 데이터를 앱에서 사용하는 형태로 변환
 */
const transformApiPlaceToPlaceItem = (
  apiPlace: ApiPlaceItem,
): PlaceListItem => {
  // API 타입을 앱 타입으로 변환
  const getPlaceType = (apiType: string): PlaceType => {
    switch (apiType) {
      case 'SIGHT':
        return PlaceType.SIGHT;
      case 'RESTAURANT':
        return PlaceType.RESTAURANT;
      case 'CULTURE':
        return PlaceType.CULTURE;
      default:
        return PlaceType.SIGHT; // 기본값
    }
  };

  return {
    place_id: apiPlace.id,
    name: apiPlace.name,
    congestion_level: apiPlace.congestion_level,
    is_like: apiPlace.is_like,
    type: getPlaceType(apiPlace.type),
    address: apiPlace.address,
    img: apiPlace.img || undefined,
  };
};

/**
 * 명소 목록 조회 API
 * @param category 카테고리 (ALL, SIGHT, RESTAURANT, CULTURE)
 * @param sort 정렬 (DEFAULT, LIKE, CONGESTION)
 */
export const getPlaceList = async (
  category: PlaceCategory = PlaceCategory.ALL,
  sort: PlaceSort = PlaceSort.DEFAULT,
): Promise<PlaceListItem[]> => {
  try {
    // AsyncStorage에서 Access Token 가져오기
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const url = `${BASE_URL}/api/places?category=${category}&sort=${sort}`;
    console.log('명소 목록 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponse<ApiPlaceListResponse> = await response.json();
    console.log('명소 목록 API 응답:', data);

    if (!data.is_success) {
      throw new Error(`API 오류: ${data.message}`);
    }

    // API 응답 처리
    let placeList: ApiPlaceItem[] = [];

    if (data.result?.place_list) {
      if (Array.isArray(data.result.place_list)) {
        // 첫 번째 요소가 "java.util.ArrayList"인지 확인
        if (
          data.result.place_list.length === 2 &&
          data.result.place_list[0] === 'java.util.ArrayList' &&
          Array.isArray(data.result.place_list[1])
        ) {
          // ["java.util.ArrayList", [...]] 형태인 경우
          placeList = data.result.place_list[1] as ApiPlaceItem[];
        } else {
          // 직접 배열인 경우
          placeList = data.result.place_list as ApiPlaceItem[];
        }
      }
    }

    console.log(`변환 전 장소 개수: ${placeList.length}`);

    // API 응답을 앱에서 사용하는 형태로 변환
    const transformedPlaces = placeList.map(transformApiPlaceToPlaceItem);

    console.log(`변환 후 장소 개수: ${transformedPlaces.length}`);
    console.log('첫 번째 장소 샘플:', transformedPlaces[0]);

    return transformedPlaces;
  } catch (error) {
    console.error('명소 목록 조회 오류:', error);
    throw error;
  }
};

/**
 * 카테고리 한글명을 API 카테고리로 변환
 */
export const getCategoryFromKorean = (
  koreanCategory: string,
): PlaceCategory => {
  const categoryMap: Record<string, PlaceCategory> = {
    전체: PlaceCategory.ALL,
    관광명소: PlaceCategory.SIGHT,
    '맛집/카페': PlaceCategory.RESTAURANT,
    문화시설: PlaceCategory.CULTURE,
  };

  return categoryMap[koreanCategory] || PlaceCategory.ALL;
};

/**
 * 정렬 한글명을 API 정렬로 변환
 */
export const getSortFromKorean = (koreanSort: string): PlaceSort => {
  const sortMap: Record<string, PlaceSort> = {
    기본순: PlaceSort.DEFAULT,
    좋아요순: PlaceSort.LIKE,
    혼잡도순: PlaceSort.CONGESTION,
  };

  return sortMap[koreanSort] || PlaceSort.DEFAULT;
};
