import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Animated, Easing } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Terminal, Lock, Mail, ChevronRight, Code, Cpu } from 'lucide-react-native';

const API_URL = Platform.OS === 'web' 
  ? `http://${window.location.hostname}:8000/api/v1` 
  : 'http://10.0.2.2:8000/api/v1';

export default function LoginScreen({ route, navigation }) {
  const { setUserToken } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.exp), useNativeDriver: true })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      ])
    ).start();
  }, []);

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
      {/* Decorative Background Elements */}
      <View style={[styles.bgCircle, styles.circle1]} />
      <View style={[styles.bgCircle, styles.circle2]} />
      
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.iconWrapper}>
          <Terminal size={56} color="#00ffcc" />
        </View>
        <Text style={styles.title}>TECH<Text style={{color: '#00ffcc'}}>_ACADEMY</Text></Text>
        <Text style={styles.subtitle}>Espace Étudiant Informatique</Text>
      </Animated.View>

      <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.inputGroup}>
          <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Adresse Email"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <>
              <Text style={styles.buttonText}>Initialiser Session</Text>
              <ChevronRight size={20} color="#0f172a" />
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Nouvel étudiant ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Créer un accès système</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Footer IT symbols */}
      <View style={styles.footerSymbols}>
        <Code size={24} color="rgba(0, 255, 204, 0.2)" />
        <Cpu size={24} color="rgba(0, 255, 204, 0.2)" />
        <Terminal size={24} color="rgba(0, 255, 204, 0.2)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Very dark cyber blue
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
  },
  circle1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(0, 255, 204, 0.1)', // Neon cyan blur
    top: -100,
    right: -100,
    transform: [{ scale: 1.2 }],
    filter: 'blur(40px)',
  },
  circle2: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue blur
    bottom: -50,
    left: -100,
    transform: [{ scale: 1.5 }],
    filter: 'blur(50px)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
    zIndex: 10,
  },
  iconWrapper: {
    padding: 20,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
    marginBottom: 20,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 16,
    paddingVertical: 16,
    outlineStyle: 'none', // for web
  },
  button: {
    backgroundColor: '#00ffcc', // Neon Cyan
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  registerLink: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerSymbols: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    opacity: 0.5,
  }
});
