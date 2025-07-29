import {PlaceListItem, PlaceType} from '../types/place';

// 큐레이션 데이터
export const curationData = [
  {
    id: '1',
    title: '광안리 M(Marvelous) 드론 라이트쇼',
    period: '2022.04.02 ~ 2025.12.31',
    image: 'https://picsum.photos/400/360?random=1',
  },
  {
    id: '2',
    title: '해변의 낭만과 아름다운 자연 경관, 해운대 해수욕장',
    time: '매일 09:00 - 18:00',
    image: 'https://picsum.photos/400/360?random=2',
  },
  {
    id: '3',
    title: '부산의 대표 관광지와 맛집 투어',
    time: '매일 10:00 - 17:00',
    image: 'https://picsum.photos/400/360?random=3',
  },
];

// 명소 리스트 데이터
export const attractionData: PlaceListItem[] = [
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
