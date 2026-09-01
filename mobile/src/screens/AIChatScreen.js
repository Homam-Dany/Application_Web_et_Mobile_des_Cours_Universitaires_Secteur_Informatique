import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, Bot, User } from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    { id: '1', text: "Bonjour ! Je suis ton tuteur IA. Comment puis-je t'aider avec tes cours d'informatique aujourd'hui ?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }

      const res = await axios.post(`${API_URL}/chat/`, 
        { message: userMessage.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const botMessage = { id: (Date.now() + 1).toString(), text: res.data.response, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
      const errorMessage = { id: (Date.now() + 1).toString(), text: "Désolé, je n'ai pas pu me connecter au serveur.", isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageRow, item.isBot ? styles.botRow : styles.userRow]}>
      {item.isBot && <View style={styles.botAvatar}><Bot size={18} color="#fff" /></View>}
      <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>{item.text}</Text>
      </View>
      {!item.isBot && <View style={styles.userAvatar}><User size={18} color="#fff" /></View>}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Bot size={28} color="#3b82f6" />
        <Text style={styles.headerTitle}>Tuteur IA</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
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
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 10,
  },
  chatContainer: {
    padding: 15,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    backgroundColor: '#3b82f6',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: '#10b981',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  botText: {
    color: '#0f172a',
  },
  userText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  loadingText: {
    color: '#64748b',
    marginLeft: 10,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  }
});
