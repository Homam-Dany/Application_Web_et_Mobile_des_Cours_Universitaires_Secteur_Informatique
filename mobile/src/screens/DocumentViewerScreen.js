import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Modal, TextInput, FlatList, KeyboardAvoidingView } from 'react-native';
import { ChevronLeft, Brain, MessageCircle, Send, X, ExternalLink } from 'lucide-react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

// Conditionally import WebView to avoid crashes on Web if it's not supported natively
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export default function DocumentViewerScreen({ route, navigation }) {
  const { resource } = route.params;

  // AI Tutor State
  const [chatVisible, setChatVisible] = React.useState(false);
  const [messages, setMessages] = React.useState([{ id: '1', text: "Bonjour ! Je suis votre Tuteur IA. Que puis-je vous expliquer sur ce cours ?", sender: 'ai' }]);
  const [inputText, setInputText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const flatListRef = React.useRef(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const response = await axios.post(`${API_URL}/tutor/chat/`, 
        { message: userMessage.text, documentTitle: resource.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiMessage = { id: (Date.now() + 1).toString(), text: response.data.reply, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Désolé, je suis hors-ligne pour le moment.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  // The direct download URL from Google Drive
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${resource.drive_file_id}`;
  
  // We MUST use the native Google Drive preview because Google Docs Viewer 
  // cannot access private/restricted Google Drive files and returns a login HTML page.
  const viewerUrl = `https://drive.google.com/file/d/${resource.drive_file_id}/preview`;


  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{resource.title}</Text>
          <Text style={styles.headerSubtitle}>{resource.chapterName || 'Document'}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: '#8b5cf6' }]}
            onPress={() => setChatVisible(true)}
          >
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.headerButtonText}>Tuteur IA</Text>
          </TouchableOpacity>
          
          {resource.resource_type === 'course' && (
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: '#3b82f6', marginLeft: 10 }]}
              onPress={() => navigation.navigate('QCM', { chapterId: resource.chapter, resourceId: resource.id })}
            >
              <Brain size={20} color="#fff" />
              <Text style={styles.headerButtonText}>QCM</Text>
            </TouchableOpacity>
          )}

          {Platform.OS === 'web' && (
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: '#0284c7', marginLeft: 10 }]}
              onPress={() => window.open(viewerUrl, '_blank')}
            >
              <ExternalLink size={20} color="#fff" />
              <Text style={styles.headerButtonText}>Plein écran</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Viewer */}
      <View style={[styles.viewerContainer, { overflow: 'hidden', position: 'relative' }]}>
        {Platform.OS === 'web' ? (
          <iframe
            src={viewerUrl}
            style={{ 
              position: 'absolute',
              top: -56, /* CSS Hack: Hide Google Drive toolbar */
              left: 0,
              width: '100%', 
              height: 'calc(100% + 56px)', 
              border: 'none' 
            }}
            title={resource.title}
            allowFullScreen
          />
        ) : (
          <WebView
            source={{ uri: viewerUrl }}
            style={{ marginTop: -56, flex: 1, width: '100%', height: '100%' }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            )}
          />
        )}
      </View>

      {/* AI Tutor Chat Modal */}
      <Modal visible={chatVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.chatModalOverlay}>
          <View style={styles.chatModalContent}>
            <View style={styles.chatHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Brain size={24} color="#8b5cf6" />
                <Text style={styles.chatHeaderTitle}>Tuteur IA - {resource.title.length > 20 ? resource.title.substring(0,20)+'...' : resource.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setChatVisible(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.chatList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            
            {isTyping && (
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text style={{marginLeft: 10, color: '#64748b', fontStyle: 'italic'}}>Le tuteur écrit...</Text>
              </View>
            )}
            
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Posez votre question sur ce cours..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage}
                placeholderTextColor="#94a3b8"
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
              >
                <Send size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 40, // Avoid safe area issues, can adjust based on SafeAreaView
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  downloadButton: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  chatModalContent: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginLeft: 10,
  },
  chatList: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#334155',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 15,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 45,
    maxHeight: 120,
    fontSize: 15,
    color: '#0f172a',
  },
  sendButton: {
    backgroundColor: '#8b5cf6',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginBottom: 2,
  },
});
