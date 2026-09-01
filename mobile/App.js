import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import FlashcardScreen from './src/screens/FlashcardScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ModuleDetailScreen from './src/screens/ModuleDetailScreen';
import DocumentViewerScreen from './src/screens/DocumentViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token;
      try {
        if (Platform.OS === 'web') {
          token = localStorage.getItem('access_token');
        } else {
          token = await SecureStore.getItemAsync('access_token');
        }
      } catch (e) {
        // Restoring token failed
      }
      setUserToken(token);
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            initialParams={{ setUserToken }} 
          />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} initialParams={{ setUserToken }} />
            <Stack.Screen 
              name="Flashcards" 
              component={FlashcardScreen} 
            />
            <Stack.Screen 
              name="ModuleDetail" 
              component={ModuleDetailScreen} 
            />
            <Stack.Screen 
              name="DocumentViewer" 
              component={DocumentViewerScreen} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
