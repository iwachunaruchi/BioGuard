import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StorageService } from './src/utils/storage';

export default function App() {
  useEffect(() => {
    // Inicializar datos por defecto al arrancar la app
    StorageService.initializeDefaultData();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}