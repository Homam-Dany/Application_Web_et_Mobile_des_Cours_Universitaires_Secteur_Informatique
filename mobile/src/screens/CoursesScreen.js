import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Platform, TouchableOpacity, Modal, TextInput, Animated, Dimensions } from 'react-native';
import { BookOpen, ChevronRight, LayoutList, Plus, Trash2 } from 'lucide-react-native';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');


export default function CoursesScreen({ route, navigation }) {
  const { setUserToken } = route.params || {};
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    fetchModulesAndRole();
  }, []);

  const fetchModulesAndRole = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      
      const roleRes = await api.get(`/users/me/`, { headers: { Authorization: `Bearer ${token}` } });
      setIsAdmin(roleRes.data.role === 'admin' || roleRes.data.role === 'teacher');
      
      const res = await api.get(`/modules/`, { headers: { Authorization: `Bearer ${token}` } });
      setModules(res.data);
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();

    } catch (e) {
      console.error('Failed to fetch', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    if (!newModuleName) return;
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      await api.post(`/modules/`, 
        { name: newModuleName, description: newModuleDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalVisible(false);
      setNewModuleName('');
      setNewModuleDesc('');
      fetchModulesAndRole();
    } catch (e) {
      console.error(e);
      if (Platform.OS === 'web') window.alert("Erreur lors de la création.");
    }
  };

  const handleDeleteModule = async (id) => {
    if (Platform.OS === 'web' && !window.confirm('Voulez-vous vraiment supprimer ce cours ?')) return;
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      await api.delete(`/modules/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchModulesAndRole();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ModuleDetail', { module: item, isAdmin })}
      >
        <View style={styles.iconContainer}>
          <BookOpen size={28} color="#3b82f6" />
        </View>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description || 'Découvrez ce module'}</Text>
        </View>
        {isAdmin ? (
          <TouchableOpacity onPress={() => handleDeleteModule(item.id)} style={styles.deleteButton}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={styles.arrowButton}>
            <ChevronRight size={24} color="#3b82f6" />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.cardShadow} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{isAdmin ? 'Gestion des Cours' : 'Vos Cours'}</Text>
            <Text style={styles.headerSubtitle}>Plongez dans de nouvelles connaissances</Text>
          </View>
          {isAdmin && (
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
        ) : modules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LayoutList size={48} color="#cbd5e1" />
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
      </Animated.View>

      {/* Modal d'ajout de cours */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau Cours</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du cours (ex: Mathématiques)"
              value={newModuleName}
              onChangeText={setNewModuleName}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Description (optionnel)"
              value={newModuleDesc}
              onChangeText={setNewModuleDesc}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateModule}>
                <Text style={styles.submitBtnText}>Créer le module</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 30,
    minHeight: height - 150,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  cardShadow: {
    position: 'absolute',
    top: 15,
    left: 10,
    right: 10,
    bottom: -10,
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    zIndex: 1,
    opacity: 0.1,
    filter: 'blur(10px)',
  },
  iconContainer: {
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  arrowButton: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 20,
    color: '#0f172a',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    padding: 14,
    marginRight: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: '#64748b',
    fontWeight: '700',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
