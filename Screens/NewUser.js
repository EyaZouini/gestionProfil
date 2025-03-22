import React, { useState, useRef } from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import firebase from "../Config";
import AuthContainer from "./AuthContainer";
import { fonts, layout, colors } from "../Styles/styles";

const auth = firebase.auth();
const database = firebase.database();

export default function NewUser({ navigation }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const refInput2 = useRef();
  const refInput3 = useRef();

  const handleRegister = () => {
    if (pwd !== confirmPwd) {
      alert("Les mots de passe ne correspondent pas.");
    } else {
      auth
        .createUserWithEmailAndPassword(email, pwd)
        .then(() => {
          const currentId = auth.currentUser?.uid;
          if (currentId) {
            const refTableProfils = database.ref("TableProfils");
            refTableProfils.child(currentId).set({
              id: currentId,
              email,
              nom: "", // Champs supplémentaires à compléter
              pseudo: "",
            });
          } else {
            alert("Erreur : L'identifiant de l'utilisateur est introuvable.");
          }
        })
        .catch((error) => alert(error.message));
    }
  };

  return (
    <AuthContainer>
      <Text style={[fonts.title, { marginTop: 15, marginBottom: 10 }]}>
        Inscription
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        style={[fonts.input, { marginBottom: 10, borderRadius: 10 }]}
        placeholder="Email"
        placeholderTextColor={colors.placeholderColor}
        keyboardType="email-address"
        onSubmitEditing={() => refInput2.current.focus()}
        blurOnSubmit={false}
      />

      <TextInput
        ref={refInput2}
        value={pwd}
        onChangeText={setPwd}
        style={[fonts.input, { marginBottom: 10, borderRadius: 10 }]}
        placeholder="Mot de passe"
        placeholderTextColor={colors.placeholderColor}
        keyboardType="default"
        secureTextEntry
        onSubmitEditing={() => refInput3.current.focus()}
        blurOnSubmit={false}
      />

      <TextInput
        ref={refInput3}
        value={confirmPwd}
        onChangeText={setConfirmPwd}
        style={[fonts.input, { marginBottom: 10, borderRadius: 10 }]}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor={colors.placeholderColor}
        keyboardType="default"
        secureTextEntry
      />

      <View
        style={{
          marginTop: 10,
          marginBottom: 20,
          flexDirection: "row",
          gap: 15,
        }}
      >
        <TouchableOpacity style={layout.button} onPress={handleRegister}>
          <Text style={fonts.buttonText}>S'inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[layout.button, { backgroundColor: "#f07578" }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={fonts.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
}
