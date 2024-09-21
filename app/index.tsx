// App.tsx
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigation';
import { AuthenticatedUserProvider } from '@/providers/AuthenticatedUserProvider';

const App = () => {
  return (
    <AuthenticatedUserProvider>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
  );
};

export default App;
