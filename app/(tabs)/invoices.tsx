import React, { useState, useEffect } from "react";
import { View,Text,StyleSheet,TouchableOpacity,FlatList,Alert,Modal,TextInput,ScrollView,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Invoice } from "@/types/invoice";
import InvoiceItem from "@/componenets/InvoiceItem";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { useDataContext } from "@/contexts/data-context";
export default function Invoices() {
  const { clients, fetchClients } = useDataContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [companyDetails, setCompanyDetails] = useState({
    company_name: "",
    fisical_code: "",
    address: "",
    zip_code: "",
    country: "",
    phone: "",
    email: "",
    local_currency: "",
    local_tax_percentage: "",
  });

  const [newInvoice, setNewInvoice] = useState<
    Omit<Invoice, "id" | "isExpanded">
  >({
    client_id: 0,
    invoice_id: "",
    creation_date: "",
    due_date: "",
    currency: "",
    fiscal_stamp: false,
    invoiceItems: [{ name: "", price: 0, type: "", quantity: 0, taxes: 0 }],
  });
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [showCreationDatePicker, setShowCreationDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  const renderInvoiceItem = ({ item }: { item: Invoice }) => {
    return (
      <InvoiceItem
        item={item}
        toggleAccordion={toggleAccordion}
        openEditInvoiceModal={openEditInvoiceModal}
        handleDeleteInvoice={handleDeleteInvoice}
        handlePrintInvoice={handlePrintInvoice}
        handleUpdateInvoice={handleUpdateInvoice}
        handleDateChange={handleDateChange}
      />
    );
  };

  const openAddInvoiceModal = () => {
    setIsAddModalVisible(true);
  };

  const closeAddInvoiceModal = () => {
    setIsAddModalVisible(false);
    setNewInvoice({
      client_id: 0,
      invoice_id: "",
      invoiceItems: [{ name: "", price: 0, type: "", quantity: 0, taxes: 0 }],
      currency: "",
      creation_date: "",
      due_date: "",
      fiscal_stamp: false,
    });
  };

  const handleDateChange = (
    _event: any,
    selectedDate?: Date,
    field: "creation_date" | "due_date" = "creation_date",
    target: "newInvoice" | "editingInvoice" = "newInvoice"
  ) => {
    if (field === "creation_date") {
      setShowCreationDatePicker(false);
    } else {
      setShowDueDatePicker(false);
    }

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      if (target === "newInvoice") {
        setNewInvoice({
          ...newInvoice,
          currency: companyDetails.local_currency,
          [field]: formattedDate,
        });
      } else if (target === "editingInvoice" && editingInvoice) {
        setEditingInvoice({ ...editingInvoice, [field]: formattedDate });
      }
    }
  };

  const handleAddInvoice = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newInvoice,
            fiscal_stamp: newInvoice.currency === companyDetails.local_currency,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Unknown error occurred");
      }

      const newInvoiceData = await response.json();

      setInvoices([...invoices, newInvoiceData.body]);
      closeAddInvoiceModal();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "failed to add invoice please try again");
    } finally {
      closeAddInvoiceModal();
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }

      const data = await response.json();
      setCompanyDetails({
        company_name: data.company_name || "",
        fisical_code: data.fisical_code || "",
        address: data.address || "",
        zip_code: data.zip_code || "",
        country: data.country || "",
        phone: data.phone || "",
        email: data.email || "",
        local_currency: data.local_currency || "",
        local_tax_percentage: data.local_tax_percentage || "",
      });
    } catch (error) {
      console.error("Error fetching company details:", error);
      Alert.alert("Error", "Failed to fetch company details.");
    }
  };

  const renderDatePicker = (
    field: "creation_date" | "due_date",
    target: "newInvoice" | "editingInvoice" = "newInvoice"
  ) => {
    return (
      <DateTimePicker
        value={
          target === "newInvoice"
            ? new Date(newInvoice[field] || new Date())
            : new Date(editingInvoice?.[field] || new Date())
        }
        mode="date"
        display="default"
        onChange={(event, date) => handleDateChange(event, date, field, target)}
      />
    );
  };

  const toggleAccordion = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id
          ? { ...invoice, isExpanded: !invoice.isExpanded }
          : invoice
      )
    );
  };

  const openEditInvoiceModal = async (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditModalVisible(true);
  };
  const closeEditInvoiceModal = () => {
    setIsEditModalVisible(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = async (id: string) => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure you want to delete this invoice?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/invoices/${id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (!response.ok) {
                Alert.alert("Error", "Failed to delete the invoice.");
                return;
              }
              setInvoices(invoices.filter((invoice) => invoice.id !== id));
            } catch (error) {
              Alert.alert(
                "Error",
                "Something went wrong while deleting the invoice."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const fetchInvoices = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        Alert.alert("Error", "Failed to fetch invoices.");
        return;
      }

      const invoicesData = await response.json();
      if (!Array.isArray(invoicesData)) {
        Alert.alert("Error", "Invalid data format received.");
        return;
      }

      setInvoices(invoicesData);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch invoices.");
    }
  };
  const fetchpdf = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices/download/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/pdf",
          },
        }
      );
      const file = await response.arrayBuffer();

      return file;
    } catch (err) {
      Alert.alert("Error", "Failed to fetch invoices pdf.");
    }
  };

  const handlePrintInvoice = async (id: string) => {
    try {
      const file = await fetchpdf(id);

      if (!file) {
        throw new Error("file not found");
      }

      const fileUri = FileSystem.documentDirectory + `${id}.pdf`;
      const fileBuffer = Buffer.from(file).toString("base64");

      await FileSystem.writeAsStringAsync(fileUri, fileBuffer, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Print.printAsync({
        uri: fileUri,
      });
    } catch (error) {
      console.error("Error printing invoice:", error);
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleUpdateInvoice = async () => {
    try {
      if (!editingInvoice?.id) {
        return;
      }

      const invoiceToSent = editingInvoice as typeof editingInvoice & {
        file: any;
      };
      delete invoiceToSent.file;

      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/invoices/${editingInvoice.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceToSent),
        }
      );

      if (!response.ok) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }

      const newInvoiceData = await response.json();

      setInvoices(
        invoices
          .filter((invoice) => invoice.id !== editingInvoice.id)
          .concat(newInvoiceData.invoice)
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update invoice.");
    } finally {
      closeEditInvoiceModal();
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    fetchClients();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <TouchableOpacity
          onPress={openAddInvoiceModal}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="tomato" />
        </TouchableOpacity>
      </View>

      {invoices.length ? (
        <FlatList
          data={invoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No invoices found.</Text>
        </View>
      )}

      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Invoice</Text>

            <Picker
              selectedValue={newInvoice.client_id}
              onValueChange={(itemValue) =>
                setNewInvoice({ ...newInvoice, client_id: itemValue })
              }
              style={styles.underlinedInput}
            >
              <Picker.Item label="Select Client" value="" />
              {clients.map((client) => (
                <Picker.Item
                  key={client.id}
                  label={client.company_name}
                  value={client.id}
                />
              ))}
            </Picker>

            <Text style={styles.itemsTitle}>Items:</Text>
            {newInvoice.invoiceItems.map((item, index) => (
              <View key={index} style={styles.itemInput}>
                <TextInput
                  placeholder="Item Name *"
                  style={styles.underlinedInput}
                  value={item.name}
                  onChangeText={(text) => {
                    const updatedItems = [...newInvoice.invoiceItems];
                    updatedItems[index].name = text;
                    setNewInvoice({
                      ...newInvoice,
                      invoiceItems: updatedItems,
                    });
                  }}
                />
                <TextInput
                  placeholder="Price *"
                  keyboardType="decimal-pad"
                  style={styles.underlinedInput}
                  value={item.price ? item.price.toString() : ""}
                  onChangeText={(text) => {
                    const updatedItems = [...newInvoice.invoiceItems];
                    updatedItems[index].price = text as unknown as number;
                    setNewInvoice({
                      ...newInvoice,
                      invoiceItems: updatedItems,
                    });
                  }}
                />
                <Picker
                  selectedValue={item.type}
                  onValueChange={(itemValue) => {
                    const updatedItems = [...newInvoice.invoiceItems];
                    updatedItems[index].type = itemValue as
                      | "service"
                      | "product";
                    setNewInvoice({
                      ...newInvoice,
                      invoiceItems: updatedItems,
                    });
                  }}
                  style={styles.underlinedInput}
                >
                  <Picker.Item label="Select Type" value="" />
                  <Picker.Item label="Service" value="service" />
                  <Picker.Item label="Product" value="product" />
                </Picker>
                <TextInput
                  placeholder="Quantity *"
                  keyboardType="decimal-pad"
                  style={styles.underlinedInput}
                  value={item.quantity ? item.quantity.toString() : ""}
                  onChangeText={(text) => {
                    const updatedItems = [...newInvoice.invoiceItems];
                    updatedItems[index].quantity = text as unknown as number;
                    setNewInvoice({
                      ...newInvoice,
                      invoiceItems: updatedItems,
                    });
                  }}
                />

                <TextInput
                  placeholder="Tax Rate *"
                  keyboardType="decimal-pad"
                  style={styles.underlinedInput}
                  value={item.taxes ? item.taxes.toString() : ""}
                  onChangeText={(text) => {
                    const updatedItems = [...newInvoice.invoiceItems];
                    updatedItems[index].taxes = text as unknown as number;
                    setNewInvoice({
                      ...newInvoice,
                      invoiceItems: updatedItems,
                    });
                  }}
                />

                <TouchableOpacity
                  onPress={() => {
                    const updatedItems = newInvoice.invoiceItems.filter(
                      (_, idx) => idx !== index
                    );
                    setNewInvoice({
                      ...newInvoice,
                      invoiceItems: updatedItems,
                    });
                  }}
                  style={styles.removeItemButton}
                >
                  <Text style={styles.buttonText}>Remove Item</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => {
                setNewInvoice({
                  ...newInvoice,
                  invoiceItems: [
                    ...newInvoice.invoiceItems,
                    {
                      name: "",
                      price: 0,
                      type: "",
                      quantity: 0,
                      taxes: 0,
                    },
                  ],
                });
              }}
              style={styles.addItemButton}
            >
              <Text style={styles.buttonText}>Add Item</Text>
            </TouchableOpacity>

            <Picker
              selectedValue={newInvoice.currency}
              onValueChange={(itemValue) => {
                setNewInvoice({ ...newInvoice, currency: itemValue });
              }}
              style={styles.underlinedInput}
            >
              <Picker.Item label="Select Currency" value="" />
              <Picker.Item label="USD" value="USD" />
              <Picker.Item label="EUR" value="EUR" />
              <Picker.Item label="TND" value="TND" />
              <Picker.Item label="GBP" value="GBP" />
              <Picker.Item
                label="Local Currency"
                value={companyDetails.local_currency}
              />
            </Picker>

            <TouchableOpacity onPress={() => setShowCreationDatePicker(true)}>
              <TextInput
                placeholder="Creation Date *"
                style={styles.underlinedInput}
                value={newInvoice.creation_date}
                editable={false}
              />
            </TouchableOpacity>
            {showCreationDatePicker && (
              <View>{renderDatePicker("creation_date", "newInvoice")}</View>
            )}

            <TouchableOpacity onPress={() => setShowDueDatePicker(true)}>
              <TextInput
                placeholder="Due Date *"
                style={styles.underlinedInput}
                value={newInvoice.due_date}
                editable={false}
              />
            </TouchableOpacity>
            {showDueDatePicker && (
              <View>{renderDatePicker("due_date", "newInvoice")}</View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={closeAddInvoiceModal}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddInvoice}
                style={styles.addInvoiceButton}
              >
                <Text style={styles.buttonText}>Add Invoice</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Invoice</Text>
            {editingInvoice && (
              <>
                <TextInput
                  placeholder="Invoice ID *"
                  style={styles.underlinedInput}
                  value={editingInvoice.invoice_id}
                  onChangeText={(text) =>
                    setEditingInvoice({ ...editingInvoice, invoice_id: text })
                  }
                  editable={false}
                />
                <Picker
                  enabled={false}
                  selectedValue={newInvoice.client_id}
                  onValueChange={(itemValue) =>
                    setNewInvoice({ ...newInvoice, client_id: itemValue })
                  }
                  style={styles.underlinedInput}
                >
                  <Picker.Item label="Select Client" value="" />
                  {clients.map((client) => (
                    <Picker.Item
                      key={client.id}
                      label={client.company_name}
                      value={client.id}
                    />
                  ))}
                </Picker>
                <Text style={styles.itemsTitle}>Items:</Text>
                {editingInvoice.invoiceItems.map((item, index) => (
                  <View key={index} style={styles.itemInput}>
                    <TextInput
                      placeholder="Item Name *"
                      style={styles.underlinedInput}
                      value={item.name}
                      onChangeText={(text) => {
                        const updatedItems = [...editingInvoice.invoiceItems];
                        updatedItems[index].name = text;
                        setEditingInvoice({
                          ...editingInvoice,
                          invoiceItems: updatedItems,
                        });
                      }}
                    />
                    <TextInput
                      placeholder="Price *"
                      style={styles.underlinedInput}
                      value={item.price.toString()}
                      keyboardType="decimal-pad"
                      onChangeText={(text) => {
                        setEditingInvoice({
                          ...editingInvoice,
                          invoiceItems: editingInvoice.invoiceItems.map(
                            (item, i) => {
                              if (i === index) {
                                return {
                                  ...item,
                                  price: text as unknown as number,
                                };
                              }
                              return item;
                            }
                          ),
                        });
                      }}
                    />

                    <Picker
                      selectedValue={item.type}
                      onValueChange={(itemValue) => {
                        const updatedItems = [...editingInvoice.invoiceItems];
                        updatedItems[index].type = itemValue as
                          | "service"
                          | "product";
                        setEditingInvoice({
                          ...editingInvoice,
                          invoiceItems: updatedItems,
                        });
                      }}
                      style={styles.underlinedInput}
                    >
                      <Picker.Item label="Select Type" value="" />
                      <Picker.Item label="Service" value="service" />
                      <Picker.Item label="Product" value="product" />
                    </Picker>
                    <TextInput
                      placeholder="Quantity *"
                      style={styles.underlinedInput}
                      value={item.quantity.toString()}
                      keyboardType="decimal-pad"
                      onChangeText={(text) => {
                        setEditingInvoice({
                          ...editingInvoice,
                          invoiceItems: editingInvoice.invoiceItems.map(
                            (item, i) => {
                              if (i === index) {
                                return {
                                  ...item,
                                  quantity: text as unknown as number,
                                };
                              }
                              return item;
                            }
                          ),
                        });
                      }}
                    />
                  </View>
                ))}
                <Picker
                  selectedValue={editingInvoice.currency}
                  onValueChange={(itemValue) =>
                    setEditingInvoice({
                      ...editingInvoice,
                      currency: itemValue,
                    })
                  }
                >
                  <Picker.Item label="Select Currency" value="" />
                  <Picker.Item label="USD" value="USD" />
                  <Picker.Item label="EUR" value="EUR" />
                  <Picker.Item label="TND" value="TND" />
                  <Picker.Item label="GBP" value="GBP" />
                  <Picker.Item
                    label="Local Currency"
                    value={companyDetails.local_currency}
                  />
                </Picker>
                <TouchableOpacity
                  onPress={() => setShowCreationDatePicker(true)}
                >
                  <TextInput
                    placeholder="Creation Date *"
                    style={styles.underlinedInput}
                    value={editingInvoice.creation_date}
                    editable={false}
                  />
                </TouchableOpacity>
                {showCreationDatePicker &&
                  renderDatePicker("creation_date", "editingInvoice")}{" "}
                <TouchableOpacity onPress={() => setShowDueDatePicker(true)}>
                  <TextInput
                    placeholder="Due Date *"
                    style={styles.underlinedInput}
                    value={editingInvoice.due_date}
                    editable={false}
                  />
                </TouchableOpacity>
                {showDueDatePicker &&
                  renderDatePicker("due_date", "editingInvoice")}{" "}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={closeEditInvoiceModal}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleUpdateInvoice}
                    style={styles.addInvoiceButton}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
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
  invoiceItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  switch: {
    flex: 1,
    alignItems: "center",
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: "bold",
  },
  invoiceDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "black",
  },
  item: {
    marginBottom: 16,
  },
  itemInput: {
    marginBottom: 16,
  },
  invoiceActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
  },
  actionButton: {
    padding: 8,
  },
  printButton: {
    backgroundColor: "black",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  printButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: "10%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  addInvoiceButton: {
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
  removeItemButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  removeItemButtonHover: {
    backgroundColor: "#e60000",
  },
  addItemButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  addItemButtonHover: {
    backgroundColor: "#45a049",
  },
});
