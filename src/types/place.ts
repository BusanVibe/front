export enum PlaceType {
  SIGHT = 'SIGHT',
  RESTAURANT = 'RESTAURANT',
  CULTURE = 'CULTURE',
}

export enum CardType {
  PLACE = 'PLACE',
  FESTIVAL = 'FESTIVAL',
}

export interface PlaceListItem {
  place_id: number;
  name: string;
  congestion_level: number;
  is_like: boolean;
  type: PlaceType;
  address: string;
  img?: string;
  latitude?: number;
  longitude?: number;
}

export interface FestivalListItem {
  festival_id: number;
  name: string;
  is_like: boolean;
  address: string;
  img?: string;
  start_date: string;
  end_date: string;
}

export interface PlaceDetail {
  id: number;
  name: string;
  type: PlaceType;
  img: string[];
  congestion_level: number;
  grade: number | null;
  review_amount: number;
  like_amount: number;
  is_open: boolean;
  address: string;
  phone: string;
  is_like: boolean;
  introduce?: string;
  use_time?: string;
  rest_date?: string;
}

export interface PlaceListResult {
  place_list: PlaceListItem[];
}

export interface ApiPlaceItem {
  id: number;
  name: string;
  congestion_level: number;
  is_like: boolean;
  like_amount: number;
  type: string;
  address: string;
  img?: string;
}

export interface ApiPlaceListResponse {
  '@class': string;
  place_list: ApiPlaceItem[] | [string, ApiPlaceItem[]];
}

export interface ApiResponse<T> {
  is_success: boolean;
  code: string;
  message: string;
  result: T;
}

export interface ApiPlaceDetailResponse {
  '@class': string;
  id: number;
  name: string;
  type: PlaceType;
  img: [string, string[]];
  congestion_level: number;
  grade: number | null;
  review_amount: number;
  like_amount: number;
  is_open: boolean;
  address: string;
  phone: string;
  is_like: boolean;
  introduce?: string;
  use_time?: string;
  rest_date?: string;
}

export enum PlaceCategory {
  ALL = 'ALL',
  SIGHT = 'SIGHT',
  RESTAURANT = 'RESTAURANT',
  CULTURE = 'CULTURE',
}

export enum PlaceSort {
  DEFAULT = 'DEFAULT',
  LIKE = 'LIKE',
  CONGESTION = 'CONGESTION',
}

export interface HomePlace {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  image: string;
  congestion_level: number;
  address: string;
  is_like: boolean;
}

export interface HomeResponse {
  '@class': string;
  most_crowded: [string, HomePlace[]];
  recommend_place: [string, HomePlace[]];
}
