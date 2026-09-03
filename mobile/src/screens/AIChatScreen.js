import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { Send, Bot, User, Sparkles } from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const { height } = Dimensions.get('window');
const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: "Bonjour ! Je suis ton tuteur IA. Comment puis-je t'aider avec tes cours aujourd'hui ?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(50));
  const flatListRef = useRef();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(translateAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);

    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await axios.post(`${API_URL}/chat/`, 
        { message: userMessage.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const botMessage = { id: (Date.now() + 1).toString(), text: res.data.answer || res.data.response, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage = { id: (Date.now() + 1).toString(), text: "Désolé, je n'ai pas pu me connecter au serveur.", isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.isBot ? styles.botRow : styles.userRow]}>
      {item.isBot && (
        <View style={styles.botAvatar}>
          <Bot size={18} color="#fff" />
        </View>
      )}
      <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Tuteur IA</Text>
            <Text style={styles.headerSubtitle}>Toujours là pour vous aider</Text>
          </View>
          <View style={styles.proBadge}>
            <Sparkles size={16} color="#fbbf24" />
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingText}>L'IA réfléchit...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Posez votre question..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]} onPress={sendMessage} disabled={!input.trim()}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
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
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 16, color: '#94a3b8', marginTop: 5 },
  proBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 20,
    overflow: 'hidden',
  },
  chatContainer: { padding: 20, paddingBottom: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  botRow: { justifyContent: 'flex-start' },
  userRow: { justifyContent: 'flex-end' },
  botAvatar: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  messageBubble: { maxWidth: '80%', padding: 16, borderRadius: 24 },
  botBubble: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  userBubble: { backgroundColor: '#3b82f6', borderBottomRightRadius: 4, shadowColor: '#3b82f6', shadowOpacity: 0.2, shadowRadius: 5, elevation: 2 },
  messageText: { fontSize: 16, lineHeight: 24 },
  botText: { color: '#0f172a' },
  userText: { color: '#ffffff' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  loadingText: { marginLeft: 10, color: '#94a3b8', fontStyle: 'italic' },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  }
});
