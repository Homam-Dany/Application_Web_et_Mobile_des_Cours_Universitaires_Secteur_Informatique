import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Platform } from 'react-native';
import { FileText, ChevronLeft, Download, Folder } from 'lucide-react-native';

export default function ModuleDetailScreen({ route, navigation }) {
  const { module } = route.params;

  // Flatten resources from all chapters
  let allResources = [];
  if (module.chapters) {
    module.chapters.forEach(chapter => {
      if (chapter.resources) {
        chapter.resources.forEach(res => {
          allResources.push({
            ...res,
            chapterName: chapter.title
          });
        });
      }
    });
  }

  const handleOpenResource = (resource) => {
    if (resource.drive_file_id) {
      navigation.navigate('DocumentViewer', { resource });
    } else {
      if (Platform.OS === 'web') {
        window.alert('Ce document n\'a pas de lien valide.');
      }
    }
  };

  const renderResource = ({ item }) => (
    <TouchableOpacity style={styles.resourceCard} onPress={() => handleOpenResource(item)}>
      <View style={styles.iconContainer}>
        <FileText size={24} color="#10b981" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceSubtitle}>{item.chapterName || 'Général'}</Text>
      </View>
      <Download size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color="#0f172a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{module.name}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Folder size={24} color="#3b82f6" />
          <Text style={styles.infoText}>{allResources.length} document(s) disponible(s)</Text>
        </View>

        <Text style={styles.sectionTitle}>Ressources du Module</Text>

        {allResources.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FileText size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>Aucun document pour ce module.</Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1, width: '100%' }}
            data={allResources}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderResource}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  infoText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 15,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    padding: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  resourceSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 15,
    fontSize: 16,
  }
});
