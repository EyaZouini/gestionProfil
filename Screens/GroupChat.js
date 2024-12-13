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
import firebase from "../Config";
import { colors, layout, fonts } from "../Styles/styles";

const database = firebase.database();
const ref_groupChats = database.ref("groupChats");

export default function GroupChat(props) {
  const currentId = props.route.params.currentId;
  const groupId = props.route.params.groupId;

  const [currentUser, setcurrentUser] = useState({});
  const [Msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [groupName, setGroupName] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchGroupName = async () => {
      const refGroupInfo = database.ref("Groups").child(groupId);
      const snapshot = await refGroupInfo.once("value");
      const data = snapshot.val();
      if (data?.name) {
        setGroupName(data.name);
      }
    };

    fetchGroupName();
  }, [groupId]);

  useEffect(() => {
    const fetchData = async () => {
      const refProfile = database.ref("TableProfils").child(currentId);
      const snapshot = await refProfile.once("value");
      const data = snapshot.val();
      if (data) {
        setcurrentUser(data);
      }
    };
    fetchData();
  }, []);

  const ref_group = ref_groupChats.child(groupId);

  useEffect(() => {
    const onValueChange = ref_group.on("value", (snapshot) => {
      const messages = [];
      snapshot.forEach((message) => {
        messages.push(message.val());
      });
      setData(messages);
    });

    return () => {
      ref_group.off("value", onValueChange);
    };
  }, []);

  const sendMessage = () => {
    if (!Msg.trim()) return;

    const key = ref_group.push().key;
    const ref_message = ref_group.child(key);

    ref_message
      .set({
        body: Msg,
        time: new Date().toLocaleString(),
        senderId: currentUser.id,
        senderName: currentUser.nom,
        senderImage: currentUser.uriImage,
      })
      .then(() => setMsg(""))
      .catch((error) => console.error("Error sending message:", error));
  };

  const extractDate = (timestamp) => timestamp.split(" ")[0];
  const extractTime = (timestamp) => timestamp.split(" ")[1];

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.container}
      >
        <Text style={styles.headerText}>
          {groupName || "Group Chat"}{" "}
          {/* Affiche "Group Chat" par défaut si le nom n'est pas encore chargé */}
        </Text>

        <FlatList
          ref={flatListRef}
          onContentSizeChange={() =>
            flatListRef.current.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
          style={styles.messagesContainer}
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            const isCurrentUser = item.senderId === currentUser.id;
            const color = isCurrentUser ? "#FFF" : "#444";
            const textColor = isCurrentUser ? colors.buttonColor : "#fff";

            const showProfileImage =
              index === 0 || item.senderId !== data[index - 1]?.senderId;

            const currentMessageDate = extractDate(item.time);
            const previousMessageDate =
              index > 0 ? extractDate(data[index - 1]?.time) : null;

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
                    {showProfileImage && (
                      <Text style={styles.senderName}>
                        {item.senderName}
                      </Text>
                    )}
                  <View
                    style={[
                      styles.messageContainer,
                      {
                        flexDirection: isCurrentUser ? "row-reverse" : "row",
                      },
                    ]}
                  >
                    {showProfileImage && item.senderImage ? (
                      <Image
                        source={{ uri: item.senderImage }}
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
        />
        <View style={styles.inputContainer}>
          <TextInput
            value={Msg}
            onChangeText={setMsg}
            placeholderTextColor="#ccc"
            placeholder="Type a message"
            style={styles.textinput}
          />
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="#555"
            style={styles.sendButton}
            onPress={sendMessage}
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: "95%",
    borderRadius: 10,
    marginVertical: 20,
    padding: 5,
    paddingTop: 20,
  },
  messageContainer: {
    flexDirection: "column",
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
  senderName: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: "right",
    marginRight:50,
    color : "#aaa"
  },
  
});
