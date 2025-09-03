import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiResponse,
  ApiPlaceListResponse,
  ApiPlaceItem,
  PlaceListItem,
  PlaceCategory,
  PlaceSort,
  PlaceType,
  HomeResponse,
  HomePlace,
  ApiPlaceDetailResponse,
  PlaceDetail,
} from '../types/place';
import {BaseApiResponse} from '../types/common';

const BASE_URL = 'https://api.busanvibe.site';

/**
 * 명소 좋아요 토글 API
 */
export const togglePlaceLike = async (placeId: number): Promise<BaseApiResponse<{success: boolean; message: string}>> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    console.log('=== PlaceService 좋아요 API 요청 시작 ===');
    console.log('accessToken:', accessToken);
    console.log('placeId:', placeId);

    const url = `${BASE_URL}/api/places/like/${placeId}`;

    console.log('=== 명소 좋아요 API 호출 ===');
    console.log('API URL:', url);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('=== API 응답 정보 ===');
    console.log('응답 상태:', response.status);
    console.log('응답 상태 텍스트:', response.statusText);

    const responseText = await response.text();
    console.log('응답 데이터:', responseText);

    if (!response.ok) {
      console.error('=== 명소 좋아요 API 호출 실패 ===');
      console.error('상태 코드:', response.status);
      console.error('응답 내용:', responseText);

      throw new Error(
        `HTTP error! status: ${response.status}, response: ${responseText}`,
      );
    }

    const data: BaseApiResponse<{success: boolean; message: string}> =
      JSON.parse(responseText);

    console.log('=== 명소 좋아요 API 응답 성공 ===');
    console.log('응답 데이터:', {
      isSuccess: data.is_success,
      code: data.code,
      message: data.message,
      result: data.result,
    });

    return data;
  } catch (error) {
    console.error('=== 명소 좋아요 API 에러 ===');
    console.error('에러 상세:', error);
    throw error;
  }
};

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
    id: apiPlace.id,
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
    let placeList: any[] = [];

    if (data.result?.place_list) {
      if (Array.isArray(data.result.place_list)) {
        // 첫 번째 요소가 "java.util.ArrayList"인지 확인
        if (
          data.result.place_list.length === 2 &&
          data.result.place_list[0] === 'java.util.ArrayList' &&
          Array.isArray(data.result.place_list[1])
        ) {
          // ["java.util.ArrayList", [...]] 형태인 경우
          placeList = data.result.place_list[1];
        } else {
          // 직접 배열인 경우
          placeList = data.result.place_list;
        }
      }
    }

    const normalizedPlaces = placeList.map((place: any) => {
      console.log('원본 장소 데이터:', place);

      const normalizedPlace = {
        ...place,
        latitude:
          Array.isArray(place.latitude) &&
          place.latitude[0] === 'java.math.BigDecimal'
            ? place.latitude[1]
            : place.latitude,
        longitude:
          Array.isArray(place.longitude) &&
          place.longitude[0] === 'java.math.BigDecimal'
            ? place.longitude[1]
            : place.longitude,
      };

      console.log('정규화된 장소 데이터:', normalizedPlace);
      return normalizedPlace;
    });

    console.log(`변환 전 장소 개수: ${normalizedPlaces.length}`);

    const transformedPlaces = normalizedPlaces.map(
      transformApiPlaceToPlaceItem,
    );

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

/**
 * 홈화면 데이터를 PlaceListItem으로 변환
 */
const transformHomePlaceToPlaceItem = (homePlace: HomePlace): PlaceListItem => {
  const getPlaceType = (apiType: string): PlaceType => {
    switch (apiType) {
      case '관광지':
        return PlaceType.SIGHT;
      case '식당':
        return PlaceType.RESTAURANT;
      case '문화시설':
        return PlaceType.CULTURE;
      default:
        return PlaceType.SIGHT;
    }
  };

  return {
    id: homePlace.id,
    name: homePlace.name,
    congestion_level: homePlace.congestion_level,
    is_like: homePlace.is_like || false,
    type: getPlaceType(homePlace.type),
    address: homePlace.address,
    img: homePlace.image || undefined,
    latitude: homePlace.latitude,
    longitude: homePlace.longitude,
  };
};

