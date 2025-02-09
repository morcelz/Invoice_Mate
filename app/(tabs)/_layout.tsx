import React from "react";
import { Tabs } from "expo-router/tabs";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 80,
          paddingTop: 15,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
        },
        tabBarItemStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen
        name="invoices"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "receipt" : "receipt-outline"}
                color={focused ? "tomato" : "gray"}
                size={29}
              />
              <Text
                style={{
                  color: focused ? "tomato" : "gray",
                  fontSize: 12,
                  width: "100%",
                }}
              >
                Invoices
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="clients"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "people" : "people-outline"}
                color={focused ? "tomato" : "gray"}
                size={29}
              />
              <Text
                style={{
                  color: focused ? "tomato" : "gray",
                  fontSize: 12,
                  width: "100%",
                }}
              >
                Clients
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="company-details"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "business" : "business-outline"}
                color={focused ? "tomato" : "gray"}
                size={29}
              />
              <Text
                style={{
                  color: focused ? "tomato" : "gray",
                  fontSize: 12,
                  width: "100%",
                }}
              >
                Company
              </Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                color={focused ? "tomato" : "gray"}
                size={29}
              />
              <Text
                style={{
                  color: focused ? "tomato" : "gray",
                  fontSize: 12,
                  width: "100%",
                }}
              >
                Setting
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
