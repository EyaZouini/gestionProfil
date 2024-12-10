import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; 
import { fonts, colors } from "../../Styles/styles";
import firebase from "../../Config";

const database = firebase.database();
const ref_Groups = database.ref("Groups");

export default function Group(props) {
  const [groups, setGroups] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const currentId = props.route.params.currentId;

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

  const createGroup = () => {
    if (!newGroupName.trim()) {
      alert("Le nom du groupe est requis.");
      return;
    }

    const groupId = ref_Groups.push().key;
    const newGroup = {
      id: groupId,
      name: newGroupName,
      description: newGroupDescription || "",
      members: { [currentId]: true },
    };

    ref_Groups.child(groupId).set(newGroup);
    setNewGroupName("");
    setNewGroupDescription("");
    setModalVisible(false); // Fermer la pop-up
    alert("Groupe créé avec succès !");
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
    >
      <Text style={[fonts.title, { marginTop: 60 }]}>Liste des Groupes</Text>

      <View style={styles.profileLine}></View>

      <Text style={[fonts.title, { marginTop: 20 }]}>Discuter</Text>

      {/* Liste des groupes */}
      <FlatList
        style={styles.groupList}
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.groupItem}
            onPress={() => {
              if (!item.members || !item.members[currentId]) {
                const updatedMembers = { ...item.members, [currentId]: true };

                ref_Groups
                  .child(item.id)
                  .update({ members: updatedMembers })
                  .then(() => {
                    props.navigation.navigate("GroupChat", {
                      currentId: currentId,
                      groupId: item.id,
                    });
                  })
                  .catch((error) => {
                    console.error("Error adding user to group:", error);
                  });
              } else {
                props.navigation.navigate("GroupChat", {
                  currentId: currentId,
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

      {/* Bouton flottant (icône "+") */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal (pop-in) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[fonts.title, { marginBottom: 20 }]}>Créer un Groupe</Text>

            <View style={styles.inputGroup}>
              <Icon name="group" size={20} color={colors.buttonColor} />
              <TextInput
                style={styles.input}
                placeholder="Nom du groupe"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Icon name="description" size={20} color={colors.buttonColor} />
              <TextInput
                style={styles.input}
                placeholder="Description (optionnelle)"
                value={newGroupDescription}
                onChangeText={setNewGroupDescription}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={createGroup}
              >
                <Text style={styles.buttonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  groupList: {
    width: "90%",
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
    width: "85%",
    height: 2,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.buttonColor,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignItems: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.buttonColor,
    width: "100%",
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: colors.buttonColor,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
