import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Image,
  ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import de Ionicons
import { fonts, colors } from "../../Styles/styles";
import firebase from "../../Config";

const database = firebase.database();
const ref_Groups = database.ref("Groups");

const GroupPhoto = ({ images }) => {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={{ width: 50, height: 50, borderRadius: 25 }}
      />
    );
  }

  if (images.length === 2) {
    return (
      <View style={{ width: 50, height: 50, position: "relative" }}>
        <Image
          source={{ uri: images[0] }}
          style={{
            width: 35,
            height: 35,
            borderRadius: 17.5,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
        <Image
          source={{ uri: images[1] }}
          style={{
            width: 35,
            height: 35,
            borderRadius: 17.5,
            position: "absolute",
            right: 0,
            bottom: 0,
          }}
        />
      </View>
    );
  }

  if (images.length >= 3) {
    const selectedImages = images.slice(0, 3); // Prendre jusqu'à 3 images
    return (
      <View style={{ width: 50, height: 50, position: "relative" }}>
        <Image
          source={{ uri: selectedImages[0] }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            position: "absolute",
            top: 0,
            left: 10,
          }}
        />
        <Image
          source={{ uri: selectedImages[1] }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            position: "absolute",
            bottom: 0,
            left: 0,
          }}
        />
        <Image
          source={{ uri: selectedImages[2] }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        />
      </View>
    );
  }
}

export default function Group(props) {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const currentId = props.route.params.currentId;
  const userGroups = filteredGroups.filter(group => group.members && group.members[currentId]);
const otherGroups = filteredGroups.filter(group => !group.members || !group.members[currentId]);


  // Fetch groups from Firebase
  useEffect(() => {
    ref_Groups.on("value", (snapshot) => {
      const groupList = [];
      const profileRef = database.ref("TableProfils");
  
      snapshot.forEach((group) => {
        const groupData = group.val();
        const memberIds = Object.keys(groupData.members || {});
  
        // Récupérer les URI des membres pour les photos
        const memberPromises = memberIds.map((id) =>
          profileRef.child(id).once("value")
        );
  
        Promise.all(memberPromises).then((profiles) => {
          const images = profiles
            .map((snap) => snap.val()?.uriImage)
            .filter((uri) => uri); // Exclure les images nulles ou non définies
  
          groupList.push({ ...groupData, images });
          setGroups(groupList);
          setFilteredGroups(groupList); // Initialement, tous les groupes sont affichés
        });
      });
    });
  
    return () => ref_Groups.off();
  }, []);
  

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredGroups(groups); // Réinitialiser la liste si aucun texte de recherche
    } else {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  };

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
      members: { [currentId]: true }, // Ajoute l'utilisateur qui crée le groupe
    };
  
    ref_Groups
      .child(groupId)
      .set(newGroup)
      .then(() => {
        setNewGroupName("");
        setNewGroupDescription("");
        setModalVisible(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la création du groupe :", error);
      });
  };
  
  

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
    >
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#aaa"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un groupe..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.profileLine}></View>
      

      <FlatList
  style={styles.groupList}
  ListHeaderComponent={() => (
    <>
      {userGroups.length > 0 && (
        <View>
          {userGroups.map((group) => (
            <View key={group.id} style={styles.groupItem}>
              <GroupPhoto images={group.images || []} />
              <View style={styles.groupTextContainer}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDescription}>{group.description}</Text>
              </View>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() =>
                  props.navigation.navigate("GroupChat", {
                    currentId,
                    groupId: group.id,
                  })
                }
              >
                <Ionicons name="chatbubble-ellipses" size={25} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {userGroups.length > 0 && <View style={[styles.profileLine, { marginTop: 10, alignSelf: "center", width: "96%" }]} />}

      <Text style={styles.sectionTitle}>Groupes Disponibles</Text>
    </>
  )}
  data={otherGroups}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.groupItem}>
      <GroupPhoto images={item.images || []} />
      <View style={styles.groupTextContainer}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => {
          const updatedMembers = { ...item.members, [currentId]: true };
          ref_Groups
            .child(item.id)
            .update({ members: updatedMembers })
            .then(() => {
              props.navigation.navigate("GroupChat", {
                currentId,
                groupId: item.id,
              });
            })
            .catch((error) => {
              console.error("Erreur lors de l'ajout :", error);
            });
        }}
      >
        <Text style={{ color: "white", fontSize: 14 }}>Rejoindre</Text>
      </TouchableOpacity>
    </View>
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
            <Text style={[fonts.title, { marginBottom: 20 ,color: colors.buttonColor}]}>Créer un Groupe</Text>

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
    paddingTop: 40
  },
  groupList: {
    width: "90%",
    borderRadius: 8,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 10,
    marginTop: 35,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "90%",
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#000",
  },
  groupItem: {
    flexDirection: "row",
    justifyContent: "space-between", // Espacement entre les deux
  alignItems: "center",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  groupTextContainer: {
    flex: 1, // Permet au texte de prendre tout l'espace disponible
    marginLeft:15
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
  chatButton: {
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textColor,
    marginTop:10,
    textAlign: "center", // Centre le texte
  alignSelf: "center",
  },
  
});
