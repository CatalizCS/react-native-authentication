import React, { useContext, useState } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import CustomTextInput from "@/components/TextInput";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FromErrorMessage";
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/types/RootStackParmaList";
import { ThemeContext } from "@/providers/ThemeProvider";
import { FirebaseError } from "firebase/app";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";

type SignupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Signup"
>;

interface Props {
  navigation: SignupScreenNavigationProp;
}

const SignupScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully");
      navigation.navigate("Login");
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
            setError("Email already in use");
            break;
          case "auth/invalid-email":
            setError("Invalid email address");
            break;
          case "auth/missing-email":
            setError("Email is required");
            break;
          case "auth/missing-password":
            setError("Password is required");
            break;
          case "auth/weak-password":
            setError("Password is too weak");
            break;
          default:
            setError(err.message);
        }
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Sign Up</Text>
      <CustomTextInput
        label="Email"
        leftIconName="email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <CustomTextInput
        label="Password"
        leftIconName="lock"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <PasswordStrengthMeter password={password} />
      <FormErrorMessage error={error} visible={!!error} />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button
        title="Login"
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
    secondaryButton: {
      backgroundColor: theme.secondary,
    },
  });

export default SignupScreen;
