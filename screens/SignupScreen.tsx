import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import CustomTextInput from "@/components/TextInput";
import Button from "@/components/Button";
import FormErrorMessage from "@/components/FromErrorMessage";
import { Colors } from "@/config/theme";
import { auth } from "@/config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/types/RootStackParmaList";

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

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate("Login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
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
      <Button title="Sign Up" onPress={handleSignup} />
      <Button
        title="Login"
        onPress={() => navigation.navigate("Login")}
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
});

export default SignupScreen;
