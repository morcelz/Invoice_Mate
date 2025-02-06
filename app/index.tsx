import React, { useEffect } from 'react';
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) router.push('/(tabs)/invoices')
      else router.push('/login')
    })()
  }, []);

  return (<React.Fragment></React.Fragment>);
}