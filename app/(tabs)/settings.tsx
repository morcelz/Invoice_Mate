

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Settings() {
  const router = useRouter();
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(false);
  
 

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');


  const handlePasswordChange = async () => {
    if (currentPassword === newPassword) {
      setError('New password cannot be the same as the current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

   
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data= await response.json();

      if (data.message) {
        Alert.alert('Succes','Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Error while changing password');
      console.error(error);
    }
  };

 
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
           
            AsyncStorage.clear().then(() => {
              router.push('/login');
            });
          },
        },
      ],
      { cancelable: false }
    );
  };
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            
            AsyncStorage.clear().then(() => {
              router.push('/login'); 
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleSecurity = () => {
    setIsSecurityExpanded(!isSecurityExpanded);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="tomato" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={toggleSecurity} style={styles.accordionHeader}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Ionicons
            name={isSecurityExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="tomato"
          />
        </TouchableOpacity>

        {isSecurityExpanded && (
          <View style={styles.accordionContent}>
            <View style={styles.pass}>
              <Text style={styles.sectionTitle}>Change Password</Text>

              <Text style={styles.text}>Current Password :</Text>
              <TextInput
                style={styles.underlinedInput}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />

              <Text style={styles.text}>New Password :</Text>
              <TextInput
                style={styles.underlinedInput}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text style={styles.text}>Confirm Password :</Text>
              <TextInput
                style={styles.underlinedInput}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
                <Text style={styles.buttonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>DELETE ACCOUNT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  text:{
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 'auto',
    
  },

  button: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom:10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  underlinedInput: {
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    padding: 8,
    marginBottom: 16,
    flex:1,
    width:'100%',
  },
  accordionPass:{
    padding: 50,
    borderRadius: 10,
    width: 300,
    paddingRight:10,
    

  },
  detailchange:{
    marginBottom:10,
    paddingHorizontal:200,

  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accordionContent: {
    marginTop: 8,
    marginBlock:5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
  },
  securityButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  securityButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'tomato',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    
  },
  pass:{
    backgroundColor:'#f5f5f5',
    marginBottom:20,
    borderRadius:20,
    alignItems:"center" ,


   }
});
