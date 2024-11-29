import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import firebase from "../../Config";
const database = firebase.database();
const ref_tableProfils = database.ref("TableProfils");

export default function ListProfil(props) {
  const [data, setData] = useState([]);

  // Récupérer les données
  useEffect(() => {
    ref_tableProfils.on("value", (snapshot) => {
      const d = [];
      snapshot.forEach((unProfil) => {
        d.push({
          id: unProfil.key, // Clé unique pour chaque item
          ...unProfil.val(), // Données réelles du profil
        });
      });
      setData(d); // Met à jour l'état avec les données
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      ref_tableProfils.off();
    };
  }, []);

  // Fonction pour chaque vue
  const renderProfileItem = ({ item }) => (
    <View style={styles.profileCard}>
      {/* Image de profil à gauche */}
      <Image
        source={require("../../assets/profil.png")} // Remplacez par une URL si nécessaire
        style={styles.profileImage}
      />

      {/* Pseudo et nom */}
      <View style={styles.profileInfo}>
        <Text style={styles.profilePseudo}>{item.pseudo}</Text>
        <Text style={styles.profileName}>{item.nom}</Text>
      </View>

      {/* Bouton pour accéder au chat */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => props.navigation.navigate("Chat",{secondnom: item.nom})}
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/imgbleu.jpg")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Text style={styles.textstyle}>List profils</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id} // Clé unique pour chaque profil
        renderItem={renderProfileItem} // Rendu personnalisé
        style={{ backgroundColor: "#fff3", width: "95%" }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  textstyle: {
    fontSize: 40,
    fontFamily: "serif",
    color: "white",
    fontWeight: "bold",
    paddingTop: 45,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5, // Ombre sur Android
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Cercle
    marginRight: 10,
  },
  profileInfo: {
    flex: 1, // Utiliser tout l'espace disponible
    justifyContent: "center",
  },
  profilePseudo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileName: {
    fontSize: 14,
    color: "#666",
  },
  chatButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});