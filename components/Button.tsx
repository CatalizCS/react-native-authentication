// components/Button.tsx
import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { ThemeContext } from "@/providers/ThemeProvider";

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, style }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity style={[styles(theme).button, style]} onPress={onPress}>
      <Text style={styles(theme).buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },
    buttonText: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "bold",
    },
  });

export default Button;
