// components/Button.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '@/config/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Button;
