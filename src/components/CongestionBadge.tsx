import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';

interface CongestionBadgeProps {
  level: number; // 1: 여유, 2: 보통, 3: 약간혼잡, 4: 혼잡
  style?: any;
}

const CongestionBadge: React.FC<CongestionBadgeProps> = ({level, style}) => {
  const getBadgeConfig = (level: number) => {
    switch (level) {
      case 4:
        return {
          text: '혼잡',
          backgroundColor: colors.red[100],
          textColor: colors.red[500],
        };
      case 3:
        return {
          text: '약간혼잡',
          backgroundColor: colors.orange[100],
          textColor: colors.orange[500],
        };
      case 2:
        return {
          text: '보통',
          backgroundColor: colors.yellow[100],
          textColor: colors.yellow[500],
        };
      case 1:
        return {
          text: '여유',
          backgroundColor: colors.green[100],
          textColor: colors.green[500],
        };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig(level);

  if (!badgeConfig) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeConfig.backgroundColor,
        },
        style,
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: badgeConfig.textColor,
          },
        ]}>
        {badgeConfig.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    borderRadius: 1000,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.captionMd,
  },
});

export default CongestionBadge;
