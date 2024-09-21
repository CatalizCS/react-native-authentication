import React, { useContext } from "react";
import { View, TextInput as RNTextInput, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeContext } from "@/providers/ThemeProvider";
import { useTogglePasswordVisibility } from "../hooks/useTogglePasswordVisibility";

interface CustomTextInputProps {
  label?: string;
  leftIconName?: keyof typeof MaterialIcons.glyphMap;
  isSecureTextEntry?: boolean;
  [key: string]: any;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  leftIconName,
  isSecureTextEntry,
  ...otherProps
}) => {
  const { passwordVisibility, handlePasswordVisibility, rightIcon } =
    useTogglePasswordVisibility();
  const { theme } = useContext(ThemeContext);

  return (
    <View style={styles(theme).container}>
      {label && <Text style={styles(theme).label}>{label}</Text>}
      <View style={styles(theme).inputContainer}>
        {leftIconName && (
          <MaterialIcons name={leftIconName} size={24} color={theme.primary} />
        )}
        <RNTextInput
          style={styles(theme).input}
          placeholderTextColor={theme.gray}
          secureTextEntry={!isSecureTextEntry ? false : passwordVisibility}
          {...otherProps}
        />
        {isSecureTextEntry && (
          <MaterialIcons
            name={rightIcon as keyof typeof MaterialIcons.glyphMap}
            size={24}
            color={theme.primary}
            onLongPress={handlePasswordVisibility}
            onPress={handlePasswordVisibility}
          />
        )}
      </View>
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 10,
    },
    label: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 5,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.lightGray,
      borderRadius: 8,
      padding: 10,
    },
    input: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: theme.text,
    },
  });

export default CustomTextInput;
