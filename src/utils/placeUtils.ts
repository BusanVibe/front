import {PlaceType} from '../types/place';

/**
 * PlaceType enum을 한글 텍스트로 변환하는 함수
 * @param type PlaceType enum 값
 * @returns 한글로 변환된 장소 타입 문자열
 */
export const getPlaceTypeText = (type: PlaceType): string => {
  switch (type) {
    case PlaceType.SIGHT:
      return '관광명소';
    case PlaceType.RESTAURANT:
      return '맛집/카페';
    case PlaceType.CULTURE:
      return '문화시설';
    default:
      return '기타';
  }
};
