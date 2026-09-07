import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // Treat null reachable as connected to prevent false positives while connecting
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      setIsConnected(online);
      
      Animated.timing(fadeAnim, {
        toValue: online ? 0 : 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <WifiOff size={16} color="#ffffff" style={styles.icon} />
      <Text style={styles.text}>Connexion Internet perdue. Mode hors-ligne.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
