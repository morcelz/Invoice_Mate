import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDataContext } from "@/contexts/data-context";
const countries = [
  { label: "Tunisia", value: "Tunisia" },
  { label: "France", value: "France" },
  { label: "Germany", value: "Germany" },
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Canada", value: "Canada" },
  { label: "Italy", value: "Italy" },
  { label: "Spain", value: "Spain" },
  { label: "Japan", value: "Japan" },
  { label: "China", value: "China" },
  { label: "India", value: "India" },
  { label: "Brazil", value: "Brazil" },
  { label: "Australia", value: "Australia" },
  { label: "South Korea", value: "South Korea" },
  { label: "Russia", value: "Russia" },
  { label: "Mexico", value: "Mexico" },
  { label: "South Africa", value: "South Africa" },
  { label: "Egypt", value: "Egypt" },
  { label: "Turkey", value: "Turkey" },
  { label: "Saudi Arabia", value: "Saudi Arabia" },
];

export default function Clients() {
  const { clients, fetchClients, setClients } = useDataContext();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newClient, setNewClient] = useState({
    company_name: "",
    fisical_code: "",
    address: "",
    zip_code: "",
    country: "Tunisia",
    phone: "",
    email: "",
  });
  const [editingClient, setEditingClient] = useState<{
    id: string;
    company_name: string;
    fisical_code: string;
    address: string;
    zip_code: string;
    country: string;
    phone: string;
    email: string;
    isExpanded: boolean;
  }>({
    id: "",
    company_name: "",
    fisical_code: "",
    address: "",
    zip_code: "",
    country: "Tunisia",
    phone: "",
    email: "",
    isExpanded: false,
  });

  const openAddClientModal = () => {
    setIsAddModalVisible(true);
  };

  const closeAddClientModal = () => {
    setIsAddModalVisible(false);
    setNewClient({
      company_name: "",
      fisical_code: "",
      address: "",
      zip_code: "",
      country: "",
      phone: "",
      email: "",
    });
  };

  const handleAddClient = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "No authentication token found.");
        return;
      }
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/clients`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newClient),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Server Error:", errorResponse);
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }

      const newClientData = await response.json();

      setClients([...clients, newClientData]);
    } catch (error) {
      Alert.alert("Error", error?.toString());
    } finally {
      closeAddClientModal();
    }
  };

  const openEditClientModal = (client: (typeof clients)[0]) => {
    setEditingClient(client);
    setNewClient({
      company_name: client.company_name,
      fisical_code: client.fisical_code,
      address: client.address,
      zip_code: client.zip_code,
      country: client.country,
      phone: client.phone,
      email: client.email,
    });
    setIsEditModalVisible(true);
  };

  const closeEditClientModal = () => {
    setIsEditModalVisible(false);
    setEditingClient({
      id: "",
      company_name: "",
      fisical_code: "",
      address: "",
      zip_code: "",
      country: "",
      phone: "",
      email: "",
      isExpanded: false,
    });
    setNewClient({
      company_name: "",
      fisical_code: "",
      address: "",
      zip_code: "",
      country: "Tunisia",
      phone: "",
      email: "",
    });
  };

  const handleEditClient = async () => {
    try {
      if (!editingClient?.id) {
        return;
      }

      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/clients/${editingClient.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingClient),
        }
      );

      if (!response.ok) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }

      const newClientData = await response.json();
      setClients([
        ...clients.filter((client) => client.id !== editingClient.id),
        newClientData.client,
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to edit a client.");
    } finally {
      closeEditClientModal();
    }
  };

  const handleDeleteClient = async (id: string) => {
    Alert.alert(
      "Delete Client",
      "Are you sure you want to delete this client?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/clients/${id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (!response.ok) {
                Alert.alert("Error", "Failed to delete the client.");
                return;
              }
              setClients(clients.filter((client) => client.id !== id));
            } catch (error) {
              Alert.alert(
                "Error",
                "Something went wrong while deleting the client."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  const toggleAccordion = (id: string) => {
    setClients(
      clients.map((client) =>
        client.id === id
          ? { ...client, isExpanded: !client.isExpanded }
          : client
      )
    );
  };
  useEffect(() => {
    fetchClients();
  }, []);

  const renderClientItem = ({ item }: { item: (typeof clients)[0] }) => (
    <View style={styles.clientItem}>
      <TouchableOpacity
        onPress={() => toggleAccordion(item.id)}
        style={styles.clientHeader}
      >
        <Text style={styles.clientName}> {item.company_name}</Text>
        <Ionicons
          name={item.isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="tomato"
        />
      </TouchableOpacity>
      {item.isExpanded && (
        <View style={styles.clientDetails}>
          <Text>Fiscal Code: {item.fisical_code || "N/A"}</Text>
          <Text>address: {item.address}</Text>
          <Text>zip_code: {item.zip_code}</Text>
          <Text>Country: {item.country}</Text>
          <Text>Phone: {item.phone}</Text>
          <Text>Email: {item.email || "N/A"}</Text>
          <Text>ID For invoice: {item.id}</Text>
          <View style={styles.clientActions}>
            <TouchableOpacity
              onPress={() => openEditClientModal(item)}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="#007BFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteClient(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <TouchableOpacity onPress={openAddClientModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="tomato" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={clients}
        renderItem={renderClientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No clients added yet.</Text>
          </View>
        }
      />

      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Client</Text>
            <TextInput
              placeholder="Company/Name *"
              style={styles.underlinedInput}
              value={newClient.company_name}
              onChangeText={(text) =>
                setNewClient({ ...newClient, company_name: text })
              }
            />
            <TextInput
              placeholder="Fiscal Code"
              style={styles.underlinedInput}
              value={newClient.fisical_code}
              onChangeText={(text) =>
                setNewClient({ ...newClient, fisical_code: text })
              }
            />
            <TextInput
              placeholder="address *"
              style={styles.underlinedInput}
              value={newClient.address}
              onChangeText={(text) =>
                setNewClient({ ...newClient, address: text })
              }
            />
            <TextInput
              placeholder="zip_code *"
              style={styles.underlinedInput}
              value={newClient.zip_code}
              onChangeText={(text) =>
                setNewClient({ ...newClient, zip_code: text })
              }
            />
            <Picker
              selectedValue={newClient.country}
              onValueChange={(itemValue) =>
                setNewClient({ ...newClient, country: itemValue })
              }
              style={styles.picker}
            >
              {countries.map((country) => (
                <Picker.Item
                  key={country.value}
                  label={country.label}
                  value={country.value}
                />
              ))}
            </Picker>
            <TextInput
              placeholder="Phone *"
              style={styles.underlinedInput}
              value={newClient.phone}
              onChangeText={(text) =>
                setNewClient({ ...newClient, phone: text })
              }
            />
            <TextInput
              placeholder="Email"
              style={styles.underlinedInput}
              value={newClient.email}
              onChangeText={(text) =>
                setNewClient({ ...newClient, email: text })
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={closeAddClientModal}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddClient}
                style={styles.addClientButton}
              >
                <Text style={styles.buttonText}>Add Client</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Client</Text>
            <TextInput
              placeholder="Company/Name *"
              style={styles.underlinedInput}
              value={editingClient?.company_name}
              onChangeText={(text) =>
                setEditingClient({ ...editingClient, company_name: text })
              }
            />
            <TextInput
              placeholder="Fiscal Code"
              style={styles.underlinedInput}
              value={editingClient.fisical_code}
              onChangeText={(text) =>
                setEditingClient({ ...editingClient, fisical_code: text })
              }
            />
            <TextInput
              placeholder="Address *"
              style={styles.underlinedInput}
              value={editingClient.address}
              onChangeText={(text) =>
                setEditingClient({ ...editingClient, address: text })
              }
            />
            <TextInput
              placeholder="zip_code *"
              style={styles.underlinedInput}
              value={editingClient.zip_code}
              onChangeText={(text) =>
                setEditingClient({ ...editingClient, zip_code: text })
              }
            />
            <Picker
              selectedValue={editingClient.country}
              onValueChange={(itemValue) =>
                setEditingClient({ ...editingClient, country: itemValue })
              }
              style={styles.picker}
            >
              {countries.map((country) => (
                <Picker.Item
                  key={country.value}
                  label={country.label}
                  value={country.value}
                />
              ))}
            </Picker>
            <TextInput
              placeholder="Phone *"
              style={styles.underlinedInput}
              value={editingClient.phone}
              onChangeText={(text) =>
                setEditingClient({ ...editingClient, phone: text })
              }
            />
            <TextInput
              placeholder="Email"
              style={styles.underlinedInput}
              value={editingClient.email}
              onChangeText={(text) =>
                setEditingClient({ ...editingClient, email: text })
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={closeEditClientModal}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEditClient}
                style={styles.addClientButton}
              >
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
  clientItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clientDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  clientActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
  },
  actionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "100%",
    height: "100%",
    shadowColor: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  underlinedInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 8,
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  addClientButton: {
    flex: 1,
    backgroundColor: "black",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
