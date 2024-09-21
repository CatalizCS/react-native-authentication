import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../config/theme';

interface FormErrorMessageProps {
  error?: string;
  visible?: boolean;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ error, visible }) => {
  if (!visible || !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  errorText: {
    color: Colors.red,
    fontSize: 14,
  },
});

export default FormErrorMessage;
