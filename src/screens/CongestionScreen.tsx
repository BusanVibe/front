import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CongestionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>혼잡도 화면</Text>
    </View>
  );
};

export default CongestionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
});
