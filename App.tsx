import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { OnboardingSetupScreen } from './src/screens/OnboardingSetupScreen';
import { AppThemeKey, Themes, applyTheme } from './src/theme/colors';

// Keep the native splash screen visible until we've loaded the theme from storage.
// This prevents the "dark-emerald flash" when user is on a light theme.
SplashScreen.preventAutoHideAsync().catch(() => {
  // preventAutoHideAsync throws if splash has already hidden (web/test env)
});

// ──────────────────────────────────────────────────────────────────────────────
// ThemeBootstrap — reads saved theme from AsyncStorage BEFORE first render,
// then hides the splash screen. This eliminates the cold-start theme flash.
// ──────────────────────────────────────────────────────────────────────────────
interface ThemeBootstrapProps {
  children: React.ReactNode;
}

const ThemeBootstrap: React.FC<ThemeBootstrapProps> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@colio_app_theme_v2');
        if (savedTheme && Themes[savedTheme as AppThemeKey]) {
          // Apply the saved theme to the shared Colors object BEFORE the first
          // render of any screen — eliminates the green flash on light themes.
          applyTheme(savedTheme as AppThemeKey);
        }
      } catch {
        // If storage read fails, fall through with default theme
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      // Hide splash only after we've applied the correct theme
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    // Return null while reading theme — splash screen stays visible
    return null;
  }

  return (
    <View style={styles.rootContainer} onLayout={onLayoutRootView}>
      {children}
    </View>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MainAppContent — the 3-flow app shell
// ──────────────────────────────────────────────────────────────────────────────
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

  // Clear any open sub-screen on logout
  useEffect(() => {
    if (!currentUser) setActiveSubScreen(null);
  }, [currentUser]);

  // Android Hardware Back Button Handler
  useEffect(() => {
    const backAction = () => {
      if (activeSubScreen) { setActiveSubScreen(null); return true; }
      if (activeTab !== 'home') { setActiveTab('home'); return true; }
      return false;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, [activeSubScreen, activeTab]);

  // === FLOW 1: Auth Gate ===
  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: currentTheme.bgBase }]} edges={['top', 'left', 'right']}>
        <StatusBar style={currentTheme.isDark ? 'light' : 'dark'} />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  // === FLOW 2: New User Onboarding ===
  if (!isSetupComplete) {
    return (
      <SafeAreaView style={[styles.fill, { backgroundColor: currentTheme.bgBase }]} edges={['top', 'left', 'right']}>
        <StatusBar style={currentTheme.isDark ? 'light' : 'dark'} />
        <OnboardingSetupScreen
          onBackToWelcome={() => logout()}
          onFinishSetup={() => setIsSetupComplete(true)}
        />
      </SafeAreaView>
    );
  }

  // === FLOW 3: Main App ===
  const renderContent = () => {
    if (activeSubScreen === 'profile') return <ProfileScreen onBack={() => setActiveSubScreen(null)} />;
    if (activeSubScreen === 'books') return <BooksScreen onBack={() => setActiveSubScreen(null)} />;
    if (activeSubScreen === 'idcard') return <IdCardScreen onBack={() => setActiveSubScreen(null)} />;
    if (activeSubScreen === 'holidays') return <HolidaysScreen onBack={() => setActiveSubScreen(null)} />;
    if (activeSubScreen === 'cgpa') return <CgpaScreen onBack={() => setActiveSubScreen(null)} />;
    if (activeSubScreen === 'tasks') return <TasksScreen onBack={() => setActiveSubScreen(null)} />;

    switch (activeTab) {
      case 'attend': return <AttendanceScreen />;
      case 'timetable': return <TimetableScreen />;
      case 'expenses': return <ExpensesScreen />;
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
            onNavigateTab={(tab) => { setActiveSubScreen(null); setActiveTab(tab); }}
            onOpenMoreSection={(sec) => setActiveSubScreen(sec)}
            onOpenProfile={() => setActiveSubScreen('profile')}
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: currentTheme.bgBase }]} edges={['top', 'left', 'right']}>
      <StatusBar style={currentTheme.isDark ? 'light' : 'dark'} />
      {!activeSubScreen && <GlassHeader onPressProfile={() => setActiveSubScreen('profile')} />}
      <View style={[styles.body, { backgroundColor: currentTheme.bgBase }]}>{renderContent()}</View>
      {!activeSubScreen && <GlassNavBar />}
    </SafeAreaView>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// App Root
// ──────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeBootstrap>
        <CampusProvider>
          <MainAppContent />
        </CampusProvider>
      </ThemeBootstrap>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1 },
  fill: { flex: 1 },
  body: { flex: 1, position: 'relative' },
});
