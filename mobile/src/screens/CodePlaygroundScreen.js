import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { ChevronLeft, Play, CheckCircle, XCircle, Lightbulb, Code } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function CodePlaygroundScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('Python');
  const languages = ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Rust', 'SQL'];
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const evaluateCode = async () => {
    if (!code.trim()) {
      if (Platform.OS === 'web') window.alert("Veuillez saisir du code.");
      else alert("Veuillez saisir du code.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await axios.post(`${API_URL}/code/evaluate/`, {
        code,
        language
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setResult(res.data);
    } catch (e) {
      console.error(e);
      setResult({
        is_correct: false,
        feedback: "Erreur de connexion au serveur d'évaluation.",
        hints: []
      });
    } finally {
      setLoading(false);
    }
  };

  const highlightCode = (text) => {
    if (!text) return null;
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'class', 'async', 'await', 'try', 'catch', 'def', 'print', 'import', 'from', 'public', 'private', 'void', 'int', 'string', 'bool', 'true', 'false', 'null'];
    const stringRegex = /(['"`])(.*?)\1/g;
    
    // We do a very basic split by spaces and brackets to colorize words
    const tokens = text.split(/([ \n\t\r\(\)\{\}\[\]\.,;=+\-*/:])/);
    
    return tokens.map((token, index) => {
      if (keywords.includes(token)) {
        return <Text key={index} style={{ color: '#c678dd', fontWeight: 'bold' }}>{token}</Text>;
      } else if (!isNaN(token) && token.trim() !== '') {
        return <Text key={index} style={{ color: '#d19a66' }}>{token}</Text>;
      } else if (token === 'function' || token === 'def' || token === 'class') {
        return <Text key={index} style={{ color: '#c678dd' }}>{token}</Text>;
      }
      return <Text key={index} style={{ color: '#abb2bf' }}>{token}</Text>;
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Code Playground</Text>
          <Text style={styles.headerSubtitle}>Écrivez, compilez et testez votre code</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <View style={styles.codeHeader}>
            <Text style={styles.label}>Votre Code :</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={language}
                onValueChange={(itemValue) => setLanguage(itemValue)}
                style={styles.pickerStyle}
                dropdownIconColor="#94a3b8"
                mode="dropdown"
              >
                {languages.map(lang => (
                  <Picker.Item label={lang} value={lang} key={lang} color={Platform.OS === 'web' ? '#000' : undefined} />
                ))}
              </Picker>
            </View>
          </View>
          
          <View style={styles.editorContainer}>
            <View style={{ flex: 1, position: 'relative' }}>
              <Text style={styles.syntaxHighlightedText}>
                {highlightCode(code)}
              </Text>
              <TextInput
                style={styles.inputCode}
                placeholder="// Écrivez votre code ici..."
                placeholderTextColor="#5c6370"
                value={code}
                onChangeText={setCode}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.evalButton, (!code.trim() || loading) && { opacity: 0.7 }]} 
          onPress={evaluateCode}
          disabled={!code.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Play size={20} color="#fff" />
              <Text style={styles.evalButtonText}>Évaluer avec l'IA</Text>
            </>
          )}
        </TouchableOpacity>

        {result && (
          <View style={[styles.resultCard, result.is_correct ? styles.resultCorrect : styles.resultError]}>
            <View style={styles.resultHeader}>
              {result.is_correct ? <CheckCircle size={28} color="#10b981" /> : <XCircle size={28} color="#ef4444" />}
              <Text style={[styles.resultTitle, result.is_correct ? { color: '#10b981' } : { color: '#ef4444' }]}>
                {result.is_correct ? "Code Correct !" : "Code Incorrect"}
              </Text>
            </View>
            
            <Text style={styles.feedbackText}>{result.feedback}</Text>

            {result.hints && result.hints.length > 0 && (
              <View style={styles.hintsContainer}>
                <View style={styles.hintsHeader}>
                  <Lightbulb size={20} color="#fbbf24" />
                  <Text style={styles.hintsTitle}>Indices :</Text>
                </View>
                {result.hints.map((hint, idx) => (
                  <View key={idx} style={styles.hintRow}>
                    <Text style={styles.hintDot}>•</Text>
                    <Text style={styles.hintText}>{hint}</Text>
                  </View>
                ))}
              </View>
            )}

            {result.corrected_code && (
              <View style={styles.correctionContainer}>
                <View style={styles.hintsHeader}>
                  <Code size={20} color="#10b981" />
                  <Text style={[styles.hintsTitle, { color: '#10b981' }]}>Correction de l'IA :</Text>
                </View>
                <View style={styles.correctionCodeBox}>
                  <Text style={styles.correctionCodeText}>{result.corrected_code}</Text>
                </View>
              </View>
            )}
          </View>
        )}
        
        <View style={{height: 100}} />
      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  backButton: {
    marginRight: 15,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#334155',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerStyle: {
    color: '#fff',
    width: 140,
    height: 36,
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        paddingLeft: 10,
        fontWeight: 'bold',
      }
    })
  },
  editorContainer: {
    backgroundColor: '#282c34', // VS Code One Dark Pro background
    borderRadius: 16,
    minHeight: 250,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  syntaxHighlightedText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingTop: 18, // Adjust for input padding
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'transparent', // The real text is transparent, syntax is colored
    lineHeight: 22,
    zIndex: 1,
  },
  inputCode: {
    padding: 16,
    fontSize: 14,
    color: Platform.OS === 'web' ? 'transparent' : '#abb2bf', // Transparent on web to show syntax below, light gray fallback on mobile
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    minHeight: 250,
    textAlignVertical: 'top',
    lineHeight: 22,
    zIndex: 2,
  },
  evalButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  evalButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resultCorrect: { borderColor: '#10b981' },
  resultError: { borderColor: '#ef4444' },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginLeft: 10,
  },
  feedbackText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  correctionContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  correctionCodeBox: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  correctionCodeText: {
    color: '#abb2bf',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
  },
  hintsContainer: {
    marginTop: 20,
    backgroundColor: '#fef3c7',
    padding: 15,
    borderRadius: 12,
  },
  hintsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hintsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b45309',
    marginLeft: 8,
  },
  hintRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  hintDot: { color: '#b45309', marginRight: 8, fontWeight: 'bold' },
  hintText: { flex: 1, color: '#92400e', fontSize: 14 },
});
