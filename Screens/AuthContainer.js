import React from "react";
import { StatusBar } from "expo-status-bar";
import { ImageBackground, View } from "react-native";
import { colors, layout } from "../Styles/styles";

export default function AuthContainer({ children }) {
  return (
    <View style={layout.container}>
      <StatusBar style="light" />
      <ImageBackground
        style={{
          height: "100%",
          width: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        resizeMode="cover"
        source={require("../assets/background.png")}
      >
        <View style={layout.innerContainer}>{children}</View>
      </ImageBackground>
    </View>
  );
}
