import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { LogOut, Flame, Layers, TrendingUp, Award, BookOpen } from 'lucide-react-native';

const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function HomeScreen({ route, navigation }) {
  const { setUserToken } = route.params;
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }
      
      const [userRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/users/me/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/student/stats/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setUser(userRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.name}>{user ? user.first_name : 'Étudiant'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.streakCard}>
          <Flame size={36} color="#f59e0b" />
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.streakTitle}>{user ? user.current_streak : 0} Jours de série</Text>
            <Text style={styles.streakSub}>Continue sur ta lancée !</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Votre Progression</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Award size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{stats ? Math.round(stats.average_score) : 0}/20</Text>
            <Text style={styles.statLabel}>Moyenne</Text>
          </View>
          <View style={styles.statBox}>
            <BookOpen size={24} color="#10b981" />
            <Text style={styles.statValue}>{stats ? stats.total_quizzes : 0}</Text>
            <Text style={styles.statLabel}>Quiz Terminés</Text>
          </View>
          <View style={styles.statBox}>
            <TrendingUp size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>
              {stats && stats.strengths && stats.strengths.length > 0 ? stats.strengths.length : 0}
            </Text>
            <Text style={styles.statLabel}>Points Forts</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Matières Fortes</Text>
        {stats && stats.strengths && stats.strengths.length > 0 ? (
          stats.strengths.map((strength, index) => (
            <View key={index} style={styles.strengthItem}>
              <View style={styles.strengthDot} />
              <Text style={styles.strengthText}>{strength}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Faites plus de quiz pour découvrir vos points forts.</Text>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    color: '#64748b',
    fontSize: 16,
  },
  name: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 50,
  },
  content: {
    paddingHorizontal: 20,
  },
  streakCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  streakTitle: {
    color: '#f59e0b',
    fontSize: 22,
    fontWeight: 'bold',
  },
  streakSub: {
    color: '#64748b',
    marginTop: 5,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
    textAlign: 'center',
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  strengthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginRight: 10,
  },
  strengthText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  emptyText: {
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 20,
  }
});
