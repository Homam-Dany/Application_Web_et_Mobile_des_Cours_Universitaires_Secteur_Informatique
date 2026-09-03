import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Dimensions, Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { LogOut, Flame, Layers, TrendingUp, Award, BookOpen, Sparkles } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function HomeScreen({ route, navigation }) {
  const { setUserToken } = route.params;
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      
      const [userRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/users/me/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/student/stats/`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setUser(userRes.data);
      setStats(statsRes.data);
      
      // Démarrer l'animation
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
      
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
      {/* 🚀 Dark Header Magique */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bon retour,</Text>
            <Text style={styles.name}>
              {user ? (user.first_name || user.email.split('@')[0]) : 'Étudiant'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Streak Highlight in Header */}
        <View style={styles.streakHighlight}>
          <View style={styles.streakIconWrapper}>
            <Flame size={24} color="#f59e0b" />
          </View>
          <View>
            <Text style={styles.streakText}>{user ? user.current_streak : 0} Jours de série !</Text>
            <Text style={styles.streakSubText}>Vous êtes en feu 🔥</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        
        <Text style={styles.sectionTitle}>Votre Progression</Text>
        
        <View style={styles.statsGrid}>
          {/* Stat 1 */}
          <View style={styles.statBoxContainer}>
            <View style={[styles.statBox, { backgroundColor: '#eff6ff' }]}>
              <Award size={28} color="#3b82f6" />
              <Text style={styles.statValue}>{stats ? Math.round(stats.average_score) : 0}/20</Text>
              <Text style={styles.statLabel}>Moyenne</Text>
            </View>
            <View style={[styles.statShadow, { backgroundColor: '#3b82f6' }]} />
          </View>

          {/* Stat 2 */}
          <View style={styles.statBoxContainer}>
            <View style={[styles.statBox, { backgroundColor: '#f0fdf4' }]}>
              <BookOpen size={28} color="#10b981" />
              <Text style={styles.statValue}>{stats ? stats.total_quizzes : 0}</Text>
              <Text style={styles.statLabel}>Quiz Finis</Text>
            </View>
            <View style={[styles.statShadow, { backgroundColor: '#10b981' }]} />
          </View>

          {/* Stat 3 */}
          <View style={styles.statBoxContainer}>
            <View style={[styles.statBox, { backgroundColor: '#f5f3ff' }]}>
              <TrendingUp size={28} color="#8b5cf6" />
              <Text style={styles.statValue}>
                {stats && stats.strengths && stats.strengths.length > 0 ? stats.strengths.length : 0}
              </Text>
              <Text style={styles.statLabel}>Points Forts</Text>
            </View>
            <View style={[styles.statShadow, { backgroundColor: '#8b5cf6' }]} />
          </View>
        </View>

        {stats && stats.radar_data && stats.radar_data.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Performances par Module</Text>
            <View style={styles.chartWrapper}>
              <BarChart
                data={{
                  labels: stats.radar_data.map(d => d.subject),
                  datasets: [{ data: stats.radar_data.map(d => d.A) }]
                }}
                width={width - 40}
                height={220}
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                style={{ borderRadius: 16 }}
              />
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Matières Fortes</Text>
        {stats && stats.strengths && stats.strengths.length > 0 ? (
          stats.strengths.map((strength, index) => (
            <View key={index} style={styles.strengthItem}>
              <View style={styles.strengthDot} />
              <Text style={styles.strengthText}>{strength}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Sparkles size={24} color="#94a3b8" />
            <Text style={styles.emptyText}>Faites plus de quiz pour découvrir vos points forts.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  name: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 2,
  },
  logoutButton: {
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  streakHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakIconWrapper: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  streakText: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakSubText: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 30,
    paddingHorizontal: 20,
    minHeight: height - 200,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  statBoxContainer: {
    flex: 1,
    marginHorizontal: 5,
    position: 'relative',
  },
  statBox: {
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  statShadow: {
    position: 'absolute',
    top: 10, left: 5, right: 5, bottom: -5,
    borderRadius: 20,
    zIndex: 1,
    opacity: 0.3,
    filter: 'blur(8px)',
  },
  chartSection: {
    marginBottom: 35,
  },
  chartWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 15,
    paddingTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  strengthDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 15,
  },
  strengthText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  }
});
