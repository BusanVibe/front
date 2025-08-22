import {PlaceListItem, PlaceType} from '../types/place';

// 추천 명소 리스트 데이터
export const suggestAttractionData: PlaceListItem[] = [
  {
    place_id: 1,
    name: '광안리 해수욕장',
    type: PlaceType.SIGHT,
    congestion_level: 4,
    is_like: false,
    address: '부산 수영구 광안해변로',
  },
  {
    place_id: 2,
    name: '워킹홀리데이',
    type: PlaceType.CAFE,
    congestion_level: 3,
    is_like: true,
    address: '부산 수영구 광안해변로',
  },
  {
    place_id: 3,
    name: '광안리 해수욕장',
    type: PlaceType.SIGHT,
    congestion_level: 2,
    is_like: false,
    address: '부산 수영구 광안해변로',
  },
  {
    place_id: 4,
    name: '워킹홀리데이',
    type: PlaceType.CAFE,
    congestion_level: 1,
    is_like: true,
    address: '부산 수영구 광안해변로',
  },
];

