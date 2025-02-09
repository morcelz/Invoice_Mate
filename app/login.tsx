import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { HelperText } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordfocused, setPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const passwordhasErrors = () => {
    return password.length < 6;
  };

  const usernamehasErrors = () => {
    return !/^[a-zA-Z0-9]*$/.test(username);
  };

  const handlelogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        router.push("/(tabs)/invoices");
      } else {
        Alert.alert("Error", data.error || "Login failed");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      style={styles.container}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="midnightblue"
            animating={true}
          />
        </View>
      )}

      <Image
        style={styles.logo}
        source={require("../assets/images/adaptive-icon.png")}
      />
      <Text style={styles.text}>Username :</Text>
      <TextInput
        placeholder="your user name ..."
        style={styles.underlinedInput}
        value={username}
        onChangeText={setUsername}
      />
      <HelperText type="error" visible={usernamehasErrors()}>
        Username only contain letters and numbers!
      </HelperText>

      <Text style={styles.text}>Password :</Text>
      <TextInput
        placeholder="your password ..."
        style={styles.underlinedInput}
        secureTextEntry={!passwordVisible}
        value={password}
        onChangeText={setPassword}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
      />
      <TouchableOpacity
        onPress={() => setPasswordVisible(!passwordVisible)}
        style={styles.eyeIcon}
      >
        <Ionicons
          name={passwordVisible ? "eye-off" : "eye"}
          size={24}
          color="gray"
        />
      </TouchableOpacity>
      <HelperText type="error" visible={passwordfocused && passwordhasErrors()}>
        Passwords at least 6 characters!
      </HelperText>

      <TouchableOpacity
        style={styles.button}
        onPress={handlelogin}
        disabled={loading}
      >
        {!loading && <Text style={styles.buttonText}>Log in</Text>}
      </TouchableOpacity>

      <Link href="/signup1" style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: "60%",
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
  logo: {
    width: "60%",
    height: "40%",
    alignSelf: "center",
    marginBottom: 20,
    marginTop: "-50%",
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  underlinedInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 8,
    marginBottom: 7,
  },
  button: {
    backgroundColor: "tomato",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  link: {
    marginTop: 15,
  },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
