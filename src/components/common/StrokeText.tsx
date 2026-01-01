import React from 'react';
import {View, Text, StyleSheet, TextStyle} from 'react-native';

type StrokeTextProps = {
  children: React.ReactNode;
  style?: TextStyle | (TextStyle | undefined)[];
  strokeColor?: string;
  strokeWidth?: number; // in px
};

/**
 * Renders text with a pseudo stroke by layering multiple Text elements around it.
 * Keeps the original text color; only the outline uses strokeColor.
 */
const StrokeText: React.FC<StrokeTextProps> = ({
  children,
  style,
  strokeColor = '#000',
  strokeWidth = 1,
}) => {
  const offsets = [
    {x: -strokeWidth, y: 0},
    {x: strokeWidth, y: 0},
    {x: 0, y: -strokeWidth},
    {x: 0, y: strokeWidth},
    {x: -strokeWidth, y: -strokeWidth},
    {x: -strokeWidth, y: strokeWidth},
    {x: strokeWidth, y: -strokeWidth},
    {x: strokeWidth, y: strokeWidth},
  ];

  return (
    <View style={styles.container}>
      {offsets.map((o, idx) => (
        <Text
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          style={[
            style as any,
            styles.strokeLayer,
            {left: o.x, top: o.y, color: strokeColor},
          ]}>
          {children}
        </Text>
      ))}
      <Text style={style as any}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strokeLayer: {
    position: 'absolute',
  },
});

export default StrokeText;
