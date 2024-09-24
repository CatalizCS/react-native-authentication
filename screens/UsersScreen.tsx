import React, { useEffect, useState } from "react";
import { User } from "@/types/User";
import FetchUser from "@/backend/FetchUser";
import handleError from "@/utils/handleError";
import UpdateUser from "@/backend/UpdateUser";
import AddUser from "@/backend/AddUser";
import DeleteUser from "@/backend/DeleteUser";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AlertBox from "@/components/AlertBox";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User>();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      age: 0,
    },
    onSubmit: async (values) => {
      const userToSave: User = {
        id: editingUser ? selectedUser?.id ?? "" : "",
        name: values.name,
        email: values.email,
        age: values.age,
        createdAt: editingUser
          ? selectedUser?.createdAt ?? new Date()
          : new Date(),
        updatedAt: new Date(),
      };
      await handleSave(userToSave);
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Must be 2 characters or more")
        .max(15, "Must be 15 characters or less")
        .required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
      age: Yup.number()
        .min(1, "Must be at least 1")
        .max(99, "Must be at most 99"),
    }),
  });

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => handleDelete(id),
        },
      ],
      { cancelable: true }
    );
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await FetchUser();
      if (users) {
        setUsers(users);
      } else {
        setUsers([]);
      }
    } catch (err: unknown) {
      handleError(err as Error, setError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (user: User) => {
    try {
      if (editingUser) {
        await UpdateUser(user);
      } else {
        await AddUser(user);
      }
      setEditingUser(false);
      formik.resetForm();
      fetchUsers();
    } catch (err: unknown) {
      handleError(err as Error, setError);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DeleteUser(id);
      fetchUsers();
    } catch (err: unknown) {
      handleError(err as Error, setError);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(true);
    setSelectedUser(user);
    formik.setValues({ name: user.name, email: user.email, age: user.age });
  };

  const handleNewUser = () => {
    setEditingUser(false);
    formik.resetForm(); // Clear form values when creating a new user
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>User Management</Text>

        {/* Form for adding/editing users */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingUser ? "Edit User" : "Add User"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            onChangeText={formik.handleChange("name")}
            onBlur={formik.handleBlur("name")}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name ? (
            <Text style={styles.error}>{formik.errors.name}</Text>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email ? (
            <Text style={styles.error}>{formik.errors.email}</Text>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Age"
            keyboardType="numeric"
            onChangeText={formik.handleChange("age")}
            onBlur={formik.handleBlur("age")}
            value={formik.values.age.toString()}
          />
          {formik.touched.age && formik.errors.age ? (
            <Text style={styles.error}>{formik.errors.age}</Text>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => formik.handleSubmit()}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {editingUser ? "Update User" : "Add User"}
              </Text>
            </TouchableOpacity>
            {editingUser && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleNewUser}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Display user list */}
        {error && <Text style={styles.error}>{error}</Text>}
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(user) => user.id}
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <Text>{item.name}</Text>
                <Text>{item.email}</Text>
                <Text>{item.age}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(item.id)} // Confirm delete before proceeding
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  userRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    marginRight: 10,
    padding: 5,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  deleteButton: {
    padding: 5,
    backgroundColor: "#F44336",
    borderRadius: 5,
  },
  editText: {
    color: "white",
  },
  deleteText: {
    color: "white",
  },
  error: {
    color: "red",
  },
});
