export interface FestivalListItem {
  festival_id: number;
  name: string;
  img?: string;
  start_date: string;
  end_date: string;
  region: string;
  is_like: boolean;
}

export interface FestivalDetail {
  id: number;
  name: string;
  like_count: number;
  start_date: string;
  end_date: string;
  region: string;
  phone: string;
  fee: number;
  introduce: string;  
  img?: string;
  is_like: boolean;
  website?: string;
}

export interface FestivalListResult {
  festival_list: FestivalListItem[];
}
