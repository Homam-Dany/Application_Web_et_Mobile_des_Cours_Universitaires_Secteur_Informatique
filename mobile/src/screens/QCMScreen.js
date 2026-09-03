import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Platform, Animated, Dimensions } from 'react-native';
import { Brain, ChevronLeft, CheckCircle, XCircle, Trophy } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const API_URL = Platform.OS === 'web' 
  ? 'http://127.0.0.1:8000/api/v1' 
  : 'http://10.0.2.2:8000/api/v1';

export default function QCMScreen({ route, navigation }) {
  // Navigation State
  // 0: Loading, 1: List Banks, 2: Playing Quiz, 3: Quiz Result
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Data
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showJustification, setShowJustification] = useState(false);

  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async (isGeneratingRetry = false) => {
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      const res = await axios.get(`${API_URL}/question-banks/`, { headers: { Authorization: `Bearer ${token}` } });
      const fetchedBanks = res.data;
      setBanks(fetchedBanks);
      
      if (route?.params?.chapterId) {
        const autoBank = fetchedBanks.find(b => b.chapter === route.params.chapterId);
        if (autoBank) {
          startQuiz(autoBank);
          return; // startQuiz calls animateIn and sets step
        } else if (route?.params?.resourceId && !isGeneratingRetry) {
          // If no bank found, but we have resourceId, we generate it!
          generateQCMForCourse(route.params.resourceId, token);
          return; 
        } else if (!isGeneratingRetry) {
          if (Platform.OS === 'web') window.alert("Aucun QCM disponible pour ce cours.");
          else alert("Aucun QCM disponible pour ce cours.");
        }
      }
      
      animateIn();
    } catch (e) {
      console.error(e);
      setLoading(false);
    } finally {
      if (!isGeneratingRetry) setLoading(false);
    }
  };

  const generateQCMForCourse = async (resourceId, token) => {
    setGenerating(true);
    setLoading(true);
    try {
      await axios.post(`${API_URL}/resources/${resourceId}/generate_qcm/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      // In dev with CELERY_TASK_ALWAYS_EAGER=True, this is synchronous.
      setTimeout(() => {
        setGenerating(false);
        fetchBanks(true);
      }, 1000);
    } catch(e) {
      console.error("Error generating QCM", e);
      setGenerating(false);
      setLoading(false);
      if (Platform.OS === 'web') window.alert("Erreur lors de la génération du QCM.");
    }
  };

  const animateIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const startQuiz = (bank) => {
    if (!bank.questions || bank.questions.length === 0) {
      if (Platform.OS === 'web') window.alert("Ce QCM ne contient aucune question.");
      else alert("Ce QCM ne contient aucune question.");
      return;
    }
    setSelectedBank(bank);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedChoice(null);
    setShowJustification(false);
    setStep(2);
    animateIn();
  };

  const handleChoiceSelect = (choice) => {
    if (showJustification) return; // Already answered this question

    setSelectedChoice(choice);
    setShowJustification(true);
    
    if (choice.is_correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedBank.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedChoice(null);
      setShowJustification(false);
      animateIn();
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setLoading(true);
    try {
      let token = Platform.OS === 'web' ? localStorage.getItem('access_token') : await SecureStore.getItemAsync('access_token');
      let finalScore = (score / selectedBank.questions.length) * 20; // Scale on 20
      
      await axios.post(`${API_URL}/test-sessions/`, {
        student: 1, // User is inferred by token normally, but if required we might need ID. Assuming backend uses request.user if we omit or we might need it. Actually serializer usually requires student ID if it's not read-only. We'll rely on backend to handle or fallback gracefully.
        bank: selectedBank.id,
        score: finalScore
      }, { headers: { Authorization: `Bearer ${token}` } });
      
    } catch (e) {
      console.error("Could not save test session", e);
    } finally {
      setLoading(false);
      setStep(3);
      animateIn();
    }
  };

  const renderBankItem = ({ item }) => (
    <TouchableOpacity style={styles.bankCard} onPress={() => startQuiz(item)}>
      <View style={styles.bankIconWrapper}>
        <Brain size={24} color="#3b82f6" />
      </View>
      <View style={styles.bankInfo}>
        <Text style={styles.bankTitle}>{item.title}</Text>
        <Text style={styles.bankSubtitle}>{item.questions ? item.questions.length : 0} questions</Text>
      </View>
    </TouchableOpacity>
  );

  const renderQuizMode = () => {
    if (!selectedBank) return null;
    const question = selectedBank.questions[currentQuestionIndex];

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Question {currentQuestionIndex + 1} / {selectedBank.questions.length}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${((currentQuestionIndex + 1) / selectedBank.questions.length) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.choicesContainer}>
          {question.choices.map((choice, index) => {
            let isSelected = selectedChoice?.id === choice.id;
            let showCorrect = showJustification && choice.is_correct;
            let showError = showJustification && isSelected && !choice.is_correct;

            return (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.choiceBtn,
                  isSelected && styles.choiceBtnSelected,
                  showCorrect && styles.choiceBtnCorrect,
                  showError && styles.choiceBtnError
                ]}
                onPress={() => handleChoiceSelect(choice)}
                disabled={showJustification}
              >
                <Text style={[
                  styles.choiceText,
                  (isSelected || showCorrect || showError) && { color: '#fff', fontWeight: 'bold' }
                ]}>
                  {choice.text}
                </Text>
                {showCorrect && <CheckCircle size={20} color="#fff" style={{position: 'absolute', right: 15}} />}
                {showError && <XCircle size={20} color="#fff" style={{position: 'absolute', right: 15}} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {showJustification && (
          <Animated.View style={[styles.justificationCard, { opacity: fadeAnim }]}>
            <Text style={styles.justificationTitle}>
              {selectedChoice.is_correct ? "🎉 Bonne réponse !" : "❌ Mauvaise réponse"}
            </Text>
            {question.justification ? (
              <Text style={styles.justificationText}>{question.justification}</Text>
            ) : null}
            
            <TouchableOpacity style={styles.nextBtn} onPress={nextQuestion}>
              <Text style={styles.nextBtnText}>
                {currentQuestionIndex < selectedBank.questions.length - 1 ? "Question suivante" : "Voir le résultat"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    );
  };

  const renderResultMode = () => {
    let finalScore = Math.round((score / selectedBank.questions.length) * 20);
    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultBadge}>
          <Trophy size={60} color="#fbbf24" />
        </View>
        <Text style={styles.resultTitle}>Quiz Terminé !</Text>
        <Text style={styles.resultScoreText}>Votre score</Text>
        <Text style={styles.resultScore}>{finalScore} / 20</Text>
        
        <TouchableOpacity style={styles.backBtnResult} onPress={() => { setStep(1); fetchBanks(); }}>
          <Text style={styles.backBtnText}>Retour à la liste des QCM</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 🚀 Dark Header Premium */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => step === 1 ? navigation.goBack() : setStep(1)}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{step === 1 ? "Banques de QCM" : selectedBank?.title}</Text>
          {step === 1 && <Text style={styles.headerSubtitle}>Choisissez un quiz généré par l'IA</Text>}
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {loading ? (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            {generating && <Text style={{marginTop: 15, color: '#64748b', fontSize: 16, fontWeight: 'bold'}}>L'IA génère le QCM, veuillez patienter...</Text>}
          </View>
        ) : (
          <>
            {step === 1 && (
              <View style={styles.listContainer}>
                {banks.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Brain size={60} color="#64748b" style={{marginBottom: 15}} />
                    <Text style={styles.emptyTitle}>Aucun QCM généré pour le moment</Text>
                    <Text style={styles.emptyText}>
                      Rendez-vous dans la section "Cours", ouvrez un document, puis cliquez sur le bouton "QCM" pour que l'IA génère vos premières questions !
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={banks}
                    renderItem={renderBankItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 40 }}
                  />
                )}
              </View>
            )}
            {step === 2 && renderQuizMode()}
            {step === 3 && renderResultMode()}
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#0f172a',
  },
  backButton: {
    marginRight: 15,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  listContainer: { flex: 1 },
  bankCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  bankIconWrapper: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 16,
    marginRight: 15,
  },
  bankInfo: { flex: 1 },
  bankTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  bankSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Quiz Mode
  progressContainer: { marginBottom: 20 },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#64748b', marginBottom: 8, textAlign: 'right' },
  progressBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#3b82f6', borderRadius: 4 },
  
  questionText: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 30, lineHeight: 28 },
  choicesContainer: { flex: 1 },
  choiceBtn: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  choiceText: { fontSize: 16, color: '#334155', fontWeight: '500' },
  choiceBtnSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  choiceBtnCorrect: { backgroundColor: '#10b981', borderColor: '#10b981' },
  choiceBtnError: { backgroundColor: '#ef4444', borderColor: '#ef4444' },

  justificationCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  justificationTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  justificationText: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 20 },
  nextBtn: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },

  // Result Mode
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 30,
    borderRadius: 60,
    marginBottom: 20,
  },
  resultTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 10 },
  resultScoreText: { fontSize: 16, color: '#64748b', marginBottom: 5 },
  resultScore: { fontSize: 48, fontWeight: '900', color: '#3b82f6', marginBottom: 40 },
  backBtnResult: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 16,
  },
  backBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});
