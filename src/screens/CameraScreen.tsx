import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StorageService } from '../utils/storage';
import { Person, AccessLog } from '../types';
import { useAuth } from '../context/AuthContext';

export default function CameraScreen({ navigation }: any) {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { user } = useAuth();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
        });
        
        if (photo && photo.base64) {
          setCapturedImage(`data:image/jpeg;base64,${photo.base64}`);
          await checkPersonInLists(`data:image/jpeg;base64,${photo.base64}`);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'No se pudo capturar la imagen');
      }
    }
  };

  const checkPersonInLists = async (photoBase64: string) => {
    try {
      const people = await StorageService.getPeople();
      
      // Simulación de reconocimiento facial - en producción usaría una API real
      const matchedPerson = people.find(person => 
        person.photo === photoBase64 || Math.random() > 0.7
      );

      if (matchedPerson) {
        const accessLog: AccessLog = {
          id: Date.now().toString(),
          personId: matchedPerson.id,
          action: matchedPerson.listType === 'whitelist' ? 'access_granted' : 'access_denied',
          timestamp: new Date().toISOString(),
          userId: user?.id || '',
        };

        await StorageService.addAccessLog(accessLog);

        if (matchedPerson.listType === 'whitelist') {
          Alert.alert(
            '✅ Acceso Permitido',
            `${matchedPerson.name} está en la lista blanca`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert(
            '❌ Acceso Denegado',
            `${matchedPerson.name} está en la lista negra`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } else {
        Alert.alert(
          '❓ Persona No Registrada',
          '¿Desea registrar a esta persona?',
          [
            { text: 'Cancelar', onPress: () => navigation.goBack() },
            { 
              text: 'Registrar', 
              onPress: () => navigation.navigate('AddPerson', { photo: photoBase64 }) 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error checking person:', error);
      Alert.alert('Error', 'Error al verificar la persona');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Captura Facial</Text>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <Text style={styles.flipText}>🔄</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.faceFrame}>
            <View style={styles.frame} />
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  flipButton: {
    padding: 10,
  },
  flipText: {
    fontSize: 24,
    color: 'white',
  },
  faceFrame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 250,
    height: 350,
    borderWidth: 3,
    borderColor: '#4299e1',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#1a365d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});