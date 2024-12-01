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
import { fonts, layout, colors } from "../../Styles/styles";
import firebase from "../../Config";

const database = firebase.database();
const ref_tableProfils = database.ref("TableProfils");

export default function ListProfil(props) {
  const [data, setData] = useState([]);
  const currentId = props.route.params.currentId; // Vérifiez l'orthographe ici
  const [currentUser, setCurrentUser] = useState(null);

  // Récupérer les données
  useEffect(() => {
    ref_tableProfils.on("value", (snapshot) => {
      const d = [];
      snapshot.forEach((unProfil) => {
        const profil = unProfil.val();
        if (profil.id === currentId) {
          // Définir l'utilisateur actuel
          setCurrentUser(profil);
        } else {
          // Ajouter les autres utilisateurs à la liste
          d.push(profil);
        }
      });
      setData(d); // Met à jour l'état avec les données des autres utilisateurs
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => {
      ref_tableProfils.off();
    };
  }, [currentId]); // Ajoutez `currentId` comme dépendance

  // Fonction pour chaque vue
  const renderProfileItem = ({ item }) => (
    <View style={styles.profileCard}>
      {/* Image de profil à gauche */}
      <Image
        source={
          item.uriImage
            ? { uri: item.uriImage } // Utilise l'URL de l'image si disponible
            : require("../../assets/profil.png") // Sinon, affiche l'icône par défaut
        }
        style={styles.profileImage}
      />

      {/* Pseudo et nom */}
      <View style={styles.profileInfo}>
        <Text style={styles.profilePseudo}>
          {item.pseudo || "Pseudo indisponible"}
        </Text>
        <Text style={styles.profileName}>
          {item.nom || "Nom indisponible"}
        </Text>
      </View>

      {/* Bouton pour accéder au chat */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() =>
          props.navigation.navigate("Chat", {
            currentUser: currentUser,
            secondUser: item,
          })
        }
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Text style={[fonts.title, { marginTop: 60 }, { marginBottom: 20 }]}>
        List profils
      </Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id} // Clé unique pour chaque profil
        renderItem={renderProfileItem} // Rendu personnalisé
        style={{ width: "90%" }}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profilePseudo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  profileName: {
    fontSize: 14,
    color: "#cdcdcd",
  },
  chatButton: {
    backgroundColor: colors.buttonColor,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
