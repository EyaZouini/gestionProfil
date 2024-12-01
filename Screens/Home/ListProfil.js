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
import { fonts, colors } from "../../Styles/styles";
import firebase from "../../Config";

const database = firebase.database();
const ref_tableProfils = database.ref("TableProfils");

export default function ListProfil({ route, navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { currentId } = route.params;

  // Récupération des profils et de l'utilisateur actuel
  useEffect(() => {
    const listener = ref_tableProfils.on("value", (snapshot) => {
      const fetchedProfiles = [];
      snapshot.forEach((childSnapshot) => {
        const profile = childSnapshot.val();
        if (profile.id === currentId) {
          setCurrentUser(profile); // Définir l'utilisateur actuel
        } else {
          fetchedProfiles.push(profile); // Ajouter les autres utilisateurs
        }
      });
      setProfiles(fetchedProfiles); // Mettre à jour les profils
    });

    // Nettoyage de l'écouteur Firebase
    return () => ref_tableProfils.off("value", listener);
  }, [currentId]);

  // Composant de rendu pour chaque profil
  const renderProfileItem = ({ item }) => (
    <View style={styles.profileCard}>
      <Image
        source={
          item.uriImage
            ? { uri: item.uriImage }
            : require("../../assets/profil.png")
        }
        style={styles.profileImage}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.profilePseudo}>
          {item.pseudo || "Pseudo indisponible"}
        </Text>
        <Text style={styles.profileName}>{item.nom || "Nom indisponible"}</Text>
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() =>
          navigation.navigate("Chat", {
            currentUser,
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
      <Text style={[fonts.title, styles.title]}>List profils</Text>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={renderProfileItem}
        style={styles.list}
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
  title: {
    marginTop: 60,
    marginBottom: 20,
  },
  list: {
    width: "90%",
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
