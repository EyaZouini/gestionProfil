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
import React, { useState, useEffect, useRef } from "react";
import { fonts, layout, colors } from "../Styles/styles";
import firebase from "../Config";
import { supabase } from "../Config";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/MaterialIcons";
import MapView, { Marker } from 'react-native-maps';

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
  const ref_currentIsTyping = ref_unediscussion.child(
    `${currentUser.id}isTyping`
  );
  const ref_secondIsTyping = ref_unediscussion.child(
    `${secondUser.id}isTyping`
  );
  const [isSecondUserTyping, setIsSecondUserTyping] = useState(false);

  const [Msg, setMsg] = useState("");
  const [data, setdata] = useState([]);
  const flatListRef = useRef(null);
  const [lastSeenMessage, setLastSeenMessage] = useState(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [data]);

  useEffect(() => {
    ref_unediscussion.on("value", (snapshot) => {
      let d = [];
      snapshot.forEach((childSnapshot) => {
        const message = { key: childSnapshot.key, ...childSnapshot.val() };

        if (
          message.body &&
          message.sender &&
          message.receiver &&
          message.time
        ) {
          d.push(message);
        }
      });

      setdata(d);

      // Mise à jour de l'état "vu" pour le dernier message
      const lastMessage = d[d.length - 1];
      if (
        lastMessage &&
        lastMessage.receiver === currentUser.id &&
        !lastMessage.seen
      ) {
        ref_unediscussion.child(lastMessage.key).update({ seen: true });
        setLastSeenMessage(lastMessage.key);
      }
    });
    return () => {
      ref_unediscussion.off();
    };
  }, []);

  const extractDate = (timestamp) => {
    return timestamp.split(" ")[0].trim(); // "01/12/2024"
  };

  const extractTime = (timestamp) => {
    return timestamp.split(" ")[1]; // "1:32:10 PM"
  };

  const handleSend = () => {
    const key = ref_unediscussion.push().key;
    const ref_unmsg = ref_unediscussion.child(key);
    ref_unmsg.set({
      body: Msg,
      time: new Date().toLocaleString(),
      sender: currentUser.id,
      receiver: secondUser.id,
    });

    setMsg("");
  };

  const handleSendLocation = async () => {
    try {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      // Get the user's current position
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Create the Google Maps link
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // Send the location as a message
      const key = ref_unediscussion.push().key;
      const ref_unmsg = ref_unediscussion.child(key);
      ref_unmsg.set({
        body: `Location: ${mapUrl}`,
        type: "location", // Custom type for location messages
        time: new Date().toLocaleString(),
        sender: currentUser.id,
        receiver: secondUser.id,
      });

      console.log("Location sent:", mapUrl);
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  const handleSendImage = async () => {
    try {
      // Ouvrir la bibliothèque pour choisir une image
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!pickerResult.canceled) {
        const selectedImageUri = pickerResult.assets[0].uri;

        // Téléverser l'image sur Supabase
        const response = await fetch(selectedImageUri);
        const blob = await response.blob();
        const arraybuffer = await new Response(blob).arrayBuffer();

        // Générez un chemin unique une seule fois
        const filePath = `${iddisc}/${new Date().getTime()}.jpg`;

        // Upload de l'image
        const { error } = await supabase.storage
          .from("ChatImages")
          .upload(filePath, arraybuffer, { upsert: false });

        if (error) {
          console.error("Erreur d'upload :", error.message);
          return;
        }

        console.log("Upload réussi :", filePath);

        // Récupérer l'URL publique de l'image
        const { data } = supabase.storage
          .from("ChatImages")
          .getPublicUrl(filePath);
        const imageUrl = data.publicUrl;

        // Envoyer le message avec l'URL de l'image
        const key = ref_unediscussion.push().key;
        const ref_unmsg = ref_unediscussion.child(key);
        await ref_unmsg.set({
          body: imageUrl,
          type: "image", // Indique que le message est une image
          time: new Date().toLocaleString(),
          sender: currentUser.id,
          receiver: secondUser.id,
        });

        console.log("Image envoyée avec succès :", imageUrl);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'image :", error);
    }
  };

  useEffect(() => {
    const secondUserTypingListener = ref_secondIsTyping.on(
      "value",
      (snapshot) => {
        setIsSecondUserTyping(snapshot.val() || false);
      }
    );

    return () => {
      ref_secondIsTyping.off("value", secondUserTypingListener);
    };
  }, []);

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.container}
      >
        <Text style={styles.headerText}>
          {secondUser.pseudo}
        </Text>

        <FlatList
          ref={flatListRef}
          style={styles.messagesContainer}
          data={data}
          renderItem={({ item, index }) => {
            const isCurrentUser = item.sender === currentUser.id;
            const color = isCurrentUser ? "#FFF" : "#444";
            const textColor = isCurrentUser ? colors.buttonColor : "#fff";

            if (item.type === "image") {
              // Affichage d'une image
              return (
                <View
                  style={[
                    styles.messageContainer,
                    { flexDirection: isCurrentUser ? "row-reverse" : "row" },
                  ]}
                >
                  <Image
                    source={{ uri: item.body }}
                    style={styles.chatImage} // Ajoutez un style pour les images
                  />
                </View>
              );
            }

            if (item.type === "location") {
              const mapUrl = item.body;
              const match = mapUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
              const latitude = parseFloat(match[1]);
              const longitude = parseFloat(match[2]);
            
              return (
                <View style={[styles.messageContainer, { flexDirection: isCurrentUser ? "row-reverse" : "row" , marginRight:45, marginLeft:45}]}>
                  <MapView
                    style={{ width: 200, height: 200 }}
                    initialRegion={{
                      latitude,
                      longitude,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421,
                    }}
                  >
                    <Marker coordinate={{ latitude, longitude }} />
                  </MapView>
                </View>
              );
            }

            const profileImage = isCurrentUser
              ? currentUser.uriImage
              : secondUser.uriImage;

            const showProfileImage =
              index === 0 || item.sender !== data[index - 1]?.sender;

            // Normalisation des dates
            const normalizeDate = (timestamp) => {
              return extractDate(timestamp).replace(/,$/, "").trim(); // Supprime les virgules finales
            };

            const currentMessageDate = normalizeDate(item.time);
            const previousMessageDate =
              index > 0 ? normalizeDate(data[index - 1]?.time) : null;

            // Condition corrigée pour le séparateur de date
            const showDateSeparator =
              index === 0 ||
              (previousMessageDate &&
                currentMessageDate !== previousMessageDate);

            const isLastMessage = index === data.length - 1; // Vérifie si c'est le dernier message

            return (
              <>
                {showDateSeparator && (
                  <View style={styles.dateSeparatorContainer}>
                    <Text style={styles.dateSeparatorText}>
                      {currentMessageDate}
                    </Text>
                    <View style={styles.line} />
                  </View>
                )}

                <View
                  style={[
                    styles.messageContainer,
                    {
                      flexDirection: isCurrentUser ? "row-reverse" : "row",
                    },
                  ]}
                >
                  {(showProfileImage && profileImage) || showDateSeparator ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.profileImage} />
                  )}
                  <View style={[styles.message, { backgroundColor: color }]}>
                    <View style={styles.messageContent}>
                      <Text style={[styles.messageText, { color: textColor }]}>
                        {item.body}
                      </Text>
                      <Text style={styles.messageTime}>
                        {extractTime(item.time)}
                      </Text>
                    </View>
                  </View>
                </View>
                {isLastMessage &&
                  isCurrentUser &&
                  item.seen && ( // Affiche seulement pour le dernier message vu
                    <Text style={styles.seenStatus}>· Seen</Text>
                  )}
              </>
            );
          }}
          ListFooterComponent={
            isSecondUserTyping && (
              <Text style={styles.typingIndicator}>
                {secondUser.nom} is typing...
              </Text>
            )
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />

        <View style={styles.inputContainer}>
          <TouchableHighlight
            style={styles.imageButton}
            onPress={handleSendLocation}
          >
            <Text style={styles.imageButtonText}>📍</Text>
          </TouchableHighlight>

          <TouchableHighlight
            style={styles.imageButton}
            onPress={handleSendImage}
          >
            <Text style={styles.imageButtonText}>📷</Text>
          </TouchableHighlight>
          <TextInput
            onChangeText={(text) => setMsg(text)}
            onFocus={() => {
              console.log("User started typing");
              ref_currentIsTyping.set(true);
            }}
            onBlur={() => {
              console.log("User stopped typing");
              ref_currentIsTyping.set(false);
            }}
            value={Msg}
            placeholderTextColor="#ccc"
            placeholder="Write a message"
            style={styles.textinput}
          />
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="#555"
            onPress={handleSend}
          >
            <Icon name="send" size={30} color="fff" />
          </TouchableHighlight>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 5,
  },
  seenStatus: {
    fontSize: 14,
    color: "#aaa",
    fontStyle: "italic",
    alignSelf: "flex-end",
    marginRight: 50,
  },
  headerText: {
    marginTop: 50,
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  chatImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginLeft: 45,
    marginRight: 45,
  },
  typingIndicator: {
    height: 20,
    fontSize: 14,
    color: "#ccc",
    fontStyle: "italic",
    marginBottom: 20,
    marginLeft: 20,
  },
  messagesContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: "95%",
    borderRadius: 10,
    marginVertical: 10,
    padding: 5,
    paddingTop: 20,
    paddingBottom: 5,
  },
  messageContainer: {
    flexDirection: "colomn",
    marginBottom: 10,
  },
  message: {
    padding: 10,
    marginVertical: 0,
    borderRadius: 8,
    maxWidth: "80%",
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
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 50,
    marginRight: 5,
    marginLeft: 5,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 10,
  },
  imageButton: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 10,
    height: 50,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  textinput: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    color: "#fff",
    height: 50,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  dateSeparatorContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dateSeparatorText: {
    color: "#aaa",
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    fontStyle: "italic",
  },
  line: {
    height: 1,
    backgroundColor: "#aaa",
    width: "80%",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
