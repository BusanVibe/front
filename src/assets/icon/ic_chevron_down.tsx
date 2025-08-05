import React from 'react';
import {SvgProps} from 'react-native-svg';
import Svg, {Path} from 'react-native-svg';

interface ChevronDownProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: string | number;
}

const ChevronDown: React.FC<ChevronDownProps> = ({
  width = 16,
  height = 16,
  color = '#2E2E2E',
  strokeWidth = '1.5',
  ...props
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      {...props}>
      <Path
        d="M4 6L8 10L12 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronDown;
