import { StyleSheet } from "react-native";

export const colors = {
  primaryBackground: "#0005",
  textColor: "white",
  inputBackground: "white",
  buttonColor: "#809fff",
};

export const fonts = {
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textColor,
  },
  input: {
    fontSize: 16,
    padding: 10,
    height: 60,
    width: "90%",
    borderRadius: 2.5,
    textAlign: "center",
    backgroundColor: colors.inputBackground,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
};

export const layout = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  innerContainer: {
    borderRadius: 15,
    backgroundColor: colors.primaryBackground,
    width: "85%",
    height: "auto",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,  // Padding général de 20px tout autour du contenu
  },
  button: {
    backgroundColor: colors.buttonColor, // Blue color for button
    paddingVertical: 15,  // Increase vertical padding for a larger button
    paddingHorizontal: 30, // Horizontal padding for width
    borderRadius: 10, // Border radius for rounded corners
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
  },
});