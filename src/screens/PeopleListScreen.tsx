import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { StorageService } from '../utils/storage';
import { ApiService } from '../services/api';
import { Person } from '../types';

export default function PeopleListScreen({ navigation }: any) {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'whitelist' | 'blacklist'>('all');

  useEffect(() => {
    loadPeople();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, searchTerm, filterType]);

  const loadPeople = async () => {
    const token = await StorageService.getUserToken();
    if (!token) return;
    const loadedPeople = await ApiService.getPeople(token);
    const normalized = loadedPeople.map((p: any) => ({
      id: p.id,
      name: p.name,
      photo: `${p.photoFileId}`, 
      listType: p.listType,
      createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date(p.createdAt).toISOString(),
      updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date(p.updatedAt).toISOString(),
      createdBy: p.createdBy || '',
    }));
    setPeople(normalized);
  };

  const filterPeople = () => {
    let filtered = people;

    if (filterType !== 'all') {
      filtered = filtered.filter(person => person.listType === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPeople(filtered);
  };

  const deletePerson = (person: Person) => {
    Alert.alert(
      'Eliminar Persona',
      `¿Está seguro que desea eliminar a ${person.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const token = await StorageService.getUserToken();
            if (!token) return;
            await ApiService.deletePerson(token, person.id);
            loadPeople();
          }
        }
      ]
    );
  };

  const renderPerson = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={styles.personItem}
      onPress={() => navigation.navigate('PersonDetail', { person: item })}
    >
      <View style={styles.personInfo}>
        <View style={[styles.avatar, { backgroundColor: item.listType === 'whitelist' ? '#38a169' : '#e53e3e' }]}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.personDetails}>
          <Text style={styles.personName}>{item.name}</Text>
          <Text style={[styles.personType, { color: item.listType === 'whitelist' ? '#38a169' : '#e53e3e' }]}>
            {item.listType === 'whitelist' ? 'Lista Blanca' : 'Lista Negra'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deletePerson(item)}
      >
        <Text style={styles.deleteText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personas Registradas</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'whitelist' && styles.filterButtonActive]}
            onPress={() => setFilterType('whitelist')}
          >
            <Text style={[styles.filterText, filterType === 'whitelist' && styles.filterTextActive]}>Blanca</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'blacklist' && styles.filterButtonActive]}
            onPress={() => setFilterType('blacklist')}
          >
            <Text style={[styles.filterText, filterType === 'blacklist' && styles.filterTextActive]}>Negra</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredPeople}
        renderItem={renderPerson}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay personas registradas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddPerson')}
            >
              <Text style={styles.addButtonText}>Agregar Persona</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPerson')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#1a365d',
  },
  filterText: {
    color: '#4a5568',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  list: {
    padding: 15,
  },
  personItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 4,
  },
  personType: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 10,
  },
  deleteText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#1a365d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a365d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
