import React, { createContext, useState, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { Client } from "@/types/client";

interface DataContextProps {
  clients: Client[];
  fetchClients: () => void;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/clients`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        Alert.alert("Error", "Failed to fetch clients.");
        return;
      }

      const clientsData = await response.json();
      setClients(clientsData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch clients.");
    }
  };

  return (
    <DataContext.Provider value={{ clients, fetchClients, setClients }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = (): DataContextProps => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

export default DataProvider;
