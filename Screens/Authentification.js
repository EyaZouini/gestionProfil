import { useRef, useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import firebase from "../Config";
import AuthContainer from "./AuthContainer"; // Importer AuthContainer
import { fonts, layout, colors } from "../Styles/styles"; // Importer les styles communs

const auth = firebase.auth();

export default function Authentification(props) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const refinput2 = useRef();

  return (
    <AuthContainer>
      {" "}
      {/* Utiliser AuthContainer ici */}
      <Text style={[fonts.title, { marginTop: 15 }, { marginBottom: 10 }]}>
        Authentification
      </Text>
      <TextInput
        onChangeText={(txt) => setEmail(txt)}
        style={[fonts.input, { marginBottom: 10 , borderRadius: 10 }]} // Utiliser les styles pour l'input
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
        style={[fonts.input, { marginBottom: 20 , borderRadius: 10}]} // Utiliser les styles pour l'input
        placeholder="password"
        keyboardType="default"
        secureTextEntry={true}
      />
      <TouchableOpacity
        style={[layout.button, { backgroundColor: colors.buttonColor }]} // Custom button color
        onPress={() => {
          if (email !== "" && pwd !== "") {
            auth
              .signInWithEmailAndPassword(email, pwd)
              .then(() => {
                props.navigation.replace("Home");
              })
              .catch((error) => {
                alert(error);
              });
          } else alert("error");
        }}
      >
        <Text style={fonts.buttonText}>Sign in</Text>
      </TouchableOpacity>
      <View style={{ width: "100%", alignItems: "center", marginTop: 30, marginBottom: 20 }}>
        <Text style={{ color: "white" }}>
          Don't have an account yet?
        </Text>
        <TouchableOpacity
          style={{
            paddingRight: 10,
            width: "100%",
            alignItems: "center",
            marginTop: 5,
          }}
          onPress={() => {
            props.navigation.navigate("NewUser");
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: "white",
              textDecorationLine: "underline", // Sous-lignage du texte
            }}
          >
            Create new user
          </Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
}
