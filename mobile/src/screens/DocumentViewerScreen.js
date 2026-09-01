import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { ChevronLeft, Download } from 'lucide-react-native';
import * as Linking from 'expo-linking';

// Conditionally import WebView to avoid crashes on Web if it's not supported natively
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export default function DocumentViewerScreen({ route, navigation }) {
  const { resource } = route.params;

  // The direct download URL from Google Drive
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${resource.drive_file_id}`;
  
  // The URL to embed it cleanly in Google Docs Viewer
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`;

  const handleDownload = () => {
    Linking.openURL(downloadUrl).catch(err => console.error("Couldn't open link", err));
  };

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
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Download size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Viewer */}
      <View style={styles.viewerContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={viewerUrl}
            style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
            title={resource.title}
            allowFullScreen
          />
        ) : (
          <WebView
            source={{ uri: viewerUrl }}
            style={{ flex: 1 }}
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
