import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView, ActivityIndicator, Animated, Dimensions, Alert } from 'react-native';
import { User, LogOut, CheckCircle, ShieldAlert, KeyRound, UserCircle2, Trash2, FileText } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const { height } = Dimensions.get('window');


export default function ProfileScreen({ route }) {
  const { setUserToken } = route.params;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile Update State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  
  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdStatus, setPwdStatus] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await api.get(`/users/me/`, { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
      setFirstName(res.data.first_name || '');
      setLastName(res.data.last_name || '');
      
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

  const handleUpdateProfile = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await api.put(`/users/me/update/`, 
        { first_name: firstName, last_name: lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
      setUpdateStatus('Profil mis à jour avec succès !');
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (e) {
      console.error(e);
      setUpdateStatus('Erreur lors de la mise à jour.');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPwdStatus('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!oldPassword || !newPassword) {
      setPwdStatus('Veuillez remplir tous les champs.');
      return;
    }
    
    setPwdLoading(true);
    setPwdStatus('');
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      await api.post(`/users/change-password/`, 
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwdStatus('Mot de passe modifié avec succès !');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdStatus(''), 3000);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.data && e.response.data.error) {
        setPwdStatus(e.response.data.error);
      } else {
        setPwdStatus('Erreur lors du changement.');
      }
    } finally {
      setPwdLoading(false);
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

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")) {
        executeDelete();
      }
    } else {
      Alert.alert(
        "Zone de Danger",
        "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Supprimer", style: "destructive", onPress: executeDelete }
        ]
      );
    }
  };

  const executeDelete = async () => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      await api.delete('/users/me/delete/', { headers: { Authorization: `Bearer ${token}` } });
      handleLogout();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de supprimer le compte.");
    }
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
      {/* 🚀 Dark Header Centré */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            {user && (user.role === 'admin' || user.role === 'teacher') ? (
              <ShieldAlert size={48} color="#f59e0b" />
            ) : (
              <User size={48} color="#3b82f6" />
            )}
          </View>
          <View style={styles.avatarRing} />
        </View>
        <Text style={styles.name}>{user && user.first_name ? user.first_name : (user ? user.email.split('@')[0] : 'Profil')}</Text>
        <Text style={styles.email}>{user ? user.email : ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user && user.role === 'admin' ? 'Administrateur' : 'Étudiant'}</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        
        {/* Section Informations Personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserCircle2 size={24} color="#3b82f6" />
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput 
              style={styles.input} 
              value={firstName} 
              onChangeText={setFirstName} 
              placeholder="Votre prénom" 
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput 
              style={styles.input} 
              value={lastName} 
              onChangeText={setLastName} 
              placeholder="Votre nom" 
              placeholderTextColor="#94a3b8"
            />
          </View>
          
          {updateStatus !== '' && <Text style={styles.successText}>{updateStatus}</Text>}
          
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
            <CheckCircle size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          </TouchableOpacity>
        </View>

        {/* Section Sécurité */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <KeyRound size={24} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Sécurité & Mot de passe</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ancien mot de passe</Text>
            <TextInput 
              style={styles.input} 
              value={oldPassword} 
              onChangeText={setOldPassword} 
              secureTextEntry 
              placeholder="Requis" 
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <TextInput 
              style={styles.input} 
              value={newPassword} 
              onChangeText={setNewPassword} 
              secureTextEntry 
              placeholder="Min. 8 caractères"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput 
              style={styles.input} 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry 
              placeholder="Répétez le mot de passe"
              placeholderTextColor="#94a3b8"
            />
          </View>
          
          {pwdStatus !== '' && (
            <Text style={[styles.successText, pwdStatus.includes('Erreur') || pwdStatus.includes('incorrect') || pwdStatus.includes('correspondent') ? {color: '#ef4444'} : {}]}>
              {pwdStatus}
            </Text>
          )}
          
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#8b5cf6' }]} onPress={handleChangePassword} disabled={pwdLoading}>
            {pwdLoading ? <ActivityIndicator color="#fff" /> : (
              <>
                <KeyRound size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Modifier le mot de passe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Section Mentions Légales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={24} color="#10b981" />
            <Text style={styles.sectionTitle}>Mentions Légales</Text>
          </View>
          <TouchableOpacity style={styles.legalLinkButton}>
            <Text style={styles.legalLinkText}>Conditions Générales d'Utilisation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLinkButton}>
            <Text style={styles.legalLinkText}>Politique de Confidentialité</Text>
          </TouchableOpacity>
        </View>

        {/* Bouton de Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#e53e3e" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.logoutButton, {marginTop: 10, borderColor: '#aaa'}]} onPress={() => navigation.navigate('Legal')}>
          <Text style={[styles.logoutButtonText, {color: '#555'}]}>Mentions Légales & Confidentialité</Text>
        </TouchableOpacity>

        {/* Zone de danger */}
        <View style={styles.sectionDanger}>
          <Text style={styles.sectionDangerTitle}>Zone de danger</Text>
          <Text style={styles.sectionDangerText}>La suppression de votre compte effacera définitivement toutes vos données.</Text>
          <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
            <Trash2 size={24} color="#ffffff" />
            <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
        
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
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  avatarRing: {
    position: 'absolute',
    top: -5, left: -5, right: -5, bottom: -5,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 5,
  },
  roleBadge: {
    marginTop: 15,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  roleText: {
    color: '#60a5fa',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 35,
    paddingHorizontal: 20,
    minHeight: height - 300,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  successText: {
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  legalLinkButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  legalLinkText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sectionDanger: {
    marginTop: 30,
    backgroundColor: '#fff0f0',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  sectionDangerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#b91c1c',
    marginBottom: 10,
  },
  sectionDangerText: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 20,
    lineHeight: 20,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#dc2626',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  deleteAccountText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
