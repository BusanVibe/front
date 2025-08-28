import {PlaceListItem, PlaceType} from '../types/place';

// 큐레이션 데이터
export const curationData = [
  {
    id: '225',
    title: '다대포 해수욕장 부산 바다 축제 ',
    period: '2025.08.18 ~ 2025.08.18',
    image:
      'https://www.visitbusan.net/uploadImgs/files/cntnts/20191213191711585_thumbL',
  },
  {
    id: '322',
    title: '가야공원 - 도심 속 지친 마음의 짧은 쉼을 허락하는 공원',
    time: '연중무휴',
    image: 'http://tong.visitkorea.or.kr/cms/resource/10/3495510_image3_1.jpg',
  },
  {
    id: '251',
    title: '부산 국제 영화제',
    period: '2025.08.18 ~ 2025.08.18',
    image:
      'https://www.visitbusan.net/uploadImgs/files/cntnts/20200110131702589_thumbL',
  },
];

// 좋아요 목록 데이터 (정렬 기능 테스트용)
export const favoriteData: PlaceListItem[] = [
  {
    place_id: 1,
    name: '광안리 해수욕장',
    type: PlaceType.SIGHT,
    congestion_level: 4,
    is_like: true,
    address: '부산 수영구 광안해변로',
    img: 'https://picsum.photos/80/80?random=1',
  },
  {
    place_id: 2,
    name: '광안리 M(Marvelous) 드론 라이트쇼',
    type: PlaceType.SIGHT,
    congestion_level: 0,
    is_like: true,
    address: '광안리해변 일원',
    img: 'https://picsum.photos/80/80?random=2',
  },
  {
    place_id: 3,
    name: '워킹홀리데이',
    type: PlaceType.CAFE,
    congestion_level: 3,
    is_like: true,
    address: '부산 수영구 광안해변로',
    img: 'https://picsum.photos/80/80?random=3',
  },
  {
    place_id: 4,
    name: '해운대 해수욕장',
    type: PlaceType.SIGHT,
    congestion_level: 2,
    is_like: true,
    address: '부산 해운대구 해운대해변로',
    img: 'https://picsum.photos/80/80?random=4',
  },
  {
    place_id: 5,
    name: '부산타워',
    type: PlaceType.SIGHT,
    congestion_level: 1,
    is_like: true,
    address: '부산 중구 용두산길',
    img: 'https://picsum.photos/80/80?random=5',
  },
  {
    place_id: 6,
    name: '감천문화마을',
    type: PlaceType.SIGHT,
    congestion_level: 3,
    is_like: true,
    address: '부산 사하구 감내2로',
    img: 'https://picsum.photos/80/80?random=6',
  },
];
