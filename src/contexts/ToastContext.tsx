import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import colors from '../styles/colors';
import typography from '../styles/typography';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  type?: ToastType;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [message, setMessage] = useState<string>('');
  const [type, setType] = useState<ToastType>('info');
  const [visible, setVisible] = useState(false);
  const translateY = useState(new Animated.Value(80))[0];
  const opacity = useState(new Animated.Value(0))[0];

  const hide = useCallback(
    (delayMs: number) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 80,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start(() => setVisible(false));
      }, delayMs);
    },
    [opacity, translateY],
  );

  const showToast = useCallback(
    (msg: string, options?: ToastOptions) => {
      const {type: t = 'info', durationMs = 1800} = options ?? {};
      setMessage(msg);
      setType(t);
      setVisible(true);
      translateY.setValue(80);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      hide(durationMs);
    },
    [hide, opacity, translateY],
  );

  const value = useMemo(() => ({showToast}), [showToast]);

  const bgColor =
    type === 'success'
      ? colors.primary[500]
      : type === 'error'
      ? '#F04438'
      : colors.gray[800];

  return (
    <ToastContext.Provider value={value}>
      {children}
      {visible && (
        <View pointerEvents="none" style={styles.wrap}>
          <Animated.View
            style={[
              styles.toast,
              {backgroundColor: bgColor, opacity, transform: [{translateY}]},
            ]}>
            <Text style={styles.text}>{message}</Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
  toast: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '90%',
  },
  text: {
    ...typography.bodyMd,
    color: colors.white,
  },
});
