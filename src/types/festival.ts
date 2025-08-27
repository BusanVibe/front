export interface FestivalListItem {
  id: number;
  name: string;
  img?: string;
  start_date: string;
  end_date: string;
  is_like: boolean;
  like_amount: number;
  address: string;
}

export interface FestivalDetail {
  id: number;
  name: string;
  like_amount: number;
  start_date: string;
  end_date: string;
  address: string;
  phone: string;
  fee: string;
  introduce: string;
  img?: [string, string[]];
  is_like: boolean;
  site_url?: string;
}

export interface FestivalDetailResult {
  "@class": string;
  id: number;
  img: [string, string[]];
  name: string;
  like_amount: number;
  is_like: boolean;
  start_date: string;
  end_date: string;
  address: string;
  phone: string;
  fee: string;
  site_url: string;
  introduce: string;
}

export interface FestivalListResult {
  "@class": string;
  festival_list: [string, FestivalListItem[]];
}

export enum FestivalSortType {
  DEFAULT = 'DEFAULT',
  POPULAR = 'POPULAR',
  LIKE = 'LIKE',
  START = 'START',
  END = 'END',
}

export enum FestivalStatusType {
  ALL = 'ALL',
  IN_PROGRESS = 'IN_PROGRESS',
  UPCOMING = 'UPCOMING',
  COMPLETE = 'COMPLETE',
  UNKNOWN = 'UNKNOWN',
}

export interface FestivalListParams {
  sort?: FestivalSortType;
  status?: FestivalStatusType;
}
