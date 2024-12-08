import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Linking, // Ajout de l'import Linking
} from "react-native";
import { fonts, colors } from "../../Styles/styles";
import firebase from "../../Config";

const database = firebase.database();
const ref_tableProfils = database.ref("TableProfils");

import { Ionicons } from "react-native-vector-icons";

export default function ListProfil({ route, navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { currentId } = route.params;

  useEffect(() => {
    const listener = ref_tableProfils.on("value", (snapshot) => {
      const fetchedProfiles = [];
      snapshot.forEach((childSnapshot) => {
        const profile = childSnapshot.val();
        if (profile.id === currentId) {
          setCurrentUser(profile);
        } else {
          fetchedProfiles.push(profile);
        }
      });
      setProfiles(fetchedProfiles);
    });

    return () => ref_tableProfils.off("value", listener);
  }, [currentId]);

  // Animation pour les boutons
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startPulse();
  }, []);

  const renderProfileItem = ({ item }) => {
    const animatedStyle = item.isConnected
      ? { transform: [{ scale: pulseAnimation }] }
      : {};

    const handleCall = (phoneNumber) => {
      const url = `tel:${phoneNumber}`;
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.log("Can't handle URL: " + url);
          }
        })
        .catch((err) => console.error("An error occurred", err));
    };

    return (
      <View style={styles.profileCard}>
        <View
          style={[
            styles.connectionStatus,
            { backgroundColor: item.isConnected ? colors.buttonColor : "#81010b" },
          ]}
        ></View>
        <Image
          source={item.uriImage ? { uri: item.uriImage } : require("../../assets/profil.png")}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profilePseudo}>
            {item.pseudo || "Pseudo indisponible"}
          </Text>
          <Text style={styles.profileName}>{item.nom || "Nom indisponible"}</Text>
        </View>
        <View style={styles.buttonsContainer}>
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() =>
                navigation.navigate("Chat", {
                  currentUser,
                  secondUser: item,
                })
              }
            >
              <Ionicons name="chatbubble-ellipses" size={25} color="#fff" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(item.telephone)}
            >
              <Ionicons name="call" size={25} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={require("../../assets/background.png")} style={styles.container}>
      <StatusBar style="light" />
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
    paddingTop: 40,
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
  connectionStatus: {
    width: 15,
    height: 15,
    borderRadius: 50,
    marginRight: 10,
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
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  callButton: {
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});
