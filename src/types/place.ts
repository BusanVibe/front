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

export interface PlaceDetailBase {
  id: number;
  name: string;
  type: PlaceType;
  img?: string;
  congestion_level: number;
  grade: number;
  review_amount: number;
  like_amount: number;
  is_open: boolean;
  address: string;
  phone: string;
}

export interface SightDetail extends PlaceDetailBase {
  type: PlaceType.SIGHT;
  introduce: string;
}

export interface RestaurantDetail extends PlaceDetailBase, WeeklyHours {
  type: PlaceType.RESTAURANT;
  review: Review[];
}

export interface CultureDetail extends PlaceDetailBase, WeeklyHours {
  type: PlaceType.CULTURE;
  review: Review[];
}

export type PlaceDetail = SightDetail | RestaurantDetail | CultureDetail;

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

export interface WeeklyHours {
  mon_open: string;
  tue_open: string;
  wed_open: string;
  thu_open: string;
  fri_open: string;
  sat_open: string;
  sun_open: string;
  mon_close: string;
  tue_close: string;
  wed_close: string;
  thu_close: string;
  fri_close: string;
  sat_close: string;
  sun_close: string;
}

export interface Review {
  id: number;
  user_img?: string;
  user_name: string;
  grade: number;
  date: string;
  content: string;
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
