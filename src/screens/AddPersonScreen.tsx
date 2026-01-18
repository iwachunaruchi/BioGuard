import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { StorageService } from '../utils/storage';
import { Person } from '../types';
import { useAuth } from '../context/AuthContext';

export default function AddPersonScreen({ navigation, route }: any) {
  const [name, setName] = useState('');
  const [listType, setListType] = useState<'whitelist' | 'blacklist'>('whitelist');
  const [photo, setPhoto] = useState<string | null>(route.params?.photo || null);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingrese un nombre');
      return;
    }

    if (!photo) {
      Alert.alert('Error', 'Por favor capture una foto');
      return;
    }

    try {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: name.trim(),
        photo: photo,
        listType: listType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || '',
      };

      await StorageService.addPerson(newPerson);
      Alert.alert('Éxito', 'Persona registrada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving person:', error);
      Alert.alert('Error', 'No se pudo registrar la persona');
    }
  };

  const takePhoto = () => {
    navigation.navigate('Camera', { returnScreen: 'AddPerson' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agregar Persona</Text>
        <Text style={styles.subtitle}>Complete los datos de la persona</Text>
      </View>

      <View style={styles.form}>
        <TouchableOpacity style={styles.photoContainer} onPress={takePhoto}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoText}>📷</Text>
              <Text style={styles.photoSubtext}>Tocar para capturar foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.listTypeContainer}>
          <TouchableOpacity
            style={[styles.listTypeButton, listType === 'whitelist' && styles.listTypeButtonActive]}
            onPress={() => setListType('whitelist')}
          >
            <Text style={[styles.listTypeText, listType === 'whitelist' && styles.listTypeTextActive]}>
              ✅ Lista Blanca
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.listTypeButton, listType === 'blacklist' && styles.listTypeButtonActive]}
            onPress={() => setListType('blacklist')}
          >
            <Text style={[styles.listTypeText, listType === 'blacklist' && styles.listTypeTextActive]}>
              ❌ Lista Negra
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Persona</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a365d',
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e0',
  },
  form: {
    padding: 20,
  },
  photoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 48,
    marginBottom: 10,
  },
  photoSubtext: {
    fontSize: 16,
    color: '#718096',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
  },
  listTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  listTypeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  listTypeButtonActive: {
    backgroundColor: '#1a365d',
  },
  listTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
  },
  listTypeTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#38a169',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '600',
  },
});