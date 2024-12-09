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
  const ref_currentIsTyping = ref_unediscussion.child(
    `${currentUser.id}isTyping`
  );
  const ref_secondIsTyping = ref_unediscussion.child(
    `${secondUser.id}isTyping`
  );
  const [isSecondUserTyping, setIsSecondUserTyping] = useState(false);

  const [Msg, setMsg] = useState("");
  const [data, setdata] = useState([]);

  useEffect(() => {
    ref_unediscussion.on("value", (snapshot) => {
      let d = [];
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();

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
    });

    return () => {
      ref_unediscussion.off();
    };
  }, []);

  const extractDate = (timestamp) => {
    return timestamp.split(" ")[0]; // Récupère uniquement "jour/mois/année"
  };

  const extractTime = (timestamp) => {
    return timestamp.split(" ")[1]; // Récupère uniquement l'heure "hh:mm:ss"
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
          {secondUser.pseudo} : {secondUser.nom}
        </Text>

        <FlatList
          style={styles.messagesContainer}
          data={data}
          renderItem={({ item, index }) => {
            const isCurrentUser = item.sender === currentUser.id;
            const color = isCurrentUser ? "#FFF" : "#444";
            const textColor = isCurrentUser ? colors.buttonColor : "#fff";

            const profileImage = isCurrentUser
              ? currentUser.uriImage
              : secondUser.uriImage;

            const showProfileImage =
              index === 0 || item.sender !== data[index - 1].sender;

            const currentMessageDate = extractDate(item.time);
            const previousMessageDate =
              index > 0 ? extractDate(data[index - 1].time) : null;

            return (
              <>
                {index === 0 || currentMessageDate !== previousMessageDate ? (
                  <View style={styles.dateSeparatorContainer}>
                    <Text style={styles.dateSeparatorText}>
                      {currentMessageDate}
                    </Text>
                    <View style={styles.line} />
                  </View>
                ) : null}

                
                <View
                  style={[
                    styles.messageContainer,
                    {
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
        />

        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={(text) => setMsg(text)}
            onFocus={() => ref_currentIsTyping.set(true)}
            onBlur={() => ref_currentIsTyping.set(false)}
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
    padding: 5,
  },
  headerText: {
    marginTop: 50,
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  typingIndicator: {
    fontSize: 14,
    color: "#ccc",
    fontStyle: "italic",
    marginBottom: 10,
  },
  messagesContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    width: "95%",
    borderRadius: 10,
    marginVertical: 20,
    padding: 5,
    paddingTop: 20,
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
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.buttonColor,
    borderRadius: 10,
    height: 50,
    width: "30%",
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
