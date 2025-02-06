import React, { useState } from "react";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  item: Invoice;
  toggleAccordion: (id: string) => void;
  openEditInvoiceModal: (invoice: Invoice) => void;
  handleDeleteInvoice: (id: string) => void;
  handlePrintInvoice: (id: string) => Promise<void>;
  handleUpdateInvoice: (updatedInvoice: Invoice) => void;
  handleDateChange: (
    event: any,
    selectedDate?: Date,
    field?: "creation_date" | "due_date",
    target?: "newInvoice" | "editingInvoice"
  ) => void;
};

const InvoiceItemComponent = ({
  item,
  toggleAccordion,
  handlePrintInvoice,
  openEditInvoiceModal,
  handleDeleteInvoice,
  handleUpdateInvoice,
  handleDateChange,
}: Props) => {
  const [showCreationDatePicker, setShowCreationDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  return (
    <View style={styles.invoiceItem}>
      <TouchableOpacity
        onPress={() => toggleAccordion(item.id)}
        style={styles.invoiceHeader}
      >
        <Text style={styles.invoiceId}>{item.invoice_id}</Text>
        <Ionicons
          name={item.isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="red"
        />
      </TouchableOpacity>

      {item.isExpanded && (
        <View style={styles.invoiceDetails}>

          <Text>Currency: {item.currency}</Text>

          
          <TouchableOpacity onPress={() => setShowCreationDatePicker(true)}>
            <Text>Creation Date: {item.creation_date}</Text>
          </TouchableOpacity>
          {showCreationDatePicker && (
            <DateTimePicker
              value={new Date(item.creation_date || new Date())}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, "creation_date", "editingInvoice")
              }
            />
          )}

        
          <TouchableOpacity onPress={() => setShowDueDatePicker(true)}>
            <Text>Due Date: {item.due_date}</Text>
          </TouchableOpacity>
          {showDueDatePicker && (
            <DateTimePicker
              value={new Date(item.due_date || new Date())}
              mode="date"
              display="default"
              onChange={(event, date) =>
                handleDateChange(event, date, "due_date", "editingInvoice")
              }
            />
          )}

          {item.currency === "local_currency" && (
            <Text>Fiscal Stamp: {item.fiscal_stamp ? "Yes" : "No"}</Text>
          )}

          <Text style={styles.itemsTitle}>Items:</Text>
          {item.invoiceItems?.length > 0 ? (
            item.invoiceItems.map((invoiceItem: InvoiceItem, index: number) => {
              return (
                <View key={index} style={styles.item}>
                  <Text>
                    Name: {invoiceItem.name ?? "N/A"}
                  </Text>
                  <Text>
                    Price:{" "}
                    {invoiceItem.price ?? "N/A"}
                  </Text>
                  <Text>
                    Type: {invoiceItem.type ?? "N/A"}
                  </Text>
                  <Text>
                    Quantity:{" "}
                    {invoiceItem.quantity ?? 0}
                  </Text>
                  <Text>
                    Tax Rate:{" "}
                    {invoiceItem.taxes ? `${invoiceItem.taxes}%` : "N/A"}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text>No items available</Text>
          )}

          <View style={styles.invoiceActions}>
            <TouchableOpacity
              onPress={() => {
                openEditInvoiceModal(item);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteInvoice(item.id)}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePrintInvoice(item.id ?? item.invoice_id)}
              style={styles.printButton}
            >
              <Text style={styles.printButtonText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  invoiceActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
  },
  invoiceDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
});

export default InvoiceItemComponent;
