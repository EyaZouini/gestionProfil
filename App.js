import Authentification from "./Screens/Authentification";
import Home from "./Screens/Home";
import NewUser from "./Screens/NewUser";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Authentification"
          component={Authentification}
        ></Stack.Screen>
        <Stack.Screen
          name="NewUser"
          component={NewUser}
          options={{ headerShown: true }}
        ></Stack.Screen>
        <Stack.Screen name="Home" component={Home}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
