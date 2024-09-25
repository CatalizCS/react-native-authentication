import React, { useEffect, useState } from "react";
import { Button, View, Text } from "react-native";
import { auth } from "@/config/firebase";
import * as Google from "expo-auth-session/providers/google";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

const googleClientId =
  "349972751789-21s8rcvdob44kjrdl8q1u14hkv18uetl.apps.googleusercontent.com";

const GoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientId,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;

      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then((userCredential) => {
          console.log("User signed in:", userCredential.user);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
        });
    }
  }, [response]);

  return (
    <View>
      <Button
        disabled={!request}
        title="Sign in with Google"
        onPress={() => {
          promptAsync();
        }}
      />
      {error && <Text>{error}</Text>}
    </View>
  );
};

export default GoogleSignIn;
