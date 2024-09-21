import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import CustomTextInput from "@/components/TextInput";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FromErrorMessage";
import { Colors } from "@/config/theme";
import { auth } from "@/config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types"; // Adjust the import based on your project structure

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

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err instanceof Error) {
        const firebaseError = err as unknown as String;
        console.log(firebaseError);
        switch (firebaseError) {
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
      <FormErrorMessage error={error} visible={!!error} />
      {/* add forgot password */}
      <Text
        style={styles.forgotPassword}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        Forgot Password?
      </Text>
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate("Signup")}
        style={styles.secondaryButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 20,
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  forgotPassword: {
    textAlign: "right",
    color: Colors.primary,
    marginBottom: 10,
  },
});

export default LoginScreen;
