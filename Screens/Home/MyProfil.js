import { StatusBar } from "expo-status-bar";
import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import firebase from "../../Config";
import { fonts, layout, colors } from "../../Styles/styles";
import { supabase } from "../../Config";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import des icônes
const database = firebase.database();

export default function MyProfil(props) {
  const currentId = props.route.params.currentId;
  console.log("props.route.params :", props.route.params);

  const [nom, setNom] = useState("");
  const [pseudo, setpseudo] = useState("");
  const [telephone, setTelephone] = useState("");
  const [uriImage, seturiImage] = useState("");
  const [isDefaultImage, setisDefaultImage] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [imageModified, setimageModified] = useState(false);

  // Create refs for each TextInput
  const pseudoInputRef = useRef(null);
  const telephoneInputRef = useRef(null);

  useEffect(() => {
    const ref_tableProfils = database.ref("TableProfils").child(currentId);
    ref_tableProfils.once("value", (snapshot) => {
      const profileData = snapshot.val();
      console.log("Fetched profile data:", profileData); // Log data to check
      if (profileData) {
        setNom(profileData.nom || "");
        setpseudo(profileData.pseudo || "");
        setTelephone(profileData.telephone || "");
        seturiImage(profileData.uriImage || "");
        setisDefaultImage(profileData.uriImage ? false : true);

        // If profile is incomplete, show alert or redirect
        if (!profileData.nom || !profileData.pseudo || !profileData.telephone) {
          alert("Veuillez compléter votre profil avant de continuer.");
        }
      }
    });
  }, [currentId]);

  // Compare les données pour détecter des modifications
  const handleInputChange = (field, value) => {
    switch (field) {
      case "nom":
        setNom(value);
        break;
      case "pseudo":
        setpseudo(value);
        break;
      case "telephone":
        setTelephone(value);
        break;
      default:
        break;
    }
    setIsModified(true); // Marquer comme modifié
  };

  const uploadImageToSupaBase = async () => {
    // Transforme l'URI en blob pour l'upload
    const response = await fetch(uriImage);
    const blob = await response.blob();
    const arraybuffer = await new Response(blob).arrayBuffer();

    // Upload de l'image dans Supabase
    const { error } = await supabase.storage
      .from("ProfileImage") // Accède au bon bucket
      .upload(currentId + ".jpg", arraybuffer, {
        upsert: true, // Écrase l'image si elle existe déjà
      });

    if (error) {
      console.error("Erreur lors de l'upload de l'image :", error.message);
      return null;
    }

    // Récupère l'URL publique de l'image uploadée
    const { data } = supabase.storage
      .from("ProfileImage")
      .getPublicUrl(currentId + ".jpg");

    return data.publicUrl; // Retourne l'URL publique
  };

  // Function to pick an image from the user's device
  const pickImage = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.mediaTypes,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      seturiImage(pickerResult.assets[0].uri);
      setisDefaultImage(false); // Set default image flag to false
      setIsModified(true); // Marquer comme modifié
      setimageModified(true);
    }
  };

  const handleSave = async () => {
    try {
      let imageUrl = "";

      // Upload the image to Supabase only if it's modified
      if (imageModified) {
        console.log("Uploading image to Supabase...");
        imageUrl = await uploadImageToSupaBase();
        console.log("Image uploaded. Public URL:", imageUrl);
      } else {
        imageUrl = uriImage; // If no new image is picked, keep the old one
      }

      // Update Firebase with the new profile data, including the image URL
      const ref_tableProfils = database.ref("TableProfils");
      const ref_unProfil = ref_tableProfils.child(currentId);

      await ref_unProfil.update({
        nom,
        pseudo,
        telephone,
        uriImage: imageUrl, // Use existing image URL if no new image
      });

      console.log("Profil mis à jour avec succès.");
      setIsModified(false);
      setimageModified(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil : ", error);
    }
  };
  const handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        navigation.replace("Authentification");
      })
      .catch((error) =>
        console.error("Erreur lors de la déconnexion :", error)
      );
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View
        style={[
          styles.header,
          {
            position: "absolute",
            top: 80,
            alignItems: "center",
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* alignItems: "center" aligne l'icône et le texte verticalement */}
          <Icon
            name="person"
            size={30}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          {/* Ajout d'un espacement entre l'icône et le texte */}
          <Text style={fonts.title}>Mon Profil</Text>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileLine}></View>

      <View
        style={[
          layout.innerContainer,
          {
            height: "75%",
            position: "absolute",
            bottom: 30,
            alignItems: "center",
          },
        ]}
      >
        <TouchableHighlight onPress={pickImage}>
          <View style={styles.imageContainer}>
            <Image
              source={
                isDefaultImage
                  ? require("../../assets/profil.png")
                  : { uri: uriImage }
              }
              style={styles.profileImage}
            />
            <View style={styles.editIcon}>
              <Icon name="edit" size={20} color="#fff" />
            </View>
          </View>
        </TouchableHighlight>

        <View style={styles.inputGroup}>
          <Icon
            name="person"
            size={20}
            color={colors.buttonColor}
            style={styles.inputIcon}
          />
          <TextInput
            value={nom}
            onChangeText={(text) => handleInputChange("nom", text)}
            placeholderTextColor={colors.placeholder}
            placeholder="Nom"
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => pseudoInputRef.current.focus()}
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon
            name="alternate-email"
            size={20}
            color={colors.buttonColor}
            style={styles.inputIcon}
          />
          <TextInput
            value={pseudo}
            ref={pseudoInputRef}
            onChangeText={(text) => handleInputChange("pseudo", text)}
            placeholderTextColor={colors.placeholder}
            placeholder="Pseudo"
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => telephoneInputRef.current.focus()}
          />
        </View>

        <View style={styles.inputGroup}>
          <Icon
            name="phone"
            size={20}
            color={colors.buttonColor}
            style={styles.inputIcon}
          />
          <TextInput
            value={telephone}
            ref={telephoneInputRef}
            onChangeText={(text) => handleInputChange("telephone", text)}
            placeholderTextColor={colors.placeholder}
            placeholder="Téléphone"
            style={styles.input}
            returnKeyType="done"
          />
        </View>

        <TouchableHighlight
          onPress={handleSave}
          style={[
            layout.button,
            styles.saveButton,
            {
              backgroundColor: isModified
                ? colors.buttonColor
                : "rgba(0, 0, 0, 0.15)",
            },
          ]} // Désactivation du bouton si non modifié
          underlayColor={
            isModified ? colors.buttonColor : "rgba(0, 0, 0, 0.15)"
          }
          disabled={!isModified} // Désactive le bouton si non modifié
        >
          <Text style={fonts.buttonText}>Save</Text>
        </TouchableHighlight>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "95%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileLine: {
    width: "85%", // Peut être ajusté pour correspondre à votre design
    height: 2,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Utilisez la couleur que vous préférez
    position: "absolute",
    top: 130,
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 30,
    marginTop: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.buttonColor,
  },

  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.buttonColor,
    borderRadius: 15,
    padding: 5,
  },
  saveButton: {
    width: "60%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 115,
    marginBottom: 20,
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
