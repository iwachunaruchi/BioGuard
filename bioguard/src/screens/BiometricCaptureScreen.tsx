import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { enrollService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface BiometricCaptureScreenProps {
  navigation: any;
  route: any;
}

const BiometricCaptureScreen: React.FC<BiometricCaptureScreenProps> = ({ navigation, route }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);
  const { session, user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const baseAngles = [
    { name: 'front', label: 'Frente', instruction: 'Mira directamente a la cámara' },
    { name: 'left', label: 'Izquierda', instruction: 'Gira ligeramente la cabeza a la izquierda' },
    { name: 'right', label: 'Derecha', instruction: 'Gira ligeramente la cabeza a la derecha' },
  ];
  const MAX_SESSION_PHOTOS = 3;
  const [remainingAngles, setRemainingAngles] = useState<typeof baseAngles>(baseAngles);

  const userId = route.params?.userId;
  const targetFullName = route.params?.fullName;
  const targetRole = route.params?.role;

  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        const res = await requestPermission();
        setHasPermission(!!res?.granted);
      } else {
        setHasPermission(true);
      }
    })();
  }, [permission]);

  useEffect(() => {
    setRemainingAngles(baseAngles.slice(0, MAX_SESSION_PHOTOS));
    setCurrentAngle(0);
  }, [userId]);

  const takePicture = async () => {
    if (capturedPhotos.length >= remainingAngles.length) {
      Alert.alert('Límite alcanzado', 'Ya capturaste todas las fotos permitidas');
      return;
    }
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        
        if (photo.base64) {
          const newPhoto = `data:image/jpeg;base64,${photo.base64}`;
          setCapturedPhotos(prev => [...prev, newPhoto]);
          
          if (currentAngle < remainingAngles.length - 1) {
            setCurrentAngle(currentAngle + 1);
          }
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo capturar la foto');
      }
    }
  };

  const saveEncodings = async () => {
    if (capturedPhotos.length === 0) {
      Alert.alert('Error', 'Debes capturar al menos una foto');
      return;
    }
    if (!userId && !targetFullName) {
      Alert.alert('Error', 'Falta el nombre del usuario a crear');
      return;
    }
    if (capturedPhotos.length > remainingAngles.length) {
      Alert.alert('Error', 'Has excedido el número de fotos permitidas');
      return;
    }

    setLoading(true);
    try {
      for (let i = 0; i < capturedPhotos.length; i++) {
        const photo = capturedPhotos[i];
        const angle = remainingAngles[i] || remainingAngles[0];
        const payload = {
          image_base64: photo,
          angle_type: angle.name,
          ...(userId
            ? { user_id: userId }
            : { full_name: targetFullName, role: targetRole || 'visitor' }),
        };
        await enrollService.enrollFace(payload, session?.access_token || '');
      }

      Alert.alert(
        'Éxito',
        'Fotos biométricas guardadas correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving encodings:', error);
      Alert.alert('Error', 'No se pudieron guardar las fotos biométricas');
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
    setCurrentAngle(index);
  };

  const toggleFacing = () => {
    setFacing(prev => (prev === 'front' ? 'back' : 'front'));
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permisos de cámara...</Text></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No se han otorgado permisos de cámara</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Captura Biométrica</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Paso {Math.min(currentAngle + 1, remainingAngles.length)} de {remainingAngles.length}
          </Text>
          <Text style={styles.angleLabel}>{remainingAngles[currentAngle]?.label}</Text>
        </View>

        {/* Camera */}
        {currentAngle < remainingAngles.length && (
          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.faceGuide}>
                  <View style={styles.faceFrame} />
                </View>
                <Text style={styles.instructionText}>
                  {remainingAngles[currentAngle]?.instruction}
                </Text>
              </View>
            </CameraView>
          </View>
        )}

        {/* Capture Button */}
        {currentAngle < remainingAngles.length && (
          <>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={loading}
            >
              <Text style={styles.captureButtonText}>📷 Capturar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleFacing}
              disabled={loading}
            >
              <Text style={styles.toggleButtonText}>
                {facing === 'front' ? 'Cambiar a Trasera' : 'Cambiar a Frontal'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Captured Photos */}
        {capturedPhotos.length > 0 && (
          <View style={styles.photosContainer}>
            <Text style={styles.sectionTitle}>Fotos Capturadas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {capturedPhotos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <Text style={styles.photoLabel}>{remainingAngles[index]?.label}</Text>
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => retakePhoto(index)}
                  >
                    <Text style={styles.retakeButtonText}>🔄</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Save Button */}
        {capturedPhotos.length > 0 && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={saveEncodings}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : 'Guardar Biometría'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  backText: {
    fontSize: 24,
    color: '#666666',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  angleLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  cameraContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 200,
    height: 250,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  faceFrame: {
    width: 180,
    height: 230,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#ffffff',
    opacity: 0.5,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  photosContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  photoContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  photo: {
    width: 80,
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  photoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  retakeButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    padding: 4,
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BiometricCaptureScreen;
