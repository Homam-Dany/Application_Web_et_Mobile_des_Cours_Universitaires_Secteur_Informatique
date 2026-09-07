import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, ActivityIndicator, Animated, Dimensions } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { User, Trash2, Edit2, ShieldAlert, CheckCircle, Clock } from 'lucide-react-native';

const { height } = Dimensions.get('window');


export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await api.get(`/users/admin/users/`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      await api.patch(`/users/admin/users/${id}/`, 
        { is_active: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') window.alert("Erreur lors de l'activation.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={[styles.avatar, item.role === 'admin' ? {backgroundColor: '#fef3c7'} : {backgroundColor: '#eff6ff'}]}>
            {item.role === 'admin' || item.role === 'teacher' ? <ShieldAlert size={24} color="#f59e0b" /> : <User size={24} color="#3b82f6" />}
          </View>
          <View style={styles.textInfo}>
            <Text style={styles.cardTitle}>{item.first_name || item.email.split('@')[0]}</Text>
            <Text style={styles.cardSub}>{item.email}</Text>
            {!item.is_active && (
              <View style={styles.pendingBadge}>
                <Clock size={12} color="#ef4444" />
                <Text style={styles.pendingText}>En attente</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actionButtons}>
          {!item.is_active && item.role !== 'admin' && item.role !== 'teacher' && (
            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#f0fdf4'}]} onPress={() => handleApprove(item.id)}>
              <CheckCircle size={20} color="#10b981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Edit2 size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#fef2f2'}]}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardShadow} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🚀 Dark Header Executive */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Utilisateurs</Text>
            <Text style={styles.headerSubtitle}>Gérez les comptes étudiants</Text>
          </View>
          <View style={styles.adminBadge}>
            <ShieldAlert size={20} color="#f59e0b" />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>
    </View>
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
  adminBadgeText: { color: '#f59e0b', fontWeight: 'bold', marginLeft: 6, fontSize: 12, letterSpacing: 1 },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 35,
    minHeight: height - 150,
  },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  cardContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardShadow: {
    position: 'absolute',
    top: 15, left: 10, right: 10, bottom: -10,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    zIndex: 1,
    opacity: 0.05,
    filter: 'blur(8px)',
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInfo: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  cardSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  pendingText: { fontSize: 11, color: '#ef4444', fontWeight: 'bold', marginLeft: 4 },
  actionButtons: { flexDirection: 'row' },
  actionButton: { padding: 10, marginLeft: 6, backgroundColor: '#f1f5f9', borderRadius: 12 },
});
