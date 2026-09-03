import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Dimensions, Animated } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Users, FileText, Activity, ShieldAlert } from 'lucide-react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');
const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await axios.get(`${API_URL}/admin/stats/`, { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    } catch (e) {
      console.error("Failed to fetch admin stats", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const pieData = stats && stats.platform_usage ? [
    { name: "Web", population: stats.platform_usage.web || 45, color: "#3b82f6", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Mobile", population: stats.platform_usage.mobile || 55, color: "#10b981", legendFontColor: "#7F7F7F", legendFontSize: 12 }
  ] : [
    { name: "Web", population: 50, color: "#3b82f6", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Mobile", population: 50, color: "#10b981", legendFontColor: "#7F7F7F", legendFontSize: 12 }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
      {/* 🚀 Dark Header Executive */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Tableau de bord</Text>
            <Text style={styles.headerSubtitle}>Vue d'ensemble de la plateforme</Text>
          </View>
          <View style={styles.adminBadge}>
            <ShieldAlert size={20} color="#f59e0b" />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        
        {/* Cartes de Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBoxContainer}>
            <View style={[styles.statBox, { backgroundColor: '#eff6ff' }]}>
              <Users size={28} color="#3b82f6" />
              <Text style={styles.statValue}>{stats ? stats.total_users : 0}</Text>
              <Text style={styles.statLabel}>Utilisateurs</Text>
            </View>
            <View style={[styles.statShadow, { backgroundColor: '#3b82f6' }]} />
          </View>

          <View style={styles.statBoxContainer}>
            <View style={[styles.statBox, { backgroundColor: '#f0fdf4' }]}>
              <FileText size={28} color="#10b981" />
              <Text style={styles.statValue}>{stats ? stats.total_documents : 0}</Text>
              <Text style={styles.statLabel}>Documents</Text>
            </View>
            <View style={[styles.statShadow, { backgroundColor: '#10b981' }]} />
          </View>

          <View style={styles.statBoxContainer}>
            <View style={[styles.statBox, { backgroundColor: '#f5f3ff' }]}>
              <Activity size={28} color="#8b5cf6" />
              <Text style={styles.statValue}>{stats ? stats.total_quizzes_taken : 0}</Text>
              <Text style={styles.statLabel}>Quiz Joués</Text>
            </View>
            <View style={[styles.statShadow, { backgroundColor: '#8b5cf6' }]} />
          </View>
        </View>

        {/* Graphique de Croissance */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Activity size={20} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Croissance des Inscriptions</Text>
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={{
                labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
                datasets: [{ data: [20, 45, 28, 80, 99, 132] }]
              }}
              width={width - 80}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#2563eb"
                }
              }}
              bezier
              style={{ borderRadius: 16 }}
            />
          </View>
        </View>

        {/* Graphique Répartition */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Users size={20} color="#10b981" />
            <Text style={styles.sectionTitle}>Répartition des Plateformes</Text>
          </View>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieData}
              width={width - 80}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 16, color: '#94a3b8', marginTop: 5 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  adminBadgeText: {
    color: '#f59e0b',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 12,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 35,
    paddingHorizontal: 20,
    minHeight: height - 150,
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
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  statValue: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginTop: 10 },
  statLabel: { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 4 },
  statShadow: {
    position: 'absolute',
    top: 10, left: 5, right: 5, bottom: -5,
    borderRadius: 20,
    zIndex: 1,
    opacity: 0.3,
    filter: 'blur(8px)',
  },
  chartContainer: {
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 10,
  },
  chartWrapper: {
    alignItems: 'center',
  }
});
