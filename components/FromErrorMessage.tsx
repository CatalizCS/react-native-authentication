import { ThemeContext } from "@/providers/ThemeProvider";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

interface FormErrorMessageProps {
  error?: string;
  visible?: boolean;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  error,
  visible,
}) => {
  const { theme } = useContext(ThemeContext);

  if (!visible || !error) {
    return null;
  }

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).errorText}>{error}</Text>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 5,
    },
    errorText: {
      color: theme.red,
      fontSize: 14,
    },
  });

export default FormErrorMessage;
