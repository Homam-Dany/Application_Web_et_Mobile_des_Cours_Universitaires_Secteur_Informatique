import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, Brain, Bot, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import PracticeScreen from '../screens/PracticeScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route }) {
  const { setUserToken } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Accueil') {
            return <Home size={size} color={color} />;
          } else if (route.name === 'Cours') {
            return <BookOpen size={size} color={color} />;
          } else if (route.name === 'Entraînement') {
            return <Brain size={size} color={color} />;
          } else if (route.name === 'IA Chatbot') {
            return <Bot size={size} color={color} />;
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
      <Tab.Screen 
        name="Accueil" 
        component={HomeScreen} 
        initialParams={{ setUserToken }} 
      />
      <Tab.Screen name="Cours" component={CoursesScreen} initialParams={{ setUserToken }} />
      <Tab.Screen name="Entraînement" component={PracticeScreen} />
      <Tab.Screen name="IA Chatbot" component={AIChatScreen} />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        initialParams={{ setUserToken }} 
      />
    </Tab.Navigator>
  );
}
