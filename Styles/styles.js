import { StyleSheet } from "react-native";

export const colors = {
  primaryBackground: "#0005",
  textColor: "white",
  inputBackground: "white",
  buttonColor: "#57acac",
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
    height: 50,
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
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent black
    width: "85%",
    alignItems: "center",
    padding: 20, // Padding inside the box
    marginVertical: 20, 
  },
  button: {
    backgroundColor: colors.buttonColor, // Blue color for button
    paddingVertical: 14,  // Increase vertical padding for a larger button
    paddingHorizontal: 29, // Horizontal padding for width
    borderRadius: 10, // Border radius for rounded corners
    alignItems: "center",
    justifyContent: "center",
    width: "42.5%",
  },
});