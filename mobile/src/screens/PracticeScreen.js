import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Brain, Layers, Code } from 'lucide-react-native';

export default function PracticeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Entraînement</Text>

      <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Flashcards')}>
        <View style={styles.iconContainer}>
          <Layers size={28} color="#10b981" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.actionTitle}>Flashcards</Text>
          <Text style={styles.actionSubtitle}>Révisez vos concepts clés</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <View style={styles.iconContainer}>
          <Brain size={28} color="#f59e0b" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.actionTitle}>QCM (IA)</Text>
          <Text style={styles.actionSubtitle}>Testez vos connaissances</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard}>
        <View style={styles.iconContainer}>
          <Code size={28} color="#8b5cf6" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.actionTitle}>Code Playground</Text>
          <Text style={styles.actionSubtitle}>Entraînez-vous à coder</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  textContainer: {
    marginLeft: 15,
  },
  actionTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionSubtitle: {
    color: '#64748b',
    marginTop: 2,
  }
});
