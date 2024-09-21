import React, { useState, createContext, useEffect, ReactNode } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthenticatedUserContext = createContext<AuthContextType | null>(
  null
);

interface AuthenticatedUserProviderProps {
  children: ReactNode;
}

import { User } from "firebase/auth";

export const AuthenticatedUserProvider = ({
  children,
}: AuthenticatedUserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
