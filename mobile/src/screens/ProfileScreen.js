import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { User, Briefcase, LogOut } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen({ route }) {
  const { setUserToken } = route.params;

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } else {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
    setUserToken(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <User size={40} color="#3b82f6" />
        </View>
        <Text style={styles.name}>Étudiant</Text>
        <Text style={styles.email}>student@homam.tech</Text>
      </View>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuIcon}>
          <Briefcase size={24} color="#0f172a" />
        </View>
        <Text style={styles.menuText}>Offres de stages & emploi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  email: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 18,
    color: '#0f172a',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 15,
    borderRadius: 16,
    marginTop: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});
