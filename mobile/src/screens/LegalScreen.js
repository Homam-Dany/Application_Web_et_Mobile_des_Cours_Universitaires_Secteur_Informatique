import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LegalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Politique de confidentialité</Text>
        
        <Text style={styles.sectionTitle}>1. Collecte des données</Text>
        <Text style={styles.text}>
          Nous collectons votre adresse email pour vous permettre de vous connecter et de sauvegarder votre progression (QCM, Flashcards).
        </Text>

        <Text style={styles.sectionTitle}>2. Utilisation de l'Intelligence Artificielle</Text>
        <Text style={styles.text}>
          Afin de vous fournir une expérience personnalisée, certains contenus (Résumés de cours, QCM d'entraînement) sont générés par des algorithmes d'Intelligence Artificielle (IA). 
          {"\n\n"}
          Important : Tout le contenu évaluatif généré par l'IA est soumis à une validation humaine par l'équipe pédagogique avant d'être publié officiellement sur la plateforme.
        </Text>
        
        <Text style={styles.sectionTitle}>3. Vos droits</Text>
        <Text style={styles.text}>
          Conformément à la réglementation, vous pouvez demander la suppression complète de votre compte et de vos données depuis l'écran "Profil".
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
  },
});
