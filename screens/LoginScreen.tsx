import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import CustomTextInput from "@/components/TextInput";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FromErrorMessage";
import { auth } from "@/config/firebase";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { FirebaseError } from "firebase/app";
import { ThemeContext } from "@/providers/ThemeProvider";
import GoogleLogin from "@/login/GoogleLogin";
import FacebookLogin from "@/login/FacebookLogin";
import { signInWithEmailAndPassword } from "firebase/auth";

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
      {/* add text "more options" */}
      <Text style={{ textAlign: "center", marginTop: 20 }}>Or</Text>
      {/* Google Sign In */}
      <GoogleLogin />
      {/* Facebook Sign In */}
      <FacebookLogin />

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
