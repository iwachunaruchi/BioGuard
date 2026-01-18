import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, Person, AccessLog } from '../types';

const STORAGE_KEYS = {
  USERS: 'users',
  PEOPLE: 'people',
  ACCESS_LOGS: 'accessLogs',
  USER_TOKEN: 'userToken',
};

export const StorageService = {
  // User management
  async getUsers(): Promise<User[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async saveUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  },

  // Person management
  async getPeople(): Promise<Person[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PEOPLE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting people:', error);
      return [];
    }
  },

  async savePeople(people: Person[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    } catch (error) {
      console.error('Error saving people:', error);
    }
  },

  async addPerson(person: Person): Promise<void> {
    const people = await this.getPeople();
    people.push(person);
    await this.savePeople(people);
  },

  async updatePerson(updatedPerson: Person): Promise<void> {
    const people = await this.getPeople();
    const index = people.findIndex(p => p.id === updatedPerson.id);
    if (index !== -1) {
      people[index] = updatedPerson;
      await this.savePeople(people);
    }
  },

  async deletePerson(personId: string): Promise<void> {
    const people = await this.getPeople();
    const filtered = people.filter(p => p.id !== personId);
    await this.savePeople(filtered);
  },

  // Access logs
  async getAccessLogs(): Promise<AccessLog[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_LOGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting access logs:', error);
      return [];
    }
  },

  async addAccessLog(log: AccessLog): Promise<void> {
    try {
      const logs = await this.getAccessLogs();
      logs.push(log);
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving access log:', error);
    }
  },

  // Auth with SecureStore
  async saveUserToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Error saving user token:', error);
    }
  },

  async getUserToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  },

  async removeUserToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error removing user token:', error);
    }
  },

  // Initialize with default admin user
  async initializeDefaultData(): Promise<void> {
    const users = await this.getUsers();
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: 'admin-001',
        email: 'admin@bioguard.com',
        passwordHash: 'admin123', // En producción usar hash bcrypt
        name: 'Administrador Principal',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      await this.saveUsers([defaultAdmin]);
    }
  },
};