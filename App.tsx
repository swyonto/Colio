import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { CampusProvider, useCampus } from './src/context/CampusContext';
import { GlassHeader } from './src/components/common/GlassHeader';
import { GlassNavBar } from './src/components/common/GlassNavBar';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { ExpensesScreen } from './src/screens/ExpensesScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { BooksScreen } from './src/screens/BooksScreen';
import { IdCardScreen } from './src/screens/IdCardScreen';
import { HolidaysScreen } from './src/screens/HolidaysScreen';
import { CgpaScreen } from './src/screens/CgpaScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ProfileDialog } from './src/screens/ProfileDialog';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { OnboardingSetupScreen } from './src/screens/OnboardingSetupScreen';
import { Colors } from './src/theme/colors';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentTheme,
    isSetupComplete,
    setIsSetupComplete,
    currentUser,
    logout,
  } = useCampus();
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [onboardingStage, setOnboardingStage] = useState<'welcome' | 'setup'>('welcome');

  // Clear any open sub-screen on logout (Must be at top level before conditional returns)
  useEffect(() => {
    if (!currentUser) {
      setActiveSubScreen(null);
    }
  }, [currentUser]);

  // Android Hardware Back Button Handler (Must be at top level before conditional returns)
  useEffect(() => {
    const backAction = () => {
      // If in a sub-screen, close it
      if (activeSubScreen) {
        setActiveSubScreen(null);
        return true;
      }
      // If on a tab other than home, go to home
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      // On home tab → let system handle (exit app)
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeSubScreen, activeTab]);

  // === FLOW 1: Auth Gate ===
  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.rootContainer, { backgroundColor: currentTheme.bgBase }]} edges={['top', 'left', 'right']}>
        <StatusBar style={currentTheme.isDark ? 'light' : 'dark'} />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  // === FLOW 2: New User Onboarding (Straight to Setup Page) ===
  if (!isSetupComplete) {
    return (
      <SafeAreaView style={[styles.rootContainer, { backgroundColor: currentTheme.bgBase }]} edges={['top', 'left', 'right']}>
        <StatusBar style={currentTheme.isDark ? 'light' : 'dark'} />
        <OnboardingSetupScreen
          onBackToWelcome={() => logout()}
          onFinishSetup={() => {
            setIsSetupComplete(true);
          }}
        />
      </SafeAreaView>
    );
  }

  // === FLOW 3: Main App ===

  const renderContent = () => {
    // Sub-screens overlay (Back button returns to previous view)
    if (activeSubScreen === 'profile') {
      return <ProfileScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === 'books') {
      return <BooksScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === 'idcard') {
      return <IdCardScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === 'holidays') {
      return <HolidaysScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === 'cgpa') {
      return <CgpaScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === 'tasks') {
      return <TasksScreen onBack={() => setActiveSubScreen(null)} />;
    }

    // Main 5 Tabs
    switch (activeTab) {
      case 'attend':
        return <AttendanceScreen />;
      case 'timetable':
        return <TimetableScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'more':
        return (
          <MoreScreen
            onOpenSection={(sec) => setActiveSubScreen(sec)}
            onOpenProfile={() => setActiveSubScreen('profile')}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            onNavigateTab={(tab) => {
              setActiveSubScreen(null);
              setActiveTab(tab);
            }}
            onOpenMoreSection={(sec) => setActiveSubScreen(sec)}
            onOpenProfile={() => setActiveSubScreen('profile')}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.rootContainer, { backgroundColor: currentTheme.bgBase }]} edges={['top', 'left', 'right']}>
      <StatusBar style={currentTheme.isDark ? 'light' : 'dark'} />

      {/* Header Bar (Shown when not in sub-screens with their own header) */}
      {!activeSubScreen && (
        <GlassHeader onPressProfile={() => setActiveSubScreen('profile')} />
      )}

      {/* Screen Body */}
      <View style={[styles.bodyContainer, { backgroundColor: currentTheme.bgBase }]}>{renderContent()}</View>

      {/* Bottom Navigation Bar (Shown on 5 primary tabs) */}
      {!activeSubScreen && <GlassNavBar />}

      {/* Profile & Nickname Customization Dialog */}
      <ProfileDialog visible={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <CampusProvider>
        <MainAppContent />
      </CampusProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  bodyContainer: {
    flex: 1,
    position: 'relative',
  },
});
