import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HelperText } from "react-native-paper";
type FormData = {
  company_name?: string;
  fisical_code?: string;
  address?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  local_currency?: string;
  local_tax_percentage?: string;
};

const currencies = [
  { label: "TND", value: "TND" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
];

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

export default function CompanyDetails() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({
    company_name: false,
    fisical_code: false,
    address: false,
    zip_code: false,
    country: false,
    phone: false,
    email: false,
    local_currency: false,
    local_tax_percentage: false,
  });

  const handleInputChange = (key: string, text: string) => {
    setFormData({
      ...formData,
      [key]: text,
    });
  };

  const handleCountryChange = (value: string) => {
    setFormData({
      ...formData,
      country: value,
    });
  };

  const handleCurrencyChange = (value: string) => {
    setFormData({
      ...formData,
      local_currency: value,
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push("/(tabs)/invoices");
      } else {
        Alert.alert("Error", data.error || "Profile creation failed");
      }
    } catch (error) {
      console.error("Profile creation error:", error);
      Alert.alert("Error", "An error occurred during profile creation");
    } finally {
      setLoading(false);
    }
  };

  const handleback = () => {
    router.push("/signup1");
  };

  const steps = [
    {
      label: "Company Details",
      fields: [
        {
          label: "Company name ...",
          key: "company_name",
          hasErrors: (value: string) => !/^[a-zA-Z0-9]*$/.test(value),
          errorMessage: "Company name only contain letters and numbers!",
        },
        {
          label: "Fiscal code ...",
          key: "fisical_code",
          hasErrors: (value: string) => value.length < 6,
          errorMessage: "Fiscal code must be at least 6 characters long!",
        },
        {
          label: "Address ...",
          key: "address",
          hasErrors: (value: string) => value.length < 6,
          errorMessage: "Address must be at least 6 characters long!",
        },
        {
          label: "Zip code ...",
          key: "zip_code",
          hasErrors: (value: string) => value.length < 4,
          errorMessage: "Zip code must be at least 4 characters long!",
        },
        {
          label: "Country ...",
          key: "country",
          hasErrors: (value: string) => value.length === 0,
          errorMessage: "Country is required!",
        },
      ],
    },
    {
      label: "Contact Details",
      fields: [
        {
          label: "Phone ...",
          key: "phone",
          hasErrors: (value: string) => value.length < 8,
          errorMessage: "Phone number must be at least 8 characters long!",
        },
        {
          label: "Email ...",
          key: "email",
          hasErrors: (value: string) =>
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          errorMessage: "Invalid email address!",
        },
      ],
    },
    {
      label: "Financial Details",
      fields: [
        {
          label: "Currency ...",
          key: "local_currency",
          hasErrors: (value: string) => value.length === 0,
          errorMessage: "Currency is required!",
        },
        {
          label: "Tax rate ...",
          key: "local_tax_percentage",
          hasErrors: (value: string) => value.length < 2,
          errorMessage: "Tax rate must be at least 2 characters long!",
        },
      ],
    },
    {
      label: "Review",
      fields: [],
    },
  ];

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="midnightblue"
            animating={true}
          />
        </View>
      )}
      <TouchableOpacity onPress={handleback} style={styles.backicon}>
        <Ionicons name="arrow-back" size={24} color="tomato" />
      </TouchableOpacity>

      <Text style={styles.stepLabel}>{steps[currentStep].label}:</Text>

      {steps[currentStep].fields.map((field) => {
        if (field.key === "country") {
          return (
            <Picker
              key={field.key}
              selectedValue={formData.country}
              onValueChange={handleCountryChange}
            >
              <Picker.Item
                key={"choose your country"}
                label={"choose your country"}
                value={""}
              />
              {countries.map((country) => (
                <Picker.Item
                  key={country.value}
                  label={country.label}
                  value={country.value}
                />
              ))}
            </Picker>
          );
        } else if (field.key === "local_currency") {
          return (
            <Picker
              key={field.key}
              selectedValue={formData.local_currency}
              onValueChange={handleCurrencyChange}
              style={styles.picker}
            >
              <Picker.Item
                key={"choose your currency"}
                label={"choose your currency"}
                value={""}
              />
              {currencies.map((currency) => (
                <Picker.Item
                  key={currency.value}
                  label={currency.label}
                  value={currency.value}
                />
              ))}
            </Picker>
          );
        } else {
          return (
            <>
              <TextInput
                key={field.key}
                placeholder={field.label}
                style={styles.underlinedInput}
                value={formData[field.key as keyof FormData] || ""}
                onChangeText={(text) => handleInputChange(field.key, text)}
                onFocus={() =>
                  setFocused((prev) => ({ ...prev, [field.key]: true }))
                }
                onBlur={() =>
                  setFocused((prev) => ({ ...prev, [field.key]: false }))
                }
              />
              {field.hasErrors &&
                field.errorMessage &&
                Boolean(focused[field.key as keyof FormData]) && (
                  <HelperText
                    type="error"
                    visible={field.hasErrors(
                      formData[field.key as keyof FormData] || ""
                    )}
                  >
                    {field.errorMessage}
                  </HelperText>
                )}
            </>
          );
        }
      })}

      {currentStep === steps.length - 1 && (
        <View style={styles.reviewContainer}>
          {Object.entries(formData).map(([key, value]) => (
            <Text
              key={key}
              style={styles.reviewText}
            >{`${key}: ${value}`}</Text>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.button} onPress={handlePrevious}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
        )}

        {currentStep < steps.length - 1 ? (
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleFinish}
            disabled={loading}
          >
            {!loading && <Text style={styles.buttonText}>Finish</Text>}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  stepLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  underlinedInput: {
    borderBottomWidth: 1, // Add a bottom border
    borderBottomColor: "#ccc", // Border color
    padding: 8,
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,

    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "tomato",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  backicon: {
    position: "absolute",
    top: 40,
    left: 16,
  },
  reviewContainer: {
    marginBottom: 16,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 8,
  },
});
