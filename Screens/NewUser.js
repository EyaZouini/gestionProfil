import React, { useState, useRef } from "react";
import { Button, TextInput, Text, View, TouchableOpacity } from "react-native"; // Add View here
import firebase from "../Config";
import AuthContainer from "./AuthContainer"; // Importer AuthContainer
import { fonts, layout } from "../Styles/styles"; // Importer les styles communs

const auth = firebase.auth();
const database = firebase.database();

export default function NewUser(props) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const refinput2 = useRef();
  const refinput3 = useRef();

  return (
    <AuthContainer>
      {" "}
      {/* Use AuthContainer for layout and background */}
      <Text style={[fonts.title, { marginTop: 15, marginBottom: 10 }]}>
        Register
      </Text>
      <TextInput
        onChangeText={(txt) => setEmail(txt)}
        style={[fonts.input, { marginBottom: 10, borderRadius: 10 }]}
        placeholder="email"
        keyboardType="email-address"
        onSubmitEditing={() => {
          refinput2.current.focus();
        }}
        blurOnSubmit={false}
      />
      <TextInput
        ref={refinput2}
        onChangeText={(txt) => setPwd(txt)}
        style={[fonts.input, { marginBottom: 10, borderRadius: 10 }]}
        placeholder="password"
        keyboardType="default"
        secureTextEntry={true}
        onSubmitEditing={() => {
          refinput3.current.focus();
        }}
        blurOnSubmit={false}
      />
      <TextInput
        ref={refinput3}
        onChangeText={(txt) => setConfirmPwd(txt)}
        style={[fonts.input, { marginBottom: 10, borderRadius: 10 }]}
        placeholder="confirm password"
        keyboardType="default"
        secureTextEntry={true}
      />
      <View
        style={{
          marginTop: 10,
          marginBottom: 20,
          flexDirection: "row",
          gap: 15,
        }}
      >
        <TouchableOpacity
          style={layout.button} // Green color for the "Register" button
          onPress={() => {
            if (pwd !== confirmPwd) {
              alert("Passwords do not match");
            } else {
              auth
                .createUserWithEmailAndPassword(email, pwd)
                .then(() => {
                  const currentId = auth.currentUser.uid;
                  const ref_tableProfils = database.ref("TableProfils");
                  ref_tableProfils.child(currentId).set({
                    id: currentId,
                    email: email,
                    nom: "", // Vous pouvez demander à l'utilisateur
                    pseudo: "", // Ou inclure un champ pour cela
                  });
                  props.navigation.replace("Home", { currentId: currentId });
                })
                .catch((error) => {
                  alert(error);
                });
            }
          }}
        >
          <Text style={fonts.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[layout.button, { backgroundColor: "#f07578" }]} // Red color for the "Back" button
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <Text style={fonts.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
}
