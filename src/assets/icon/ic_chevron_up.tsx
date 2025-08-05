import React from 'react';
import {SvgProps} from 'react-native-svg';
import Svg, {Path} from 'react-native-svg';

interface ChevronUpProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: string | number;
}

const ChevronUp: React.FC<ChevronUpProps> = ({
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
        d="M12 10L8 6L4 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ChevronUp;
