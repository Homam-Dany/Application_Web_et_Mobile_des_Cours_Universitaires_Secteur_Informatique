import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView, Animated, Easing } from 'react-native';
import axios from 'axios';
import { UserPlus, ChevronLeft, Terminal, User, Mail, Lock, Code, Cpu } from 'lucide-react-native';

const API_URL = Platform.OS === 'web' 
  ? `http://${window.location.hostname}:8000/api/v1` 
  : 'http://10.0.2.2:8000/api/v1';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      if (Platform.OS === 'web') window.alert('Veuillez remplir tous les champs');
      else Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    if (password !== confirmPassword) {
      if (Platform.OS === 'web') window.alert('Les mots de passe ne correspondent pas');
      else Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/register/`, {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      });

      if (Platform.OS === 'web') {
        window.alert(response.data.message);
      } else {
        Alert.alert('Succès', response.data.message);
      }
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la création du compte';
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

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronLeft size={28} color="#00ffcc" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconWrapper}>
            <Terminal size={48} color="#00ffcc" />
          </View>
          <Text style={styles.title}>NOUVEL_<Text style={{color: '#00ffcc'}}>ACCÈS</Text></Text>
          <Text style={styles.subtitle}>Initialisation Utilisateur</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.inputGroup}>
            <User color="#94a3b8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              placeholderTextColor="#64748b"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.inputGroup}>
            <User color="#94a3b8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nom"
              placeholderTextColor="#64748b"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email universitaire"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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

          <View style={styles.inputGroup}>
            <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#64748b"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.buttonText}>Valider Inscription</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
        
        {/* Footer IT symbols */}
        <View style={styles.footerSymbols}>
          <Code size={24} color="rgba(0, 255, 204, 0.2)" />
          <Cpu size={24} color="rgba(0, 255, 204, 0.2)" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Very dark cyber blue
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
    backgroundColor: 'rgba(0, 255, 204, 0.08)', // Neon cyan blur
    top: -50,
    left: -100,
    transform: [{ scale: 1.2 }],
    filter: 'blur(40px)',
  },
  circle2: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(59, 130, 246, 0.08)', // Blue blur
    bottom: -100,
    right: -100,
    transform: [{ scale: 1.5 }],
    filter: 'blur(50px)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 20,
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    zIndex: 10,
  },
  iconWrapper: {
    padding: 15,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
    marginBottom: 15,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
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
    outlineStyle: 'none',
  },
  button: {
    backgroundColor: '#00ffcc', // Neon Cyan
    borderRadius: 16,
    padding: 18,
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
  },
  footerSymbols: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 40,
    opacity: 0.5,
  }
});
