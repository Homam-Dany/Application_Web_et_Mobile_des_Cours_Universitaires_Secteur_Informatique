import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Linking } from 'react-native';
import { ChevronLeft, Download, Brain } from 'lucide-react-native';

// Conditionally import WebView to avoid crashes on Web if it's not supported natively
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export default function DocumentViewerScreen({ route, navigation }) {
  const { resource } = route.params;

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
        
        {resource.resource_type === 'course' && (
          <TouchableOpacity 
            style={styles.qcmButton}
            onPress={() => navigation.navigate('QCM', { chapterId: resource.chapter, resourceId: resource.id })}
          >
            <Brain size={20} color="#fff" />
            <Text style={styles.qcmButtonText}>QCM</Text>
          </TouchableOpacity>
        )}
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
  qcmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  qcmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
