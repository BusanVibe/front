export enum SearchOptionType {
  ALL = 'ALL',
  SIGHT = 'SIGHT',
  RESTAURANT = 'RESTAURANT',
  CULTURE = 'CULTURE',
  FESTIVAL = 'FESTIVAL',
}

export enum SearchSortType {
  DEFAULT = 'DEFAULT',
  LIKE = 'LIKE',
  CONGESTION = 'CONGESTION',
}

export interface ApiSearchItem {
  type_kr: string;
  type_en: keyof typeof SearchOptionType | string;
  id: number;
  name: string;
  latitude?: number | [string, number];
  longitude?: number | [string, number];
  address: string;
  congestion_level?: number | null;
  is_like: boolean;
  start_date?: string | null;
  end_date?: string | null;
  is_end?: boolean | null;
  like_count?: number;
  img_url?: string;
}

export interface ApiSearchResult {
  '@class': string;
  sort: SearchSortType | string;
  result_list: [string, ApiSearchItem[]] | ApiSearchItem[];
}

export interface SearchRequestParams {
  option?: SearchOptionType;
  sort?: SearchSortType;
  keyword: string;
}

export type SearchResponse<T = ApiSearchResult> = {
  is_success: boolean;
  code: string;
  message: string;
  result: T;
};

export interface NormalizedSearchItem {
  id: number;
  name: string;
  address: string;
  typeEn: SearchOptionType | string;
  typeKr: string;
  latitude?: number;
  longitude?: number;
  isLike: boolean;
  startDate?: string | null;
  endDate?: string | null;
  isEnd?: boolean | null;
  likeCount?: number;
  congestionLevel?: number | null;
  imageUrl?: string;
}

export interface NormalizedSearchResult {
  sort: SearchSortType | string;
  list: NormalizedSearchItem[];
}


