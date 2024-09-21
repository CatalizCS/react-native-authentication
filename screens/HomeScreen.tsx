import React from "react";
import { View, Text, Button } from "react-native";

import { NavigationProp } from "@react-navigation/native";

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View>
      <Text>Welcome to the Home Screen!</Text>
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate("Profile")}
      />
    </View>
  );
};

export default HomeScreen;
