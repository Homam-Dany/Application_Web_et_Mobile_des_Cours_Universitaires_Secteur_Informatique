import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Modal, TextInput, Animated, Dimensions } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { ChevronLeft, Plus, Folder, FileText, Trash2 } from 'lucide-react-native';

const { height } = Dimensions.get('window');

const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function ModuleDetailScreen({ route, navigation }) {
  const { module, isAdmin } = route.params;
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDriveId, setNewDriveId] = useState('');

  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));

  // Extract resources on mount
  useEffect(() => {
    refreshResources();
  }, []);

  const refreshResources = async () => {
    fetchModuleData();
  };

  const fetchModuleData = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await axios.get(`${API_URL}/modules/${module.id}/`, { headers: { Authorization: `Bearer ${token}` } });
      const fetchedModule = res.data;
      
      if (fetchedModule.chapters) {
        setChapters(fetchedModule.chapters);
        // If a chapter was already selected, update it with new data
        if (selectedChapter) {
          const updatedChapter = fetchedModule.chapters.find(c => c.id === selectedChapter.id);
          if (updatedChapter) setSelectedChapter(updatedChapter);
        }
      } else {
        setChapters([]);
      }
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    } catch(e) {
      console.error(e);
      if (module.chapters) {
        setChapters(module.chapters);
      }
      
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleOpenResource = (resource) => {
    if (resource.drive_file_id) {
      navigation.navigate('DocumentViewer', { resource });
    } else {
      if (Platform.OS === 'web') window.alert('Ce document n\'a pas de lien valide.');
    }
  };

  const handleDeleteResource = async (id) => {
    if (Platform.OS === 'web' && !window.confirm('Voulez-vous vraiment supprimer ce fichier ?')) return;
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      await axios.delete(`${API_URL}/resources/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      refreshResources();
    } catch(e) {
      console.error(e);
      if (Platform.OS === 'web') window.alert("Erreur lors de la suppression.");
    }
  };

  const handleAddResource = async () => {
    if (!newTitle || !newDriveId) return;
    
    let targetChapterId = null;
    let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
    
    try {
      const modRes = await axios.get(`${API_URL}/modules/${module.id}/`, { headers: { Authorization: `Bearer ${token}` } });
      const currentModule = modRes.data;
      
      if (selectedChapter) {
        targetChapterId = selectedChapter.id;
      } else if (currentModule.chapters && currentModule.chapters.length > 0) {
        targetChapterId = currentModule.chapters[0].id;
      } else {
        const chapterRes = await axios.post(`${API_URL}/chapters/`, 
          { module: module.id, title: "Général", order: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        targetChapterId = chapterRes.data.id;
      }
      
      await axios.post(`${API_URL}/resources/`, 
        { chapter: targetChapterId, title: newTitle, resource_type: 'course', drive_file_id: newDriveId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setModalVisible(false);
      setNewTitle('');
      setNewDriveId('');
      refreshResources();
    } catch(e) {
      console.error(e);
      if (Platform.OS === 'web') window.alert("Erreur lors de l'ajout.");
    }
  };

  const renderResource = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.resourceCard} onPress={() => handleOpenResource(item)} activeOpacity={0.8}>
        <View style={styles.iconContainer}>
          <FileText size={28} color="#10b981" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.resourceTitle}>{item.title}</Text>
          <Text style={styles.resourceSubtitle}>{item.chapterName || 'Général'}</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity onPress={() => handleDeleteResource(item.id)} style={styles.deleteButton}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <View style={[styles.cardShadow, { backgroundColor: '#10b981' }]} />
    </View>
  );

  const renderChapter = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={[styles.resourceCard, { borderLeftColor: '#3b82f6', borderLeftWidth: 4 }]} onPress={() => setSelectedChapter(item)} activeOpacity={0.8}>
        <View style={styles.iconContainer}>
          <Folder size={28} color="#3b82f6" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.resourceTitle}>{item.title}</Text>
          <Text style={styles.resourceSubtitle}>{item.resources ? item.resources.length : 0} document(s)</Text>
        </View>
      </TouchableOpacity>
      <View style={[styles.cardShadow, { backgroundColor: '#3b82f6' }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerTitle} numberOfLines={2}>{module.name}</Text>
        <Text style={styles.headerSubtitle}>{module.description || 'Contenu du module'}</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        {!selectedChapter ? (
          <>
            <View style={styles.infoCard}>
              <Folder size={24} color="#3b82f6" />
              <Text style={styles.infoText}>{chapters.length} dossier(s) disponible(s)</Text>
            </View>

            <FlatList
              data={chapters}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderChapter}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#64748b'}}>Aucun dossier trouvé.</Text>}
            />
          </>
        ) : (
          <>
            <View style={[styles.infoCard, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setSelectedChapter(null)} style={{ marginRight: 10 }}>
                  <ChevronLeft size={24} color="#3b82f6" />
                </TouchableOpacity>
                <Folder size={24} color="#3b82f6" />
                <Text style={styles.infoText}>{selectedChapter.title}</Text>
              </View>
              <Text style={styles.infoText}>{selectedChapter.resources ? selectedChapter.resources.length : 0} doc(s)</Text>
            </View>

            <FlatList
              data={selectedChapter.resources || []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderResource}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: '#64748b'}}>Aucun document dans ce dossier.</Text>}
            />
          </>
        )}
      </Animated.View>

      {/* Modal d'ajout de fichier */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouveau Fichier</Text>
            <TextInput
              style={styles.input}
              placeholder="Titre du document (ex: Chapitre 1)"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="ID Google Drive (ex: 1A2b3C...)"
              value={newDriveId}
              onChangeText={setNewDriveId}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddResource}>
                <Text style={styles.submitBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 16, color: '#94a3b8', marginTop: 10 },
  addButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 16, shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 30,
    paddingHorizontal: 20,
    minHeight: height - 250,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  infoText: { marginLeft: 15, fontSize: 16, color: '#1e3a8a', fontWeight: 'bold' },
  listContainer: { paddingBottom: 40 },
  cardContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  cardShadow: {
    position: 'absolute',
    top: 15,
    left: 10,
    right: 10,
    bottom: -10,
    borderRadius: 24,
    zIndex: 1,
    opacity: 0.15,
    filter: 'blur(10px)',
  },
  iconContainer: { padding: 14, backgroundColor: '#f0fdf4', borderRadius: 16 },
  textContainer: { flex: 1, marginLeft: 16, marginRight: 10 },
  resourceTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  resourceSubtitle: { fontSize: 14, color: '#64748b' },
  downloadButton: { padding: 10, backgroundColor: '#f0fdf4', borderRadius: 12 },
  deleteButton: { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#ffffff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, color: '#0f172a' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, color: '#0f172a' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelBtn: { padding: 14, marginRight: 10, borderRadius: 12 },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 16 },
  submitBtn: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, paddingHorizontal: 24 },
  submitBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 }
});
