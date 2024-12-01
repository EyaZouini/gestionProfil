import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  TextInput,
  TouchableHighlight,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { fonts, layout, colors } from "../Styles/styles";
import firebase from "../Config";

const database = firebase.database();
const ref_lesdiscussions = database.ref("lesdiscussions");

export default function Chat(props) {
  const currentUser = props.route.params.currentUser;
  const secondUser = props.route.params.secondUser;

  const iddisc =
    currentUser.id > secondUser.id
      ? currentUser.id + secondUser.id
      : secondUser.id + currentUser.id;
  const ref_unediscussion = ref_lesdiscussions.child(iddisc);

  const [Msg, setMsg] = useState("");
  const [data, setdata] = useState([]);

  // Récupérer les données des messages
  useEffect(() => {
    ref_unediscussion.on("value", (snapshot) => {
      let d = [];
      snapshot.forEach((unmessage) => {
        d.push(unmessage.val());
      });
      setdata(d);
    });

    return () => {
      ref_unediscussion.off();
    };
  }, []);

  const handleSend = () => {
    const key = ref_unediscussion.push().key;
    const ref_unmsg = ref_unediscussion.child(key);
    ref_unmsg.set({
      body: Msg,
      time: new Date().toLocaleString(),
      sender: currentUser.id,
      receiver: secondUser.id,
    });

    // Réinitialiser le champ de saisie après l'envoi
    setMsg("");
  };

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.container}
      >
        <Text style={styles.headerText}>
          Chat {currentUser.nom} + {secondUser.nom}
        </Text>

        <FlatList
          style={styles.messagesContainer}
          data={data}
          renderItem={({ item, index }) => {
            const isCurrentUser = item.sender === currentUser.id;
            const color = isCurrentUser ? "#FFF" : "#444"; // Fond sombre
            const textColor = isCurrentUser ? colors.buttonColor : "#fff"; // Texte clair pour l'utilisateur courant

            // Détermine l'image de profil selon l'expéditeur
            const profileImage =
              isCurrentUser
                ? currentUser.uriImage // Image de l'utilisateur courant
                : secondUser.uriImage; // Image de l'autre utilisateur

            // Vérifier si le message précédent est du même utilisateur
            const showProfileImage =
              index === 0 || item.sender !== data[index - 1].sender;

            return (
              <View
                style={[
                  styles.messageContainer,
                  {
                    // Aligner le message de l'utilisateur courant à gauche, celui de l'autre à droite
                    flexDirection: isCurrentUser ? "row-reverse" : "row",
                  },
                ]}
              >
                {showProfileImage && profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  // Si pas d'image, afficher un espace vide
                  <View style={styles.profileImage} />
                )}
                <View
                  style={[
                    styles.message,
                    { backgroundColor: color },
                  ]}
                >
                  <View style={styles.messageContent}>
                    <Text style={[styles.messageText, { color: textColor }]}>
                      {item.body}
                    </Text>
                    <Text style={styles.messageTime}>{item.time}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={(text) => setMsg(text)}
            value={Msg}
            placeholderTextColor="#ccc"
            placeholder="Write a message"
            style={styles.textinput}
          />
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="#555"
            style={styles.sendButton}
            onPress={handleSend}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableHighlight>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    marginTop: 50,
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  messagesContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Fond sombre pour la zone des messages
    width: "95%",
    borderRadius: 10,
    marginVertical: 20,
    padding: 5,
    paddingTop : 20
  },
  messageContainer: {
    flexDirection: "row", // Aligner les images et messages
    marginBottom: 10,
  },
  message: {
    padding: 10,
    marginVertical: 0,
    borderRadius: 8,
    maxWidth: "80%", // Limite la largeur des messages
  },
  messageContent: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 5,
    marginLeft: 5, // Espacement entre l'image et le message
    marginTop: 5, // Aligner verticalement
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 10,
  },
  textinput: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Fond sombre pour l'input
    color: "#fff",
    height: 50,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.buttonColor, // Bleu plus doux pour le bouton
    borderRadius: 10,
    height: 50,
    width: "30%",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
