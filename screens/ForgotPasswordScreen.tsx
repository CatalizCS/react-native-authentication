// screens/ForgotPasswordScreen.tsx
import React, { useContext, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import CustomTextInput from "@/components/TextInput";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FromErrorMessage";
import { auth } from "@/config/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/types/RootStackParmaList";
import { ThemeContext } from "@/providers/ThemeProvider";

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPassword"
>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { theme } = useContext(ThemeContext);

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email has been sent!");
      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      setMessage("");
    }
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Reset Password</Text>

      <CustomTextInput
        label="Email"
        leftIconName="email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />

      <FormErrorMessage error={error} visible={!!error} />
      {message ? (
        <Text style={styles(theme).successMessage}>{message}</Text>
      ) : null}

      <Button title="Send Reset Email" onPress={handleResetPassword} />
      <Button
        title="Back to Login"
        onPress={() => navigation.navigate("Login")}
        style={styles(theme).secondaryButton}
      />
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.black,
      marginBottom: 20,
      textAlign: "center",
    },
    successMessage: {
      fontSize: 14,
      color: theme.primary,
      marginVertical: 10,
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
    },
  });

export default ForgotPasswordScreen;
