import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import firebase from "../../Config";
const database = firebase.database();

export default function MyProfil() {
  const [nom, setNom] = useState();
  const [pseudo, setpseudo] = useState();
  const [telephone, setTelephone] = useState();
  const [isDefaultImage, setisDefaultImage] = useState(true);
  const [uriImage, seturiImage] = useState();

  // Function to pick an image from the user's device
  const pickImage = async () => {
    // Request permission to access the device's gallery
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }

    // Launch the image picker and allow the user to pick an image
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.cancelled) {
      // If the user picks an image, update the state
      seturiImage(pickerResult.uri);
      setisDefaultImage(true); // Set default image flag to false
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/imgbleu.jpg")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Text style={styles.textstyle}>My Account</Text>

      <TouchableHighlight onPress={pickImage}>
        <Image
          source={isDefaultImage ? require("../../assets/profil.png") : { uri: uriImage }}
          style={{
            height: 200,
            width: 200,
          }}
        />
      </TouchableHighlight>

      <TextInput
        onChangeText={(text) => {
          setNom(text);
        }}
        textAlign="center"
        placeholderTextColor="#fff"
        placeholder="Nom"
        keyboardType="name-phone-pad"
        style={styles.textinputstyle}
      ></TextInput>
      <TextInput
        onChangeText={(text) => {
          setpseudo(text);
        }}
        textAlign="center"
        placeholderTextColor="#fff"
        placeholder="Pseudo"
        keyboardType="name-phone-pad"
        style={styles.textinputstyle}
      ></TextInput>
      <TextInput
        onChangeText={(text) => {
          setTelephone(text);
        }}
        placeholderTextColor="#fff"
        textAlign="center"
        placeholder="Télephone"
        style={styles.textinputstyle}
      ></TextInput>
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
        activeOpacity={0.5}
        underlayColor="#DDDDDD"
        style={{
          marginBottom: 10,
          borderColor: "#00f",
          borderWidth: 2,
          backgroundColor: "#08f6",
          textstyle: "italic",
          fontSize: 24,
          height: 60,
          width: "50%",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
          marginTop: 20,
        }}
      >
        <Text
          style={{
            color: "#FFF",
            fontSize: 24,
          }}
        >
          Save
        </Text>
      </TouchableHighlight>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  textinputstyle: {
    fontWeight: "bold",
    backgroundColor: "#0004",
    fontSize: 20,
    color: "#fff",
    width: "75%",
    height: 50,
    borderRadius: 10,
    margin: 5,
  },
  textstyle: {
    fontSize: 40,
    fontFamily: "serif",
    color: "#fff",
    fontWeight: "bold",
  },
  container: {
    color: "blue",
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
