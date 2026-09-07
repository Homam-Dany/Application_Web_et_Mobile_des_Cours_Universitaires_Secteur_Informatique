import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, Brain, Bot, User, Settings, Database } from 'lucide-react-native';
import { Platform, ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

import HomeScreen from '../screens/HomeScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminResourcesScreen from '../screens/AdminResourcesScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminCoursesScreen from '../screens/AdminCoursesScreen';
import CoursesScreen from '../screens/CoursesScreen';
import PracticeScreen from '../screens/PracticeScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ProfileScreen from '../screens/ProfileScreen';



const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route }) {
  const { setUserToken } = route.params;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      let token;
      if (Platform.OS === 'web') {
        token = localStorage.getItem('access_token');
      } else {
        token = await SecureStore.getItemAsync('access_token');
      }
      if (!token) {
        setUserToken(null);
        return;
      }
      const res = await api.get(`/users/me/`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setIsAdmin(res.data.role === 'admin' || res.data.role === 'teacher');
    } catch (e) {
      console.error("Session invalide ou expirée:", e);
      if (Platform.OS === 'web') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } else {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
      }
      setUserToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Accueil' || route.name === 'Dashboard') {
            return <Home size={size} color={color} />;
          } else if (route.name === 'Cours' || route.name === 'Modules') {
            return <BookOpen size={size} color={color} />;
          } else if (route.name === 'Entraînement') {
            return <Brain size={size} color={color} />;
          } else if (route.name === 'IA Chatbot') {
            return <Bot size={size} color={color} />;
          } else if (route.name === 'Fichiers') {
            return <Database size={size} color={color} />;
          } else if (route.name === 'Utilisateurs') {
            return <Settings size={size} color={color} />;
          } else if (route.name === 'Profil') {
            return <User size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#3b82f6', // Primary blue
        tabBarInactiveTintColor: '#94a3b8', // Gray
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      {isAdmin ? (
        <>
          <Tab.Screen 
            name="Dashboard" 
            component={AdminDashboardScreen} 
          />
          <Tab.Screen 
            name="Cours" 
            component={CoursesScreen} 
          />
          <Tab.Screen 
            name="Utilisateurs" 
            component={AdminUsersScreen} 
          />
        </>
      ) : (
        <Tab.Screen 
          name="Accueil" 
          component={HomeScreen} 
          initialParams={{ setUserToken }} 
        />
      )}
      {!isAdmin && <Tab.Screen name="Cours" component={CoursesScreen} initialParams={{ setUserToken }} />}
      {!isAdmin && <Tab.Screen name="Entraînement" component={PracticeScreen} />}
      {!isAdmin && <Tab.Screen name="IA Chatbot" component={AIChatScreen} />}
      
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        initialParams={{ setUserToken }} 
      />
    </Tab.Navigator>
  );
}
