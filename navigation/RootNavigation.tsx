// navigation/RootNavigator.tsx
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { auth } from "@/config/firebase";
import { User } from "firebase/auth";

export const RootNavigator = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer independent={true}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
