import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; 
import { fonts, layout, colors } from "../../Styles/styles";
import firebase from "../../Config";

const database = firebase.database();
const ref_Groups = database.ref("Groups");

export default function Group(props) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const currentid = props.route.params.currentid;

  // Fetch groups from Firebase
  useEffect(() => {
    ref_Groups.on("value", (snapshot) => {
      const groupList = [];
      snapshot.forEach((group) => {
        groupList.push(group.val());
      });
      setGroups(groupList);
    });

    return () => ref_Groups.off();
  }, []);

  // Function to create a new group
  const createGroup = () => {
    if (!newGroupName.trim()) {
      alert("Group name cannot be empty.");
      return;
    }

    const groupId = ref_Groups.push().key;
    const newGroup = {
      id: groupId,
      name: newGroupName,
      description: newGroupDescription || "",
      members: { [currentid]: true },
    };

    ref_Groups.child(groupId).set(newGroup);
    setNewGroupName("");
    setNewGroupDescription("");
    alert("Group created successfully!");
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
    >
      {/* Header */}
      <Text style={[fonts.title, { marginTop: 60 }]}>Creer un Groupe</Text>

      {/* Create Group */}
      <View
        style={[
          layout.innerContainer,
          {
            height: "30%",
            alignItems: "center",
          },
        ]}
      >
        <View style={styles.inputGroup}>
          <Icon
            name="group"
            size={20}
            color={colors.buttonColor}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nom du groupe"
            placeholderTextColor={colors.placeholder}
            value={newGroupName}
            onChangeText={setNewGroupName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon
            name="description"
            size={20}
            color={colors.buttonColor}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (optionelle)"
            placeholderTextColor={colors.placeholder}
            value={newGroupDescription}
            onChangeText={setNewGroupDescription}
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={createGroup}>
          <Text style={styles.createButtonText}>Creer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileLine}></View>

      <Text style={[fonts.title, { marginTop: 20 }]}>Discuter</Text>

      {/* List Groups */}
      <FlatList
        style={styles.groupList}
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupItem}
            onPress={() => {
              if (!item.members || !item.members[currentid]) {
                // Add the current user to the members
                const updatedMembers = { ...item.members, [currentid]: true };

                ref_Groups
                  .child(item.id)
                  .update({ members: updatedMembers })
                  .then(() => {
                    console.log(
                      `User ${currentid} added to group ${item.name}`
                    );
                    navigation.navigate("GroupChat", {
                      currentid: currentid,
                      groupId: item.id,
                    });
                  })
                  .catch((error) => {
                    console.error("Error adding user to group:", error);
                  });
              } else {
                // User is already a member, just navigate

                props.navigation.navigate("GroupChat", {
                  currentid: currentid,
                  groupId: item.id,
                });
              }
            }}
          >
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
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
  createContainer: {
    backgroundColor: "#FFF3",
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    width: "90%",
    alignItems: "center",
  },
  input: {
    fontWeight: "bold",
    backgroundColor: "#0004",
    fontSize: 20,
    color: "#fff",
    width: "75%",
    height: 50,
    borderRadius: 10,
    margin: 5,
  },
  createButton: {
    width: "60%",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: colors.buttonColor,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  groupList: {
    width: "95%",
    borderRadius: 8,
  },
  groupItem: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  groupDescription: {
    fontSize: 14,
    color: "#cdcdcd",
  },

  profileLine: {
    width: "85%", // Peut être ajusté pour correspondre à votre design
    height: 2,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Utilisez la couleur que vous préférez
    alignItems: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.buttonColor,
    borderWidth: 2,
    borderRadius: 10,
    padding: 5,
    marginVertical: 5,
    width: "100%",
    backgroundColor: colors.inputBackground,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
});
