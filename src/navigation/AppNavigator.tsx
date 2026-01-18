import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CameraScreen from '../screens/CameraScreen';
import PeopleListScreen from '../screens/PeopleListScreen';
import AddPersonScreen from '../screens/AddPersonScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // O un componente de carga
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Rutas protegidas
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="People" component={PeopleListScreen} />
            <Stack.Screen name="AddPerson" component={AddPersonScreen} />
            <Stack.Screen name="Whitelist" component={PeopleListScreen} initialParams={{ filter: 'whitelist' }} />
            <Stack.Screen name="Blacklist" component={PeopleListScreen} initialParams={{ filter: 'blacklist' }} />
          </>
        ) : (
          // Rutas públicas
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}