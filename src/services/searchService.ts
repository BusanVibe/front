import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_CONFIG, API_ENDPOINTS} from '../config/api';
import {
  ApiSearchItem,
  ApiSearchResult,
  NormalizedSearchItem,
  NormalizedSearchResult,
  SearchRequestParams,
  SearchResponse,
  SearchOptionType,
  SearchSortType,
} from '../types/search';

const BASE_URL = API_CONFIG.BASE_URL;

const normalizeCoordinate = (
  value?: number | [string, number],
): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) {
    if (value[0] === 'java.math.BigDecimal') {
      return Number(value[1]);
    }
    return Number(value[1]);
  }
  return Number(value);
};

const transformItem = (item: ApiSearchItem): NormalizedSearchItem => {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    typeEn: (item.type_en as SearchOptionType) || SearchOptionType.ALL,
    typeKr: item.type_kr,
    latitude: normalizeCoordinate(item.latitude),
    longitude: normalizeCoordinate(item.longitude),
    isLike: item.is_like,
    startDate: item.start_date ?? null,
    endDate: item.end_date ?? null,
    isEnd: (item.is_end as any) ?? null,
    likeCount: item.like_count,
    congestionLevel: (item.congestion_level as any) ?? null,
    imageUrl: (item as any).img_url || undefined,
  };
};

export const SearchService = {
  async search(params: SearchRequestParams): Promise<NormalizedSearchResult> {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const option = params.option ?? SearchOptionType.ALL;
    const sort = params.sort ?? SearchSortType.DEFAULT;
    const keyword = params.keyword ?? '';

    const query = `option=${encodeURIComponent(
      option,
    )}&sort=${encodeURIComponent(sort)}&keyword=${encodeURIComponent(keyword)}`;
    const url = `${BASE_URL}${API_ENDPOINTS.SEARCH}?${query}`;

    // 🔍 검색 요청 로그
    console.log('=== 검색 요청 시작 ===');
    console.log('📤 요청 파라미터:', {
      option,
      sort,
      keyword,
      originalParams: params,
    });
    console.log('🌐 요청 URL:', url);
    console.log('📋 요청 헤더:', {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken.substring(0, 10)}...`, // 토큰 일부만 표시
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const startTime = Date.now();

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
    const responseTime = Date.now() - startTime;

    const text = await response.text();

    // 🔍 검색 응답 로그
    console.log('=== 검색 응답 수신 ===');
    console.log('⏱️ 응답 시간:', `${responseTime}ms`);
    console.log('📊 응답 상태:', response.status, response.statusText);
    console.log(
      '📥 응답 헤더:',
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      console.error('❌ 응답 에러:', {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    console.log('📄 응답 원본 데이터:', text);

    const data: SearchResponse<ApiSearchResult> = JSON.parse(text);

    let list: ApiSearchItem[] = [];
    const raw = data.result?.result_list as any;
    if (Array.isArray(raw)) {
      if (
        raw.length === 2 &&
        raw[0] === 'java.util.ArrayList' &&
        Array.isArray(raw[1])
      ) {
        list = raw[1] as ApiSearchItem[];
      } else {
        list = raw as ApiSearchItem[];
      }
    }

    const normalized: NormalizedSearchResult = {
      sort: (data.result?.sort as any) ?? SearchSortType.DEFAULT,
      list: list.map(transformItem),
    };

    // 🔍 검색 결과 로그
    console.log('✅ 검색 결과 처리 완료');
    console.log('📊 파싱된 데이터:', {
      resultCount: list.length,
      sort: normalized.sort,
      rawListType: typeof raw,
      isArrayFormat: Array.isArray(raw),
    });
    console.log('🎯 정규화된 결과:', {
      sort: normalized.sort,
      itemCount: normalized.list.length,
      firstItem: normalized.list[0] || null,
    });
    console.log('=== 검색 요청 완료 ===\n');

    return normalized;
  },
};

export const mapKoreanCategoryToSearchOption = (
  korean: string,
): SearchOptionType => {
  const map: Record<string, SearchOptionType> = {
    전체: SearchOptionType.ALL,
    관광명소: SearchOptionType.SIGHT,
    '맛집/카페': SearchOptionType.RESTAURANT,
    문화시설: SearchOptionType.CULTURE,
    축제: SearchOptionType.FESTIVAL,
  };
  return map[korean] ?? SearchOptionType.ALL;
};

export const mapKoreanSortToSearchSort = (korean: string): SearchSortType => {
  const map: Record<string, SearchSortType> = {
    기본순: SearchSortType.DEFAULT,
    추천순: SearchSortType.DEFAULT, // 백엔드에 별도 분류 없음 → DEFAULT로 매핑
    혼잡도순: SearchSortType.CONGESTION,
    좋아요순: SearchSortType.LIKE,
  };
  return map[korean] ?? SearchSortType.DEFAULT;
};
