import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import CustomTextInput from "@/components/TextInput";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FromErrorMessage";
import { auth } from "@/config/firebase";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import * as Google from "expo-auth-session/providers/google";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { FirebaseError } from "firebase/app";
import { ThemeContext } from "@/providers/ThemeProvider";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { theme } = useContext(ThemeContext);

  // Google Auth Session
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "349972751789-21s8rcvdob44kjrdl8q1u14hkv18uetl.apps.googleusercontent.com",
    iosClientId:
      "349972751789-06sbjoigouol4ms2ombps89d3ik7k9q0.apps.googleusercontent.com",
    androidClientId:
      "349972751789-21s8rcvdob44kjrdl8q1u14hkv18uetl.apps.googleusercontent.com ",
    redirectUri: "https://react-native-college.firebaseapp.com/__/auth/handler",
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === "success" && result.authentication) {
        const { idToken } = result.authentication;
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithPopup(auth, credential);
      } else {
        setError("An unknown error occurred");
      }
    } catch (err) {
      setError("An unknown error occurred");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/user-not-found":
            setError("No user found with this email");
            break;
          case "auth/wrong-password":
            setError("Invalid password");
            break;
          case "auth/invalid-email":
            setError("Invalid email address");
            break;
          default:
            setError(err.message);
        }
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  // Handle response from Google authentication
  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleLogin();
    }
  }, [response]);

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Login</Text>
      <CustomTextInput
        label="Email"
        leftIconName="email"
        isSecureTextEntry={false}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      <CustomTextInput
        label="Password"
        leftIconName="lock"
        isSecureTextEntry={true}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />
      <FormErrorMessage error={error} visible={!!error} />

      {/* Add Forgot Password */}
      <Text
        style={styles(theme).forgotPassword}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        Forgot Password?
      </Text>

      <Button title="Login" onPress={handleLogin} />

      {/* Google Sign In */}
      <Button
        title="Sign in with Google"
        onPress={handleGoogleLogin}
        style={styles(theme).socialButton}
      />

      {/* Sign Up Button */}
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate("Signup")}
        style={styles(theme).secondaryButton}
      />
    </View>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
    },
    forgotPassword: {
      textAlign: "right",
      color: theme.primary,
      marginBottom: 10,
    },
    socialButton: {
      backgroundColor: theme.socialButtonBackground,
      color: theme.white,
      marginTop: 10,
    },
  });

export default LoginScreen;