/**
 * 명소 상세 정보 조회 API
 */
export const getPlaceDetail = async (placeId: number): Promise<PlaceDetail> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const url = `${BASE_URL}/api/places/${placeId}`;
    console.log('명소 상세 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponse<ApiPlaceDetailResponse> = await response.json();
    console.log('명소 상세 API 응답:', data);

    if (!data.is_success) {
      throw new Error(`API 오류: ${data.message}`);
    }

    const result = data.result;
    if (!result) {
      throw new Error('응답 데이터가 없습니다.');
    }

    // 이미지 배열 처리
    let images: string[] = [];
    if (result.img && Array.isArray(result.img)) {
      if (result.img[0] === 'java.util.ArrayList' && Array.isArray(result.img[1])) {
        images = result.img[1];
      } else {
        images = result.img;
      }
    }

    // 상세 정보 구성
    const placeDetail: PlaceDetail = {
      id: result.id,
      name: result.name,
      type: result.type,
      img: images,
      congestion_level: result.congestion_level,
      grade: result.grade,
      review_amount: result.review_amount,
      like_amount: result.like_amount,
      is_open: result.is_open,
      address: result.address,
      phone: result.phone,
      is_like: result.is_like,
      introduce: result.introduce,
      use_time: result.use_time,
      rest_date: result.rest_date,
    };

    return placeDetail;
  } catch (error) {
    console.error('명소 상세 조회 오류:', error);
    throw error;
  }
};

/**
 * 홈화면 정보 조회 API
 */
export const getHomeData = async (): Promise<{
  mostCrowded: PlaceListItem[];
  recommendPlace: PlaceListItem[];
}> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const url = `${BASE_URL}/api/home`;
    console.log('홈화면 API 호출:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data: BaseApiResponse<HomeResponse> = await response.json();
    console.log('홈화면 API 응답:', data);

    if (!data.is_success) {
      throw new Error(`API 오류: ${data.message}`);
    }

    const result = data.result;
    if (!result) {
      throw new Error('응답 데이터가 없습니다.');
    }

    let mostCrowdedData = Array.isArray(result.most_crowded[1])
      ? result.most_crowded[1]
      : [];

    let recommendPlaceData = Array.isArray(result.recommend_place[1])
      ? result.recommend_place[1]
      : [];

    mostCrowdedData = mostCrowdedData.map((place: any) => ({
      ...place,
      latitude:
        Array.isArray(place.latitude) &&
        place.latitude[0] === 'java.math.BigDecimal'
          ? place.latitude[1]
          : place.latitude,
      longitude:
        Array.isArray(place.longitude) &&
        place.longitude[0] === 'java.math.BigDecimal'
          ? place.longitude[1]
          : place.longitude,
    }));

    recommendPlaceData = recommendPlaceData.map((place: any) => ({
      ...place,
      latitude:
        Array.isArray(place.latitude) &&
        place.latitude[0] === 'java.math.BigDecimal'
          ? place.latitude[1]
          : place.latitude,
      longitude:
        Array.isArray(place.longitude) &&
        place.longitude[0] === 'java.math.BigDecimal'
          ? place.longitude[1]
          : place.longitude,
    }));

    console.log(`붐비는 곳 개수: ${mostCrowdedData.length}`);
    console.log(`추천 명소 개수: ${recommendPlaceData.length}`);

    // 데이터 변환
    const mostCrowded = mostCrowdedData.map(transformHomePlaceToPlaceItem);
    const recommendPlace = recommendPlaceData.map(
      transformHomePlaceToPlaceItem,
    );

    // 좌표 디버깅
    console.log('홈 데이터 좌표 정보:');
    mostCrowded.forEach(place => {
      console.log(`${place.name}: ${place.latitude}, ${place.longitude}`);
    });
    recommendPlace.forEach(place => {
      console.log(`${place.name}: ${place.latitude}, ${place.longitude}`);
    });

    return {
      mostCrowded,
      recommendPlace,
    };
  } catch (error) {
    console.error('홈화면 데이터 조회 오류:', error);
    throw error;
  }
};

