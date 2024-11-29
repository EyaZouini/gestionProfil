import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
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
const database = firebase.database();

export default function MyProfil() {
  const [nom, setNom] = useState();
  const [pseudo, setpseudo] = useState();
  const [telephone, setTelephone] = useState();
  const [isDefaultImage, setisDefaultImage] = useState(true);
  const [uriImage, seturiImage] = useState();

  // Create refs for each TextInput
  const pseudoInputRef = useRef(null);
  const telephoneInputRef = useRef(null);

  // Function to pick an image from the user's device
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.cancelled) {
      seturiImage(pickerResult.uri);
      setisDefaultImage(true); // Set default image flag to false
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={layout.innerContainer}>
        <Text style={[fonts.title, { marginTop: 15 }, { marginBottom: 10 }]}>My Account</Text>

        <TouchableHighlight onPress={pickImage}>
          <Image
            source={isDefaultImage ? require("../../assets/profil.png") : { uri: uriImage }}
            style={{
              height: 200,
              width: 200,
            }}
          />
        </TouchableHighlight>

        {/* Wrap the form inside the innerContainer */}
        <TextInput
          onChangeText={(text) => setNom(text)}
          textAlign="center"
          placeholderTextColor="#000"
          placeholder="Nom"
          keyboardType="name-phone-pad"
          style={[fonts.input, { marginBottom: 10, borderRadius: 10, color: "#000" }]}
          returnKeyType="next" // Show next button on keyboard
          onSubmitEditing={() => pseudoInputRef.current.focus()} // Move to next field
        />

        <TextInput
          ref={pseudoInputRef} // Attach ref to this input
          onChangeText={(text) => setpseudo(text)}
          textAlign="center"
          placeholderTextColor="#000"
          placeholder="Pseudo"
          keyboardType="name-phone-pad"
          style={[fonts.input, { marginBottom: 10, borderRadius: 10, color: "#000" }]}
          returnKeyType="next" // Show next button on keyboard
          onSubmitEditing={() => telephoneInputRef.current.focus()} // Move to next field
        />

        <TextInput
          ref={telephoneInputRef} // Attach ref to this input
          onChangeText={(text) => setTelephone(text)}
          placeholderTextColor="#000"
          textAlign="center"
          placeholder="Télephone"
          style={[fonts.input, { marginBottom: 10, borderRadius: 10, color: "#000" }]}
          returnKeyType="done" // Show done button on keyboard
          onSubmitEditing={() => {}} // No further action after this field
        />

        <TouchableHighlight
          onPress={() => {
            const ref_tableProfils = database.ref("TableProfils");
            const key = ref_tableProfils.push().key;
            const ref_unProfil = ref_tableProfils.child("unProfil" + key);
            ref_unProfil.set({
              nom,
              pseudo,
              telephone,
            });
          }}
          style={[layout.button, styles.saveButton]}
          underlayColor={colors.buttonColor}
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
