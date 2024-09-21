import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { RootNavigator } from "@/navigation/RootNavigation";
import { AuthenticatedUserProvider } from "@/providers/AuthenticatedUserProvider";

const App = () => {
  return (
    <AuthenticatedUserProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
  );
};

export default App;
