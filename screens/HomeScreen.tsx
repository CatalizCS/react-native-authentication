import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { auth, db, storage } from "@/config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import Button from "@/components/Button";
import { ThemeContext } from "@/providers/ThemeProvider";

interface Message {
  id: string;
  userId: string;
  name: string;
  message: string;
  imageUrl?: string; // Optional image URL field
  avatar: string;
  timestamp: any;
}

const HomeScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);
  const flatListRef = useRef<FlatList>(null);

  const [profile, setProfile] = useState({
    name: "",
    avatar: "",
    isAnonymous: false,
  });

  // Fetch profile data of the current user
  useEffect(() => {
    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid!));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile({
          name: userData?.isAnonymous
            ? "Anonymous"
            : userData?.name || "Anonymous",
          avatar: userData?.isAnonymous
            ? "https://png.pngtree.com/png-vector/20200615/ourmid/pngtree-hacker-with-laptop-png-and-vector-element-png-image_2255480.jpg"
            : userData?.avatar ||
              "https://png.pngtree.com/png-vector/20200615/ourmid/pngtree-hacker-with-laptop-png-and-vector-element-png-image_2255480.jpg",
          isAnonymous: userData?.isAnonymous || false,
        });
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        return;
      }
      fetchProfile();
    });

    return () => unsubscribe();
  }, []);

  // Fetch messages in real-time from Firestore
  useEffect(() => {
    const messagesRef = collection(db, "chats");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, []);

  // Handle image upload
  const pickImage = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access media is required."
      );
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setImage(pickerResult.assets[0].uri);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImage(null); // Clear the selected image
  };

  // Handle message send with or without image
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !image) {
      return;
    }

    setIsLoading(true);

    let imageUrl = "";
    if (image) {
      const imageRef = ref(
        storage,
        `chats/${Date.now()}_${auth.currentUser?.uid}`
      );
      const img = await fetch(image);
      const bytes = await img.blob();

      await uploadBytes(imageRef, bytes);
      imageUrl = await getDownloadURL(imageRef);
      setImage(null);
    }

    try {
      await addDoc(collection(db, "chats"), {
        userId: auth.currentUser?.uid,
        name: profile.name,
        avatar: profile.avatar,
        message: newMessage,
        imageUrl,
        timestamp: new Date(),
      });
      setNewMessage("");
    } catch (error) {
      Alert.alert("Error", "Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles(theme).container}>
          <Text style={styles(theme).title}>Chat</Text>

          {/* Message List */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles(theme).messageContainer}>
                <Image
                  source={{ uri: item.avatar }}
                  style={styles(theme).avatar}
                />
                <View style={styles(theme).messageTextContainer}>
                  <Text style={styles(theme).messageName}>{item.name}</Text>
                  <Text style={styles(theme).messageText}>{item.message}</Text>
                  {item.imageUrl && (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles(theme).chatImage}
                    />
                  )}
                </View>
              </View>
            )}
            ref={flatListRef}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            style={styles(theme).chatList}
          />

          {/* New Message Input */}
          <View style={styles(theme).inputContainer}>
            <TextInput
              style={styles(theme).input}
              placeholder="Enter your message"
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <Button
              title="Pick Image"
              onPress={pickImage}
              style={styles(theme).imagePicker}
            />
            <Button
              title={isLoading ? "Sending..." : "Send"}
              onPress={handleSendMessage}
              style={styles(theme).sendButton}
            />
          </View>

          {/* Image Preview and Remove Button */}
          {image && (
            <View style={styles(theme).imagePreviewContainer}>
              <Image
                source={{ uri: image }}
                style={styles(theme).previewImage}
              />
              <Button
                title="Remove"
                onPress={handleRemoveImage}
                style={styles(theme).removeButton}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.black,
      marginBottom: 20,
      textAlign: "center",
    },
    chatList: {
      flex: 1,
    },
    messageContainer: {
      flexDirection: "row",
      padding: 10,
      backgroundColor: theme.lightGray,
      marginBottom: 10,
      borderRadius: 8,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    messageTextContainer: {
      flex: 1,
    },
    messageName: {
      fontWeight: "bold",
      color: theme.primary,
    },
    messageText: {
      color: theme.black,
    },
    chatImage: {
      width: 150,
      height: 150,
      borderRadius: 8,
      marginTop: 10,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      backgroundColor: theme.lightGray,
      borderRadius: 8,
      padding: 10,
    },
    input: {
      flex: 1,
      marginRight: 10,
      padding: 10,
      fontSize: 16,
      backgroundColor: theme.white,
      borderRadius: 8,
    },
    sendButton: {
      backgroundColor: theme.primary,
      color: theme.white,
    },
    imagePicker: {
      backgroundColor: theme.secondary,
      marginLeft: 10,
      marginRight: 10,
    },
    imagePreviewContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    previewImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
      marginRight: 10,
    },
    removeButton: {
      backgroundColor: theme.danger,
      padding: 5,
      borderRadius: 8,
    },
  });

export default HomeScreen;
