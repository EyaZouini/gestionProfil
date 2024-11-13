import React, { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import firebase from "../Config";
const auth = firebase.auth();

export default function NewUser(props) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const refinput2 = useRef();
  const refinput3 = useRef();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View
        style={{ height: 28, width: "100%", backgroundColor: "#800040" }}
      ></View>
      <ImageBackground
        style={{
          height: "100%",
          width: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        resizeMode="cover"
        source={require("../assets/download.jpg")}
      >
        <View
          style={{
            borderRadius: 8,
            backgroundColor: "#0005",
            width: "85%",
            height: 300,
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "white",
              marginTop: 15,
            }}
          >
            Register
          </Text>
          <TextInput
            onChangeText={(txt) => setEmail(txt)}
            style={styles.input}
            placeholder="email"
            keyboardType="email-address"
            onSubmitEditing={() => {
              refinput2.current.focus();
            }}
            blurOnSubmit={false}
          ></TextInput>
          <TextInput
            ref={refinput2}
            onChangeText={(txt) => setPwd(txt)}
            style={styles.input}
            placeholder="password"
            keyboardType="default"
            secureTextEntry={true}
            onSubmitEditing={() => {
              refinput3.current.focus();
            }}
            blurOnSubmit={false}
          ></TextInput>
          <TextInput
            ref={refinput3}
            onChangeText={(txt) => setConfirmPwd(txt)}
            style={styles.input}
            placeholder="password"
            keyboardType="default"
            secureTextEntry={true}
          ></TextInput>
          <View style={{ marginTop: 20, flexDirection: "row", gap: 15 }}>
            <Button
              onPress={() => {
                if (pwd !== confirmPwd) {
                  alert("les passwords ne sont pas identiques");
                } else {
                  auth
                    .createUserWithEmailAndPassword(email, pwd)
                    .then(() => {
                      props.navigation.replace("Home");
                    })
                    .catch((error) => {
                      alert(error);
                    });
                }
              }}
              title="Register"
            ></Button>
            <Button
              onPress={() => {
                props.navigation.goBack();
              }}
              title="Back"
            ></Button>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f09",
    alignItems: "center", // horizontal alignement
    justifyContent: "flex-start", // vertical alignement
  },
  input: {
    fontFamily: "serif",
    fontSize: 16,
    marginTop: 15,
    padding: 10,
    height: 60,
    width: "90%",
    borderRadius: 2.5,
    textAlign: "center",
    backgroundColor: "white",
  },
});
