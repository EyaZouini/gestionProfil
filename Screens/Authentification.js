import React, { useRef, useState, useEffect } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "../Config";
import AuthContainer from "./AuthContainer";
import { fonts, layout, colors } from "../Styles/styles";

const auth = firebase.auth();

export default function Authentification({ navigation }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const refInput2 = useRef();

  // Vérifier si l'utilisateur est déjà connecté ou si "Se souvenir de moi" est activé
  useEffect(() => {
    const checkUser = async () => {
      const savedEmail = await AsyncStorage.getItem("email");
      const savedPassword = await AsyncStorage.getItem("password");

      if (savedEmail && savedPassword) {
        // Connexion automatique si les données sont disponibles
        auth
          .signInWithEmailAndPassword(savedEmail, savedPassword)
          .then(() => {
            console.log("Connexion automatique réussie.");
          })
          .catch(() => {
            // Effacer les données si la connexion échoue
            AsyncStorage.removeItem("email");
            AsyncStorage.removeItem("password");
          });
      }
      setLoading(false);
    };

    checkUser();
  }, [navigation]);

  const handleSignIn = async () => {
    if (email !== "" && pwd !== "") {
      auth
        .signInWithEmailAndPassword(email, pwd)
        .then(async () => {
          if (rememberMe) {
            // Stocker les informations localement
            await AsyncStorage.setItem("email", email);
            await AsyncStorage.setItem("password", pwd);
          }
        })
        .catch((error) => alert(error.message));
    } else {
      alert("Veuillez remplir tous les champs.");
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.buttonColor} />
      </View>
    );
  }

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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => setRememberMe(!rememberMe)}
          style={{
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: colors.placeholderColor,
            backgroundColor: rememberMe ? colors.buttonColor : "white",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          {rememberMe && <Text style={{ color: "white", fontWeight: "bold" }}>✓</Text>}
        </TouchableOpacity>
        <Text style={{ color: colors.textColor }}>Se souvenir de moi</Text>
      </View>

      <TouchableOpacity
        style={[layout.button, { backgroundColor: colors.buttonColor, width: "50%" }]}
        onPress={handleSignIn}
      >
        <Text style={fonts.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <View style={{ width: "100%", alignItems: "center", marginTop: 30, marginBottom: 20 }}>
        <Text style={{ color: colors.textColor }}>Pas encore de compte ?</Text>
        <TouchableOpacity style={{ marginTop: 5 }} onPress={() => navigation.navigate("NewUser")}>
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
