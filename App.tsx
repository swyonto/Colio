import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CampusProvider, useCampus } from './src/context/CampusContext';
import { GlassHeader } from './src/components/common/GlassHeader';
import { GlassNavBar } from './src/components/common/GlassNavBar';
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
import { ProfileDialog } from './src/screens/ProfileDialog';
import { Colors } from './src/theme/colors';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useCampus();
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderContent = () => {
    // Sub-screens overlay (Back button returns to previous view)
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
            onOpenProfile={() => setIsProfileOpen(true)}
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
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar style="light" />

      {/* Header Bar (Shown when not in sub-screens with their own header) */}
      {!activeSubScreen && (
        <GlassHeader onPressProfile={() => setIsProfileOpen(true)} />
      )}

      {/* Screen Body */}
      <View style={styles.bodyContainer}>{renderContent()}</View>

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
