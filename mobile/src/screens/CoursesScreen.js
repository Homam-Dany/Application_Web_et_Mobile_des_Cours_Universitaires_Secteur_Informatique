import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { BookOpen, ChevronRight, LayoutList } from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function CoursesScreen({ route, navigation }) {
  const { setUserToken } = route.params || {};
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }
      
      const res = await axios.get(`${API_URL}/modules/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(res.data);
    } catch (e) {
      console.error('Failed to fetch modules', e);
      if (e.response && e.response.status === 401) {
        if (Platform.OS === 'web') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        if (setUserToken) setUserToken(null);
        if (Platform.OS === 'web') {
          window.alert('Votre session a expiré. Veuillez vous reconnecter.');
        }
      } else if (Platform.OS === 'web') {
        window.alert('Erreur de chargement des cours: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ModuleDetail', { module: item })}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <BookOpen size={24} color="#3b82f6" />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>Module de cours complet</Text>
        </View>
        <ChevronRight size={24} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mes Cours</Text>
      <Text style={styles.headerSubtitle}>Retrouvez tous vos modules et ressources.</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
      ) : modules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LayoutList size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>Aucun module disponible pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1, width: '100%' }}
          data={modules}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    paddingHorizontal: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 15,
    fontSize: 16,
  }
});
