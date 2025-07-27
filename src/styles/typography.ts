import {TextStyle} from 'react-native';

type Variant =
  | 'title'
  | 'headingLg'
  | 'headingMd'
  | 'subHeadingLg'
  | 'subHeadingMd'
  | 'subHeadingSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'captionLg'
  | 'captionMd';

const typography: Record<Variant, TextStyle> = {
  title: {
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 20 * 1.2,
  },
  headingLg: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 18 * 1.2,
  },
  headingMd: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16 * 1.2,
  },
  subHeadingLg: {
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 18 * 1.2,
  },
  subHeadingMd: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 16 * 1.2,
  },
  subHeadingSm: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 14 * 1.2,
  },
  bodyLg: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 14 * 1.2,
  },
  bodyMd: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 12 * 1.2,
  },
  bodySm: {
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 10 * 1.2,
  },
  captionLg: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 12 * 1.2,
  },
  captionMd: {
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '300',
    lineHeight: 10 * 1.2,
  },
};

export default typography;
