import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';

const countries = [
  { label: 'Tunisia', value: 'Tunisia' },
  { label: 'France', value: 'France' },
  { label: 'Germany', value: 'Germany' },
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Italy', value: 'Italy' },
  { label: 'Spain', value: 'Spain' },
  { label: 'Japan', value: 'Japan' },
  { label: 'China', value: 'China' },
  { label: 'India', value: 'India' },
  { label: 'Brazil', value: 'Brazil' },
  { label: 'Australia', value: 'Australia' },
  { label: 'South Korea', value: 'South Korea' },
  { label: 'Russia', value: 'Russia' },
  { label: 'Mexico', value: 'Mexico' },
  { label: 'South Africa', value: 'South Africa' },
  { label: 'Egypt', value: 'Egypt' },
  { label: 'Turkey', value: 'Turkey' },
  { label: 'Saudi Arabia', value: 'Saudi Arabia' },
];

const currencies = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'JPY', value: 'JPY' },
  { label: 'CAD', value: 'CAD' },
  { label: 'AUD', value: 'AUD' },
  { label: 'CHF', value: 'CHF' },
  { label: 'CNY', value: 'CNY' },
  { label: 'INR', value: 'INR' },
  { label: 'BRL', value: 'BRL' },
  { label: 'ZAR', value: 'ZAR' },
  { label: 'RUB', value: 'RUB' },
  { label: 'MXN', value: 'MXN' },
  { label: 'SGD', value: 'SGD' },
  { label: 'NZD', value: 'NZD' },
  { label: 'SEK', value: 'SEK' },
  { label: 'NOK', value: 'NOK' },
  { label: 'DKK', value: 'DKK' },
  { label: 'TRY', value: 'TRY' },
  { label: 'SAR', value: 'SAR' },
];

export default function CompanyInfo() {
  const router = useRouter();
  const [companyDetails, setCompanyDetails] = useState({
    
    company_name: '',
    fisical_code: '',
    address: '',
    zip_code: '',
    country: '',
    phone: '',
    email: '',
    local_currency: '',
    local_tax_percentage: '',
    picture:"",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const fetchCompanyDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company details');
      }

      const data = await response.json();

      setCompanyDetails({
        company_name: data.company_name || '',
        fisical_code: data.fisical_code || '',
        address: data.address || '',
        zip_code: data.zip_code || '',
        country: data.country || '',
        phone: data.phone || '',
        email: data.email || '',
        local_currency: data.local_currency || '',
        local_tax_percentage: data.local_tax_percentage || '',
        picture: data.picture || '',
      });

      if (data.picture) {
        setImage(`data:image/jpeg;base64,${data.picture}`);
      } else {
        setImage(null)
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      Alert.alert('Error', 'Failed to fetch company details.');
    }
  };

  const handleUpdateCompanyDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to update company details');
      }

      Alert.alert('Success', 'Company details updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating company details:', error);
      Alert.alert('Error', 'Failed to update company details.');
    }
  };

  const fetchImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true, 
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }], 
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
  
        return manipResult.base64;
        
      } catch (error) {
        console.error('Error manipulating image:', error);
        Alert.alert('Error', 'Failed to manipulate image.');
        return null;
      }
    } else {
      Alert.alert('Error', 'No image selected.');
      return null;
    }
  };

  const pickImage = async () => {
    const base64Image = await fetchImage();
  
    if (base64Image) {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/profile/picture`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
          },
          body: JSON.stringify({ picture:base64Image}),
        });
        
           
        if (response.ok) {
          setImage(`data:image/jpeg;base64,${base64Image}`);
          Alert.alert('Success', 'Profile picture updated successfully.');
        } else {
          Alert.alert('Error', `Failed to update profile picture`);
        }
      } catch (error) {
        console.error('Error updating profile picture:', error);
        Alert.alert('Error', 'Failed to update profile picture.');
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/profile/picture`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        if (response.ok) {
            setImage(null);
        } else {
          console.error('Error deleting image:', data.error);
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
    setIsImageModalVisible(false);
};

const handleImagePress = () => {
    if (image) {
        setIsImageModalVisible(true);
    } else {
        pickImage();
    }
};

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Company Info</Text>
      </View>
      <TouchableOpacity onPress={handleImagePress} style={styles.uploadContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <MaterialIcons name="photo-camera" size={30} color="gray" />
        )}
      </TouchableOpacity>

      <Modal visible={isImageModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={pickImage} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Edit Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteImage} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Delete Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsImageModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Company Name :</Text>
        <TextInput
          style={[
            styles.underlinedInput,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
          value={companyDetails.company_name}
          onChangeText={(text) => setCompanyDetails({ ...companyDetails, company_name: text })}
          editable={isEditing}
        />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Fiscal Code :</Text>
        <TextInput
          style={[
            styles.underlinedInput,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
          value={companyDetails.fisical_code}
          onChangeText={(text) => setCompanyDetails({ ...companyDetails, fisical_code: text })}
          editable={isEditing}
        />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Address :</Text>
        <TextInput
          style={[
            styles.underlinedInput,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
          value={companyDetails.address}
          onChangeText={(text) => setCompanyDetails({ ...companyDetails, address: text })}
          editable={isEditing}
        />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Zip Code :</Text>
        <TextInput
          style={[
            styles.underlinedInput,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
          value={companyDetails.zip_code}
          onChangeText={(text) => setCompanyDetails({ ...companyDetails, zip_code: text })}
          editable={isEditing}
        />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Country :</Text>
        <Picker
          selectedValue={companyDetails.country}
          onValueChange={(itemValue) => setCompanyDetails({ ...companyDetails, country: itemValue })}
          enabled={isEditing}
          style={[
            styles.picker,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
        >
          {countries.map((country) => (
            <Picker.Item key={country.value} label={country.label} value={country.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Phone :</Text>
        <TextInput
          style={[
            styles.underlinedInput,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
          value={companyDetails.phone}
          onChangeText={(text) => setCompanyDetails({ ...companyDetails, phone: text })}
          editable={isEditing}
        />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Email :</Text>
        <TextInput
          style={[
            styles.underlinedInput,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
          value={companyDetails.email}
          onChangeText={(text) => setCompanyDetails({ ...companyDetails, email: text })}
          editable={isEditing}
        />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Local Currency :</Text>
        <Picker
          selectedValue={companyDetails.local_currency}
          onValueChange={(itemValue) => setCompanyDetails({ ...companyDetails, local_currency: itemValue })}
          enabled={isEditing}
          style={[
            styles.picker,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
        >
          {currencies.map((currency) => (
            <Picker.Item key={currency.value} label={currency.label} value={currency.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Tax Percentage :</Text>
        <TextInput
          style={[
            styles.underlinedInput,
            { backgroundColor: isEditing ? '#fff' : '#f5f5f5' },
          ]}
          value={companyDetails.local_tax_percentage}
          onChangeText={(text) => setCompanyDetails({ ...companyDetails, local_tax_percentage: text })}
          editable={isEditing}
        />
      </View>

      {isEditing ? (
        <TouchableOpacity onPress={handleUpdateCompanyDetails} style={styles.updateButton}>
          <Text style={styles.updateButtonText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Details</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom:7,
  },
  underlinedInput: {
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    padding: 8,
    marginBottom: 10,
    flex: 1,
    
    
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    flex: 1,
    marginLeft: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  updateButton: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: 'tomato',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalButton: {
    padding: 12,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'tomato',
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});