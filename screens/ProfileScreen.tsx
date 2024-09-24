import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import CustomTextInput from "../components/TextInput";
import Button from "../components/Button";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ThemeContext } from "@/providers/ThemeProvider";
import { darkTheme } from "@/config/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load profile data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid!));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(auth.currentUser?.email || "");
          setName(userData?.name || "");
          setAddress(userData?.address || "");
          setAvatar(userData?.avatar || null);
          setIsAnonymous(userData?.isAnonymous || false);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle avatar selection
  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", auth.currentUser?.uid!);
      await setDoc(
        userDocRef,
        {
          email,
          name,
          address,
          avatar,
          isAnonymous,
        },
        { merge: true }
      );

      await AsyncStorage.setItem("isAnonymous", isAnonymous.toString());
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Edit Profile</Text>

      {/* Avatar Picker */}
      <TouchableOpacity
        onPress={pickAvatar}
        style={styles(theme).avatarContainer}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles(theme).avatar} />
        ) : (
          <View style={styles(theme).placeholderAvatar}>
            <Text style={styles(theme).avatarText}>Pick Avatar</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Editable Fields */}
      <CustomTextInput
        label="Email"
        placeholder="Enter your email"
        isSecureTextEntry={false}
        value={email}
        onChangeText={setEmail}
      />

      <CustomTextInput
        label="Name"
        placeholder="Enter your name"
        isSecureTextEntry={false}
        value={name}
        onChangeText={setName}
      />
      <CustomTextInput
        label="Address"
        placeholder="Enter your address"
        isSecureTextEntry={false}
        value={address}
        onChangeText={setAddress}
      />

      {/* Anonymous Toggle */}
      <View style={styles(theme).anonymousContainer}>
        <Text style={styles(theme).anonymousLabel}>Chat Anonymously</Text>
        <Switch
          value={isAnonymous}
          onValueChange={(value) => setIsAnonymous(value)}
        />
      </View>

      {/* Dark Mode Toggle */}
      <View style={styles(theme).toggleContainer}>
        <Text style={styles(theme).toggleLabel}>Dark Mode</Text>
        <Switch value={theme === darkTheme} onValueChange={toggleTheme} />
      </View>

      {/* Save Button */}
      <Button
        title={isLoading ? "Saving..." : "Save Profile"}
        onPress={handleSaveProfile}
      />

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={() => {
          if (Platform.OS == "web") {
            auth.signOut();
          } else {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Logout",
                onPress: () => auth.signOut(),
              },
            ]);
          }
        }}
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
    avatarContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    placeholderAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.gray,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: theme.text,
    },
    anonymousContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 20,
    },
    anonymousLabel: {
      fontSize: 16,
      color: theme.text,
    },
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 20,
    },
    toggleLabel: {
      fontSize: 16,
      color: theme.text,
    },
    secondaryButton: {
      backgroundColor: theme.secondary,
    },
  });

export default ProfileScreen;
