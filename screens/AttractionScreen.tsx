import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AttractionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>명소 화면</Text>
    </View>
  );
};

export default AttractionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20 },
});
