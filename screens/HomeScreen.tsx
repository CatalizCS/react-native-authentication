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
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Keyboard,
  KeyboardEvent,
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
import { BlurView } from "expo-blur";
import Button from "@/components/Button";
import { ThemeContext } from "@/providers/ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";

interface Message {
  id: string;
  userId: string;
  name: string;
  message: string;
  imageUrl?: string;
  avatar: string;
  timestamp: any;
}

const HomeScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);
  const flatListRef = useRef<FlatList>(null);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [inputAnim] = useState(new Animated.Value(0));

  const inputContainerStyle = {
    ...styles.inputContainer,
    transform: [
      {
        translateY: inputAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -100], // Adjust the offset as needed
        }),
      },
    ],
  };

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

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    flatListRef.current?.scrollToEnd({ animated: true });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event: KeyboardEvent) => {
        Animated.timing(inputAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        Animated.timing(inputAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
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
    setImage(null);
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

  // Handle image zoom click
  const handleZoomImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageZoomed(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chat</Text>
        </View>

        {/* Message List with fade-in animation */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.messageContainer}>
                {item.userId !== auth.currentUser?.uid && (
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                )}
                <View
                  style={
                    item.userId === auth.currentUser?.uid
                      ? styles.myMessage
                      : styles.receivedMessage
                  }
                >
                  <Text style={styles.messageName}>{item.name}</Text>
                  <Text style={styles.messageText}>{item.message}</Text>
                  {item.imageUrl && (
                    <TouchableOpacity
                      onPress={() => handleZoomImage(item.imageUrl)}
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.chatImage}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            ref={flatListRef}
            style={styles.chatList}
            contentContainerStyle={{ paddingBottom: 80 }}
          />
        </Animated.View>
      </ScrollView>

      {/* New Message Input with slide up animation */}
      <Animated.View style={inputContainerStyle}>
        <TextInput
          style={styles.input}
          placeholder="Enter your message"
          value={newMessage}
          onChangeText={setNewMessage}
          onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <MaterialIcons name="image" size={24} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <MaterialIcons name="send" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Image Preview and Remove Button */}
      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <Button
            title="Remove"
            onPress={handleRemoveImage}
            style={styles.removeButton}
          />
        </View>
      )}

      {/* Modal for Zoomed Image */}
      {selectedImage && (
        <Modal
          visible={isImageZoomed}
          transparent={true}
          onRequestClose={() => setIsImageZoomed(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPressOut={() => setIsImageZoomed(false)}
          >
            <BlurView intensity={50} style={styles.blurBackground} />
            <Image source={{ uri: selectedImage }} style={styles.zoomedImage} />
          </TouchableOpacity>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  chatList: {
    flex: 1,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  myMessage: {
    backgroundColor: "#007aff",
    borderRadius: 20,
    padding: 10,
    maxWidth: "75%",
    alignSelf: "flex-end",
    marginLeft: "auto",
    marginBottom: 10,
    color: "white",
  },
  receivedMessage: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    padding: 10,
    maxWidth: "75%",
    marginBottom: 10,
  },
  messageName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  messageText: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007aff",
    borderRadius: 20,
    padding: 10,
  },
  imagePicker: {
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
    borderRadius: 10,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: "#d9534f",
    borderRadius: 10,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  zoomedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 10,
  },
  chatImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
});

export default HomeScreen;
