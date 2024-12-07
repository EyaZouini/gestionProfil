import { StatusBar } from "expo-status-bar";
import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import firebase from "../../Config";
import { fonts, layout, colors } from "../../Styles/styles";
import { supabase } from "../../Config";
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
  const [imageModified, setimageModified] = useState(false)

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
      setimageModified(false)

    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du profil : ",
        error
      );
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={layout.innerContainer}>
        <Text style={[fonts.title, { marginTop: 15 }, { marginBottom: 10 }]}>
          My Account
        </Text>

        <TouchableHighlight onPress={pickImage}>
          <Image
            source={
              isDefaultImage
                ? require("../../assets/profil.png")
                : { uri: uriImage }
            }
            style={{
              borderRadius: 100,
              height: 200,
              width: 200,
            }}
          />
        </TouchableHighlight>

        {/* Wrap the form inside the innerContainer */}
        <TextInput
          value={nom}
          onChangeText={(text) => handleInputChange("nom", text)}
          textAlign="center"
          placeholderTextColor="#000"
          placeholder="Nom"
          keyboardType="name-phone-pad"
          style={[fonts.input, { marginTop: 20, marginBottom: 10, borderRadius: 10, color: "#000" }]}
          returnKeyType="next" // Show next button on keyboard
          onSubmitEditing={() => pseudoInputRef.current.focus()} // Move to next field
        />

        <TextInput
          value={pseudo}
          ref={pseudoInputRef} // Attach ref to this input
          onChangeText={(text) => handleInputChange("pseudo", text)}
          textAlign="center"
          placeholderTextColor="#000"
          placeholder="Pseudo"
          keyboardType="name-phone-pad"
          style={[fonts.input, { marginBottom: 10, borderRadius: 10, color: "#000" }]}
          returnKeyType="next" // Show next button on keyboard
          onSubmitEditing={() => telephoneInputRef.current.focus()} // Move to next field
        />

        <TextInput
          value={telephone}
          ref={telephoneInputRef} // Attach ref to this input
          onChangeText={(text) => handleInputChange("telephone", text)}
          placeholderTextColor="#000"
          textAlign="center"
          placeholder="Télephone"
          style={[fonts.input, { marginBottom: 10, borderRadius: 10, color: "#000" }]}
          returnKeyType="done" // Show done button on keyboard
          onSubmitEditing={() => {}} // No further action after this field
        />

        <TouchableHighlight
          onPress={handleSave}
          style={[layout.button, styles.saveButton, { backgroundColor: isModified ? colors.buttonColor : "#ccc" }]} // Désactivation du bouton si non modifié
          underlayColor={isModified ? colors.buttonColor : "#aaa"}
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
  saveButton: {
    width: "50%",
    marginTop: 20,
    marginBottom: 20,
  },
});
