import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import firebase from "./Config";
import Authentification from "./Screens/Authentification";
import Home from "./Screens/Home";
import NewUser from "./Screens/NewUser";
import Chat from "./Screens/Chat";
import { colors } from "./Styles/styles";
import GroupChat from "./Screens/GroupChat";

const Stack = createNativeStackNavigator();
const auth = firebase.auth();

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const currentId = user.uid;
        const ref_tableProfils = firebase.database().ref("TableProfils").child(currentId);

        // Mettre à jour isConnected dans la base de données
        await ref_tableProfils.update({ isConnected: true }).catch((error) => {
          console.error("Erreur lors de la mise à jour de isConnected :", error);
        });
        ref_tableProfils.onDisconnect().update({ isConnected: false });

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              initialParams={{ currentId: currentUser.uid }}
            />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="GroupChat" component={GroupChat} />
          </>
        ) : (
          <>
            <Stack.Screen name="Authentification" component={Authentification} />
            <Stack.Screen
              name="NewUser"
              component={NewUser}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: colors.buttonColor },
                headerTintColor: "white",
                title: "Retour à authentification",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );  
}
