import React, { useEffect, useState } from "react";
import { Button, View, Text } from "react-native";
import { auth } from "@/config/firebase";
import * as Facebook from "expo-auth-session/providers/facebook";
import { signInWithCredential, FacebookAuthProvider } from "firebase/auth";
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

const facebookClientId = "1603817666875455";

const FacebookSignIn = () => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: facebookClientId,
    scopes: ["email", "public_profile"],
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;

      const credential = FacebookAuthProvider.credential(access_token);

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
        title="Sign in with Facebook"
        onPress={() => {
          promptAsync();
        }}
      />
      {error && <Text>{error}</Text>}
    </View>
  );
};

export default FacebookSignIn;