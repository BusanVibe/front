import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG} from '../config/api';
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

const BASE_URL = API_CONFIG.BASE_URL;

/**
 * Java ArrayList 형식 데이터 파싱
 */
const parseJavaArrayList = <T>(data: unknown): T[] => {
  if (!Array.isArray(data)) return [];
  if (data.length === 2 && data[0] === 'java.util.ArrayList' && Array.isArray(data[1])) {
    return data[1];
  }
  return data as T[];
};

/**
 * Java BigDecimal 형식 좌표 파싱
 */
const parseJavaBigDecimal = (value: unknown): number | undefined => {
  if (Array.isArray(value) && value[0] === 'java.math.BigDecimal') {
    return Number(value[1]);
  }
  return typeof value === 'number' ? value : undefined;
};

/**
 * API 타입을 앱 타입으로 변환
 */
const getPlaceType = (apiType: string): PlaceType => {
  const typeMap: Record<string, PlaceType> = {
    'SIGHT': PlaceType.SIGHT,
    'RESTAURANT': PlaceType.RESTAURANT,
    'CULTURE': PlaceType.CULTURE,
    '관광지': PlaceType.SIGHT,
    '식당': PlaceType.RESTAURANT,
    '문화시설': PlaceType.CULTURE,
  };
  return typeMap[apiType] || PlaceType.SIGHT;
};

/**
 * 명소 좋아요 토글 API
 */
export const togglePlaceLike = async (placeId: number): Promise<BaseApiResponse<{success: boolean; message: string}>> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const url = `${BASE_URL}/api/places/like/${placeId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, response: ${responseText}`,
      );
    }

    return JSON.parse(responseText);
  } catch (error) {
    throw error;
  }
};

/**
 * API에서 받은 장소 데이터를 앱에서 사용하는 형태로 변환
 */
const transformApiPlaceToPlaceItem = (
  apiPlace: ApiPlaceItem,
): PlaceListItem => {
  const place = apiPlace as ApiPlaceItem & { latitude?: unknown; longitude?: unknown };
  return {
    id: apiPlace.id,
    name: apiPlace.name,
    congestion_level: apiPlace.congestion_level,
    is_like: apiPlace.is_like,
    type: getPlaceType(apiPlace.type),
    address: apiPlace.address,
    img: apiPlace.img || undefined,
    latitude: parseJavaBigDecimal(place.latitude),
    longitude: parseJavaBigDecimal(place.longitude),
  };
};

/**
 * 명소 목록 조회 API
 */
export const getPlaceList = async (
  category: PlaceCategory = PlaceCategory.ALL,
  sort: PlaceSort = PlaceSort.DEFAULT,
): Promise<PlaceListItem[]> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const url = `${BASE_URL}/api/places?category=${category}&sort=${sort}`;

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

    if (!data.is_success) {
      throw new Error(`API 오류: ${data.message}`);
    }

    const placeList = parseJavaArrayList<ApiPlaceItem>(data.result?.place_list);

    const normalizedPlaces = placeList.map((place) => {
      const placeWithCoords = place as ApiPlaceItem & { latitude?: unknown; longitude?: unknown };
      return {
        ...place,
        latitude: parseJavaBigDecimal(placeWithCoords.latitude),
        longitude: parseJavaBigDecimal(placeWithCoords.longitude),
      };
    });

    return normalizedPlaces.map(transformApiPlaceToPlaceItem);
  } catch (error) {
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

    if (!data.is_success) {
      throw new Error(`API 오류: ${data.message}`);
    }

    const result = data.result;
    if (!result) {
      throw new Error('응답 데이터가 없습니다.');
    }

    const images = parseJavaArrayList<string>(result.img);

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
      latitude: parseJavaBigDecimal(result.latitude),
      longitude: parseJavaBigDecimal(result.longitude),
    };

    return placeDetail;
  } catch (error) {
    throw error;
  }
};

/**
 * 큐레이션 아이템 타입
 */
export interface CurationItem {
  id: number;
  name: string;
  duration: string;
  type_kr: string;
  type_en: string;
  img_url: string;
}

/**
 * 큐레이션 API 응답 타입
 */
interface CurationResponse {
  curation_list: ['java.util.ArrayList', CurationItem[]];
}

/**
 * 큐레이션 데이터 조회 API
 */
export const getCurationData = async (type: 'PLACE' | 'FESTIVAL'): Promise<CurationItem[]> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const url = `${BASE_URL}/api/home/curation?type=${type}`;

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

    const data: BaseApiResponse<CurationResponse> = await response.json();

    if (!data.is_success) {
      throw new Error(`API 오류: ${data.message}`);
    }

    const result = data.result;
    if (!result) {
      throw new Error('응답 데이터가 없습니다.');
    }

    return parseJavaArrayList<CurationItem>(result.curation_list);
  } catch (error) {
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

    if (!data.is_success) {
      throw new Error(`API 오류: ${data.message}`);
    }

    const result = data.result;
    if (!result) {
      throw new Error('응답 데이터가 없습니다.');
    }

    const mostCrowdedData = Array.isArray(result.most_crowded[1])
      ? result.most_crowded[1]
      : [];

    const recommendPlaceData = Array.isArray(result.recommend_place[1])
      ? result.recommend_place[1]
      : [];

    const normalizeCoordinates = (place: HomePlace) => ({
      ...place,
      latitude: parseJavaBigDecimal(place.latitude) ?? place.latitude,
      longitude: parseJavaBigDecimal(place.longitude) ?? place.longitude,
    });

    const mostCrowded = mostCrowdedData
      .map(normalizeCoordinates)
      .map(transformHomePlaceToPlaceItem);

    const recommendPlace = recommendPlaceData
      .map(normalizeCoordinates)
      .map(transformHomePlaceToPlaceItem);

    return {
      mostCrowded,
      recommendPlace,
    };
  } catch (error) {
    throw error;
  }
};
