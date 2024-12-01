import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import firebase from "../Config";
import AuthContainer from "./AuthContainer";
import { fonts, layout, colors } from "../Styles/styles";

const auth = firebase.auth();

export default function Authentification({ navigation }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const refInput2 = useRef();

  const handleSignIn = () => {
    if (email !== "" && pwd !== "") {
      auth
        .signInWithEmailAndPassword(email, pwd)
        .then(() => {
          const currentId = auth.currentUser?.uid;
          if (currentId) {
            navigation.replace("Home", { currentId });
          } else {
            console.error("L'ID utilisateur est introuvable !");
            alert("Erreur : L'identifiant de l'utilisateur est introuvable.");
          }
        })
        .catch((error) => alert(error.message));
    } else {
      alert("Veuillez remplir tous les champs.");
    }
  };

  return (
    <AuthContainer>
      <Text style={[fonts.title, { marginTop: 15, marginBottom: 10 }]}>
        Authentification
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
        style={[fonts.input, { marginBottom: 20, borderRadius: 10 }]}
        placeholder="Mot de passe"
        placeholderTextColor={colors.placeholderColor}
        keyboardType="default"
        secureTextEntry
      />

      <TouchableOpacity
        style={[layout.button, { backgroundColor: colors.buttonColor , width: "50%" }]}
        onPress={handleSignIn}
      >
        <Text style={fonts.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <View style={{ width: "100%", alignItems: "center", marginTop: 30, marginBottom: 20 }}>
        <Text style={{ color: colors.textColor }}>Pas encore de compte ?</Text>
        <TouchableOpacity
          style={{ marginTop: 5 }}
          onPress={() => navigation.navigate("NewUser")}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: colors.textColor,
              textDecorationLine: "underline",
            }}
          >
            Créer un nouveau compte
          </Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
}
