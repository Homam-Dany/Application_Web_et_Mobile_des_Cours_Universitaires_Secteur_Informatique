import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FlashcardScreen from './src/screens/FlashcardScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ModuleDetailScreen from './src/screens/ModuleDetailScreen';
import DocumentViewerScreen from './src/screens/DocumentViewerScreen';
import QCMScreen from './src/screens/QCMScreen';
import CodePlaygroundScreen from './src/screens/CodePlaygroundScreen';
import LegalScreen from './src/screens/LegalScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initOfflineDB } from './src/utils/offlineSync';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from './src/services/api';

const queryClient = new QueryClient();

const Stack = createNativeStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId: 'your-project-id' })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await initOfflineDB();
      } catch (e) {
        console.error("Failed to initialize offline DB", e);
      }
      
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
      
      if (token && !Platform.OS.includes('web')) {
        try {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await api.post('/users/push-token/', { token: pushToken });
          }
        } catch(e) {
          console.warn("Could not register push token", e);
        }
      }

      setIsLoading(false);
      
      // Hide the splash screen once we are ready
      await SplashScreen.hideAsync();
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return null; 
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken == null ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                initialParams={{ setUserToken }} 
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
              />
              <Stack.Screen 
                name="Legal" 
                component={LegalScreen} 
                options={{ presentation: 'modal', headerShown: true, title: 'Mentions Légales' }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabNavigator} initialParams={{ setUserToken }} />
              <Stack.Screen 
                name="Flashcards" 
                component={FlashcardScreen} 
              />
              <Stack.Screen 
                name="QCM" 
                component={QCMScreen} 
              />
              <Stack.Screen 
                name="CodePlayground" 
                component={CodePlaygroundScreen} 
              />
              <Stack.Screen 
                name="ModuleDetail" 
                component={ModuleDetailScreen} 
              />
              <Stack.Screen 
                name="DocumentViewer" 
                component={DocumentViewerScreen} 
              />
              <Stack.Screen 
                name="Legal" 
                component={LegalScreen} 
                options={{ presentation: 'modal', headerShown: true, title: 'Mentions Légales' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
