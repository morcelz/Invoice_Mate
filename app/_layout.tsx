// app/layout.tsx
import * as React from "react";

import { Stack } from "expo-router";
import DataProvider from "@/contexts/data-context";

const StackLayout = () => {
  return (
    <DataProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup1" />
        <Stack.Screen name="details" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DataProvider>
  );
};

export default StackLayout;
