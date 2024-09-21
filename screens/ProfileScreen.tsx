// screens/ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomTextInput from "@/components/TextInput";
import Button from "@/components/Button";
import * as ImagePicker from "expo-image-picker";
import { auth } from "@/config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Colors } from "@/config/theme";

const ProfileScreen = () => {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [email, setEmail] = useState<string>(auth.currentUser?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  // Load profile data from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid!));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData?.name || "");
          setAddress(userData?.address || "");
          setAvatar(userData?.avatar || null);
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
      let avatarUrl = avatar;
      const storage = getStorage();

      // If a new avatar is selected, upload to Firebase Storage
      if (avatar && avatar.startsWith("file://")) {
        const response = await fetch(avatar);
        const blob = await response.blob();
        const avatarRef = ref(storage, `avatars/${auth.currentUser?.uid}`);
        await uploadBytes(avatarRef, blob);
        avatarUrl = await getDownloadURL(avatarRef); // Get the download URL
      }

      // Save profile details in Firestore
      const userDocRef = doc(db, "users", auth.currentUser?.uid!);
      await setDoc(
        userDocRef,
        {
          name,
          address,
          avatar: avatarUrl,
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Avatar Picker */}
      <TouchableOpacity onPress={pickAvatar} style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.avatarText}>Pick Avatar</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Editable Fields */}
      <CustomTextInput
        label="Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <CustomTextInput label="Email" value={email} editable={false} />
      <CustomTextInput
        label="Address"
        placeholder="Enter your address"
        value={address}
        onChangeText={setAddress}
      />

      {/* Save Button */}
      <Button
        title={isLoading ? "Saving..." : "Save Profile"}
        onPress={handleSaveProfile}
      />

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={() =>
          Alert.alert("Logout", "Are you sure you want to logout?", [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Logout",
              onPress: () => auth.signOut(),
            },
          ])
        }
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
    backgroundColor: Colors.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
  },
  secondaryButton: {
    marginTop: 10,
  },
});

export default ProfileScreen;
