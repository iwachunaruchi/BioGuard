import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    {
      title: 'Gestión de Usuarios',
      description: 'Ver, crear y administrar usuarios',
      icon: '👥',
      screen: 'Users',
      color: '#1E3A8A',
    },
    {
      title: 'Registro de Accesos',
      description: 'Ver logs de entrada y salida',
      icon: '📊',
      screen: 'AccessLogs',
      color: '#10B981',
    },
    {
      title: 'Captura Biométrica',
      description: 'Tomar fotos para reconocimiento',
      icon: '📷',
      screen: 'BiometricCapture',
      color: '#F59E0B',
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.menuItem, { borderLeftColor: item.color }]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemIcon}>{item.icon}</Text>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Bienvenido,</Text>
            <Text style={styles.userName}>{user?.full_name || 'Usuario'}</Text>
            <Text style={styles.userRole}>{user?.role || 'visitante'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Usuarios Activos</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Accesos Hoy</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Funciones Principales</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, styles.quickActionPrimary]}
              onPress={() => navigation.navigate('UserRegistration')}
            >
              <Text style={styles.quickActionText}>+ Nuevo Usuario</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, styles.quickActionSecondary]}
              onPress={() => navigation.navigate('BiometricCapture')}
            >
              <Text style={styles.quickActionText}>📷 Capturar Rostro</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#666666',
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
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
  statCardPrimary: {
    borderTopWidth: 3,
    borderTopColor: '#1E3A8A',
  },
  statCardSuccess: {
    borderTopWidth: 3,
    borderTopColor: '#10B981',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  menuContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666666',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickActionPrimary: {
    backgroundColor: '#1E3A8A',
  },
  quickActionSecondary: {
    backgroundColor: '#F59E0B',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;
