import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BookOpen } from 'lucide-react-native';

const API_URL = Platform.OS === 'web' 
  ? `http://${window.location.hostname}:8000/api/v1` 
  : 'http://10.0.2.2:8000/api/v1';

export default function LoginScreen({ route, navigation }) {
  const { setUserToken } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez remplir tous les champs');
      } else {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      }
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/token/`, {
        username: email,
        password,
      });

      const { access, refresh } = response.data;
      
      if (Platform.OS === 'web') {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
      } else {
        await SecureStore.setItemAsync('access_token', access);
        await SecureStore.setItemAsync('refresh_token', refresh);
      }
      
      setUserToken(access);
    } catch (error) {
      console.error(error);
      const errorData = error.response?.data;
      let errorMsg = 'Identifiants incorrects ou problème de connexion.';
      
      if (errorData?.detail && typeof errorData.detail === 'string' && errorData.detail.toLowerCase().includes('active')) {
        errorMsg = 'Votre compte est en attente de validation par un administrateur.';
      } else if (Platform.OS === 'web') {
        errorMsg += ' (assurez-vous que le backend tourne)';
      }

      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert('Erreur', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <BookOpen size={64} color="#3b82f6" />
        <Text style={styles.title}>Homam_Tech</Text>
        <Text style={styles.subtitle}>Espace Mobile</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Vous n'avez pas de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light theme background
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a', // Dark text
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b', // Gray text
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff', // White input background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: '#0f172a',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1', // Light gray border
  },
  button: {
    backgroundColor: '#3b82f6', // Primary blue
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  registerText: {
    color: '#64748b',
    fontSize: 15,
  },
  registerLink: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
