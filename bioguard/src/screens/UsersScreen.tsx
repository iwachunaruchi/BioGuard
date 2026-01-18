import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '../services/api';
import { User } from '../types';

interface UsersScreenProps {
  navigation: any;
}

const UsersScreen: React.FC<UsersScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const roles = [
    { label: 'Todos', value: '' },
    { label: 'Administrador', value: 'admin' },
    { label: 'Lista Blanca', value: 'whitelist' },
    { label: 'Lista Negra', value: 'blacklist' },
    { label: 'Visitante', value: 'visitor' },
  ];

  const roleColors = {
    admin: '#EF4444',
    whitelist: '#10B981',
    blacklist: '#1F2937',
    visitor: '#F59E0B',
  };

  const roleLabels = {
    admin: 'Admin',
    whitelist: 'Whitelist',
    blacklist: 'Blacklist',
    visitor: 'Visitante',
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, selectedRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers(searchTerm, selectedRole);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('UserDetail', { userId: user.id });
  };

  const handleNewUser = () => {
    navigation.navigate('UserRegistration');
  };

  const handleBiometricCapture = (userId: string) => {
    navigation.navigate('BiometricCapture', { userId });
  };

  const renderUserCard = (user: User) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() => handleUserPress(user)}
    >
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{user.full_name}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColors[user.role as keyof typeof roleColors] }]}>
            <Text style={styles.roleText}>{roleLabels[user.role as keyof typeof roleLabels]}</Text>
          </View>
        </View>
        <Text style={styles.userEmail}>{user.email || 'Sin email'}</Text>
        <Text style={styles.userDate}>
          Registrado: {new Date(user.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBiometricCapture(user.id)}
        >
          <Text style={styles.actionButtonText}>📷</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleNewUser}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.rolesContainer}
        >
          {roles.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleFilter,
                selectedRole === role.value && styles.roleFilterActive,
              ]}
              onPress={() => setSelectedRole(role.value)}
            >
              <Text
                style={[
                  styles.roleFilterText,
                  selectedRole === role.value && styles.roleFilterTextActive,
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de usuarios */}
      <ScrollView style={styles.usersList}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            <Text style={styles.emptySubtext}>
              {searchTerm || selectedRole ? 'Intenta con otros filtros' : 'Comienza creando un nuevo usuario'}
            </Text>
          </View>
        ) : (
          users.map(renderUserCard)
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  addButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 16,
  },
  rolesContainer: {
    flexDirection: 'row',
  },
  roleFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  roleFilterActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  roleFilterText: {
    fontSize: 14,
    color: '#666666',
  },
  roleFilterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  usersList: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 8,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#999999',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 16,
  },
});

export default UsersScreen;
