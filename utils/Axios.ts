import { firebaseConfig } from "@/config/firebase";
import axios from "axios";
import { auth } from "@/config/firebase";

const Axios = axios.create({
  baseURL: `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

Axios.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error(error);
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

export default Axios;
