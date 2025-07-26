import { TextStyle } from 'react-native';

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
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 20 * 1.2,
  },
  headingLg: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 18 * 1.2,
  },
  headingMd: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 16 * 1.2,
  },
  subHeadingLg: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 18 * 1.2,
  },
  subHeadingMd: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 16 * 1.2,
  },
  subHeadingSm: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 14 * 1.2,
  },
  bodyLg: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 14 * 1.0,
  },
  bodyMd: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 12 * 1.0,
  },
  bodySm: {
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 10 * 1.0,
  },
  captionLg: {
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 12 * 1.0,
  },
  captionMd: {
    fontSize: 8,
    fontWeight: '300',
    lineHeight: 8 * 1.0,
  },
};

export default typography;
