import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Platform } from 'react-native';
import { Brain, Layers, Code, Sparkles, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PracticeScreen({ navigation }) {
  // Simple animation for the cards
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} bounces={false}>
      
      {/* 🚀 Header Magique */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Entraînement</Text>
          <View style={styles.proBadge}>
            <Sparkles size={16} color="#fbbf24" />
            <Text style={styles.proText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Prêt à repousser vos limites ? Choisissez votre mode d'apprentissage et laissez l'IA vous guider.
        </Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        
        {/* Carte 1 : Flashcards */}
        <TouchableOpacity 
          style={styles.cardContainer} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Flashcards')}
        >
          <View style={[styles.card, { backgroundColor: '#10b981' }]}>
            <View style={styles.cardIcon}>
              <Layers size={32} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Flashcards</Text>
              <Text style={styles.cardDesc}>Révisez vos concepts clés avec répétition espacée.</Text>
            </View>
            <View style={styles.cardArrow}>
              <ChevronRight size={24} color="#fff" opacity={0.8} />
            </View>
          </View>
          {/* Effet d'ombre colorée */}
          <View style={[styles.cardShadow, { backgroundColor: '#10b981' }]} />
        </TouchableOpacity>

        {/* Carte 2 : QCM (IA) */}
        <TouchableOpacity 
          style={styles.cardContainer} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('QCM')}
        >
          <View style={[styles.card, { backgroundColor: '#3b82f6' }]}>
            <View style={styles.cardIcon}>
              <Brain size={32} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>QCM avec l'IA</Text>
              <Text style={styles.cardDesc}>Testez vos connaissances en temps réel contre notre IA.</Text>
            </View>
            <View style={styles.cardArrow}>
              <ChevronRight size={24} color="#fff" opacity={0.8} />
            </View>
          </View>
          <View style={[styles.cardShadow, { backgroundColor: '#3b82f6' }]} />
        </TouchableOpacity>

        {/* Carte 3 : Code Playground */}
        <TouchableOpacity 
          style={styles.cardContainer} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CodePlayground')}
        >
          <View style={[styles.card, { backgroundColor: '#8b5cf6' }]}>
            <View style={styles.cardIcon}>
              <Code size={32} color="#fff" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Code Playground</Text>
              <Text style={styles.cardDesc}>Écrivez, compilez et testez votre code directement.</Text>
            </View>
            <View style={styles.cardArrow}>
              <ChevronRight size={24} color="#fff" opacity={0.8} />
            </View>
          </View>
          <View style={[styles.cardShadow, { backgroundColor: '#8b5cf6' }]} />
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark theme background for premium look
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  proText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 35,
    paddingHorizontal: 20,
    minHeight: Dimensions.get('window').height - 180,
  },
  cardContainer: {
    marginBottom: 25,
    position: 'relative',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    zIndex: 2,
    overflow: 'hidden',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  cardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardShadow: {
    position: 'absolute',
    top: 15,
    left: 10,
    right: 10,
    bottom: -10,
    borderRadius: 24,
    zIndex: 1,
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
    filter: 'blur(10px)', // Web shadow fallback
  },
});
