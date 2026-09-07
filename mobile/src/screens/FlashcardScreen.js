import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import api from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { Layers, RotateCw } from 'lucide-react-native';



export default function FlashcardScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }
      
      const res = await api.get(`/flashcards/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#0f172a', marginTop: 10 }}>Chargement des Flashcards...</Text>
      </View>
    );
  }

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <View style={styles.centerContainer}>
        <Layers size={64} color="#10b981" />
        <Text style={styles.doneTitle}>Tout est à jour !</Text>
        <Text style={styles.doneText}>Vous avez révisé toutes vos cartes pour aujourd'hui.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Layers size={28} color="#3b82f6" />
        <Text style={styles.headerTitle}>Révision (Flashcards)</Text>
      </View>

      <Text style={styles.progressText}>Carte {currentIndex + 1} sur {cards.length}</Text>

      <TouchableOpacity 
        style={[styles.card, isFlipped ? styles.cardBack : styles.cardFront]} 
        onPress={() => setIsFlipped(!isFlipped)}
        activeOpacity={0.8}
      >
        <View style={styles.rotateIcon}>
          <RotateCw size={20} color={isFlipped ? "#0f172a" : "rgba(255,255,255,0.7)"} />
        </View>
        <Text style={[styles.cardText, { color: isFlipped ? '#0f172a' : '#ffffff' }]}>
          {isFlipped ? currentCard.back : currentCard.front}
        </Text>
      </TouchableOpacity>

      {isFlipped && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.hardButton]} onPress={handleNext}>
            <Text style={styles.hardButtonText}>Difficile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.easyButton]} onPress={handleNext}>
            <Text style={styles.easyButtonText}>Facile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light theme background
    padding: 20,
    paddingTop: 50,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  progressText: {
    color: '#64748b',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    minHeight: 300,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardFront: {
    backgroundColor: '#3b82f6',
  },
  cardBack: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rotateIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  cardText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    backgroundColor: '#ffffff',
  },
  hardButton: {
    borderColor: '#ef4444',
  },
  hardButtonText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  easyButton: {
    borderColor: '#10b981',
  },
  easyButtonText: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneTitle: {
    fontSize: 24,
    color: '#0f172a',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  doneText: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
