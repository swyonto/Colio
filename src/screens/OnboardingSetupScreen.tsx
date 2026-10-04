import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton, GlassButton } from '../components/common/Buttons';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { TimetableSlot, Subject } from '../types/campus';
import { initialTimetable } from '../data/initialData';
import { parseTimetableCsv, SAMPLE_TIMETABLE_CSV } from '../utils/csvTimetableParser';

interface OnboardingSetupScreenProps {
  onBackToWelcome: () => void;
  onFinishSetup: () => void;
}

const DAY_NAMES = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const OnboardingSetupScreen: React.FC<OnboardingSetupScreenProps> = ({
  onBackToWelcome,
  onFinishSetup,
}) => {
  const { currentTheme, updateProfile, setTimetableSlots, setIsSetupComplete, subjects, addSubjects, currentUser } = useCampus();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Student Details — prefilled from Google name if Google sign-in, otherwise collected fresh here
  const isGoogleUser = currentUser?.provider === 'google';
  const [name, setName] = useState(
    isGoogleUser && currentUser?.name && !currentUser.name.toLowerCase().includes('demo')
      ? currentUser.name
      : ''
  );
  const [college, setCollege] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('1');

  // Step 2: Timetable Setup Mode
  const [timetableMode, setTimetableMode] = useState<'template' | 'csv'>('csv');
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const [csvStatus, setCsvStatus] = useState('');
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [pendingSubjects, setPendingSubjects] = useState<Subject[]>([]);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedCsvText, setPastedCsvText] = useState('');
  const [parsedSlots, setParsedSlots] = useState<TimetableSlot[]>(initialTimetable);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(`${title}: ${message}`);
      }
    } else {
      Alert.alert(title, message);
    }
  };

  // Handle picking Excel / CSV file
  const handlePickTimetableCsv = async () => {
    try {
      setIsParsingCsv(true);
      setCsvStatus('Selecting spreadsheet file...');
      setCsvErrors([]);

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/comma-separated-values',
          'text/plain',
          'application/vnd.ms-excel',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setCsvFileName(file.name || 'timetable.csv');
        setCsvStatus('Reading spreadsheet contents...');

        const res = await fetch(file.uri);
        const text = await res.text();

        if (!text || text.trim().length === 0) {
          showAlert('Empty File', 'The selected file is empty.');
          setIsParsingCsv(false);
          setCsvStatus('');
          return;
        }

        const parseResult = parseTimetableCsv(text, subjects);

        if (parseResult.slots.length === 0) {
          showAlert(
            'No Classes Found',
            'Could not detect class rows in this CSV file. Please check the Excel/CSV column structure.'
          );
          if (parseResult.errors.length > 0) {
            setCsvErrors(parseResult.errors);
          }
          setIsParsingCsv(false);
          setCsvStatus('');
          return;
        }

        setParsedSlots(parseResult.slots);
        setPendingSubjects(parseResult.newSubjects);
        setCsvStatus(
          `Successfully loaded ${parseResult.slots.length} class slots${
            parseResult.newSubjects.length > 0 ? ` (${parseResult.newSubjects.length} new subjects)` : ''
          }!`
        );
        if (parseResult.errors.length > 0) {
          setCsvErrors(parseResult.errors);
        }
      }
      setIsParsingCsv(false);
    } catch (err) {
      console.warn('CSV Picker error:', err);
      setIsParsingCsv(false);
      setCsvStatus('');
      showAlert('Import Failed', 'Unable to read CSV file. You can also paste the CSV text directly using "Paste CSV".');
    }
  };

  const handleApplyCsvText = (rawText: string) => {
    if (!rawText.trim()) {
      showAlert('Empty CSV', 'Please enter or paste your CSV content.');
      return;
    }
    const parseResult = parseTimetableCsv(rawText, subjects);
    if (parseResult.slots.length === 0) {
      showAlert(
        'Format Error',
        'Could not parse timetable slots from the text. Check that the columns match: Day, Period, StartTime, EndTime, Subject.'
      );
      if (parseResult.errors.length > 0) {
        setCsvErrors(parseResult.errors);
      }
      return;
    }

    setParsedSlots(parseResult.slots);
    setPendingSubjects(parseResult.newSubjects);
    setCsvFileName('Pasted CSV Data');
    setCsvStatus(`Imported ${parseResult.slots.length} class slots!`);
    if (parseResult.errors.length > 0) {
      setCsvErrors(parseResult.errors);
    }
    setShowPasteModal(false);
  };

  const handleLoadSample = () => {
    handleApplyCsvText(SAMPLE_TIMETABLE_CSV);
    setCsvFileName('Standard Sample (11 Classes)');
    showAlert('Sample Loaded', 'Loaded 11 class slots from sample timetable template!');
    setShowStructureModal(false);
  };

  const handleStep1Next = () => {
    if (!name.trim()) {
      showAlert('Required', 'Please enter your full name.');
      return;
    }
    if (!college.trim()) {
      showAlert('Required', 'Please enter your college or university name.');
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    const studentName = name.trim();
    const collegeName = college.trim();
    const studentRoll = rollNumber.trim() || 'STU-001';
    const studentCourse = course.trim() || 'General Academic Studies';
    const studentSemester = semester ? `Semester ${semester}` : 'Semester 1';

    // Save student profile
    updateProfile({
      name: studentName,
      college: collegeName,
      rollNumber: studentRoll,
      course: studentCourse,
      semester: studentSemester,
      appNickname: studentName.split(' ')[0] || 'Colio',
      isSetupComplete: true,
    });

    // Save timetable slots
    setTimetableSlots(parsedSlots);

    // Save newly discovered subjects from CSV
    if (pendingSubjects.length > 0) {
      addSubjects(pendingSubjects);
    }

    // Complete setup
    setIsSetupComplete(true);
    onFinishSetup();
  };

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, { borderBottomColor: currentTheme.borderGlass, backgroundColor: currentTheme.bgCardSecondary }]}>
        <TouchableOpacity
          onPress={() => {
            if (step === 2) {
              setStep(1);
            } else {
              onBackToWelcome();
            }
          }}
          style={[styles.backBtn, { backgroundColor: currentTheme.bgCard }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={18} color={currentTheme.textPrimary} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
            {step === 1 ? 'Step 1 of 2: Student Details' : 'Step 2 of 2: Timetable Setup'}
          </Text>
          <Text style={[styles.stepSub, { color: currentTheme.textMuted }]}>
            {step === 1 ? 'Personalize your academic identity' : 'Import or configure your weekly classes'}
          </Text>
        </View>
      </View>

      {/* Step Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: currentTheme.bgCardSecondary }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: currentTheme.primary,
              width: step === 1 ? '50%' : '100%',
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          /* STEP 1: STUDENT DETAILS */
          <View style={styles.stepContainer}>
            <EmeraldGlassCard>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: currentTheme.primary + '18' }]}>
                  <Feather name="user-check" size={20} color={currentTheme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                    Student Information
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: currentTheme.textMuted }]}>
                    This data generates your digital Campus ID and profile dashboard.
                  </Text>
                </View>
              </View>
            </EmeraldGlassCard>

            <View style={styles.formGroup}>
              <GlassInput
                label="Full Name *"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
              />

              <GlassInput
                label="College / University Name *"
                placeholder="e.g. National Institute of Technology"
                value={college}
                onChangeText={setCollege}
              />

              <GlassInput
                label="Roll Number / Student ID"
                placeholder="e.g. 2026CS-042"
                value={rollNumber}
                onChangeText={setRollNumber}
              />

              <GlassInput
                label="Degree / Major"
                placeholder="e.g. B.Tech Computer Science / B.Sc Physics"
                value={course}
                onChangeText={setCourse}
              />

              {/* Semester Selector */}
              <View style={{ gap: 6, marginTop: 4 }}>
                <Text style={[Typography.labelSm, { color: currentTheme.textMuted }]}>CURRENT SEMESTER</Text>
                <View style={styles.semestersRow}>
                  {semesters.map((sem) => (
                    <TouchableOpacity
                      key={sem}
                      style={[
                        styles.semPill,
                        { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                        semester === sem && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
                      ]}
                      onPress={() => setSemester(sem)}
                    >
                      <Text
                        style={[
                          styles.semPillText,
                          { color: currentTheme.textMuted },
                          semester === sem && { color: currentTheme.textPrimary, fontWeight: '700' },
                        ]}
                      >
                        Sem {sem}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <EmeraldButton label="Continue to Timetable Setup" onPress={handleStep1Next} />
            </View>
          </View>
        ) : (
          /* STEP 2: TIMETABLE SETUP */
          <View style={styles.stepContainer}>
            <EmeraldGlassCard>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardIconBox, { backgroundColor: currentTheme.primary + '18' }]}>
                  <Feather name="calendar" size={20} color={currentTheme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                    Timetable Configuration
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: currentTheme.textMuted }]}>
                    Choose how to set up your weekly class schedule.
                  </Text>
                </View>
              </View>
            </EmeraldGlassCard>

            {/* Mode Selection Cards */}
            <View style={styles.modeCardsWrap}>
              {/* Option 1: Excel / CSV Import */}
              <TouchableOpacity
                style={[
                  styles.modeOptionCard,
                  { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                  timetableMode === 'csv' && { borderColor: currentTheme.primary, backgroundColor: currentTheme.primary + '10' },
                ]}
                onPress={() => setTimetableMode('csv')}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.modeIconCircle, { backgroundColor: currentTheme.primary + '20' }]}>
                    <Feather name="file-text" size={20} color={currentTheme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                        Import from Excel / CSV
                      </Text>
                      <View style={[styles.aiBadge, { backgroundColor: currentTheme.primary + '25' }]}>
                        <Text style={[styles.aiBadgeText, { color: currentTheme.primary }]}>Spreadsheet</Text>
                      </View>
                    </View>
                    <Text style={[styles.modeDesc, { color: currentTheme.textMuted }]}>
                      Pick an Excel / CSV timetable file or paste rows. Classes & subjects are loaded instantly.
                    </Text>
                  </View>
                  <Feather
                    name={timetableMode === 'csv' ? 'check-circle' : 'circle'}
                    size={20}
                    color={timetableMode === 'csv' ? currentTheme.primary : currentTheme.textDisabled}
                  />
                </View>
              </TouchableOpacity>

              {/* Option 2: Pre-configured Standard Schedule */}
              <TouchableOpacity
                style={[
                  styles.modeOptionCard,
                  { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                  timetableMode === 'template' && { borderColor: currentTheme.primary, backgroundColor: currentTheme.primary + '10' },
                ]}
                onPress={() => {
                  setTimetableMode('template');
                  setParsedSlots(initialTimetable);
                  setPendingSubjects([]);
                  setCsvFileName(null);
                  setCsvStatus('');
                }}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.modeIconCircle, { backgroundColor: currentTheme.primary + '20' }]}>
                    <Feather name="layers" size={20} color={currentTheme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                      Standard Academic Schedule
                    </Text>
                    <Text style={[styles.modeDesc, { color: currentTheme.textMuted }]}>
                      Pre-populated full weekly schedule with 13 lecture slots. You can edit any class anytime.
                    </Text>
                  </View>
                  <Feather
                    name={timetableMode === 'template' ? 'check-circle' : 'circle'}
                    size={20}
                    color={timetableMode === 'template' ? currentTheme.primary : currentTheme.textDisabled}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* If CSV Mode Selected */}
            {timetableMode === 'csv' && (
              <View style={[styles.screenshotActionBox, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
                {/* Pick File Button */}
                <TouchableOpacity
                  style={[styles.uploadScreenshotBtn, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.primary + '40' }]}
                  onPress={handlePickTimetableCsv}
                  activeOpacity={0.8}
                >
                  <Feather name="upload-cloud" size={22} color={currentTheme.primary} />
                  <Text style={[styles.uploadScreenshotBtnText, { color: currentTheme.primary }]}>
                    {csvFileName ? 'Change Excel / CSV File' : 'Pick Excel / CSV Timetable File'}
                  </Text>
                </TouchableOpacity>

                {/* Status or Active File Info */}
                {csvFileName && (
                  <View style={[styles.csvFileRow, { backgroundColor: currentTheme.primary + '12', borderColor: currentTheme.primary + '30' }]}>
                    <View style={[styles.csvIconWrap, { backgroundColor: currentTheme.primary + '25' }]}>
                      <Feather name="check" size={18} color={currentTheme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.csvFileTitle, { color: currentTheme.textPrimary }]} numberOfLines={1}>
                        {csvFileName}
                      </Text>
                      <Text style={[styles.csvFileSubtitle, { color: currentTheme.primary }]}>
                        {csvStatus || `${parsedSlots.length} classes parsed`}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Parsing indicator */}
                {isParsingCsv && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                    <ActivityIndicator size="small" color={currentTheme.primary} />
                    <Text style={{ fontSize: 12, color: currentTheme.textMuted }}>{csvStatus}</Text>
                  </View>
                )}

                {/* Error Warnings if any */}
                {csvErrors.length > 0 && (
                  <View style={[styles.errorBox, { backgroundColor: '#FF525215', borderColor: '#FF525240' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Feather name="alert-triangle" size={14} color="#FF5252" />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF5252' }}>
                        Row Warnings ({csvErrors.length})
                      </Text>
                    </View>
                    {csvErrors.slice(0, 3).map((err, idx) => (
                      <Text key={idx} style={{ fontSize: 10, color: currentTheme.textMuted }}>
                        • {err}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Helper Action Buttons: Format Guide & Paste CSV */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[styles.csvHelperBtn, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
                    onPress={() => setShowStructureModal(true)}
                    activeOpacity={0.8}
                  >
                    <Feather name="info" size={14} color={currentTheme.primary} />
                    <Text style={[styles.csvHelperBtnText, { color: currentTheme.textPrimary }]}>
                      Excel Format Guide
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.csvHelperBtn, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}
                    onPress={() => setShowPasteModal(true)}
                    activeOpacity={0.8}
                  >
                    <Feather name="edit-3" size={14} color={currentTheme.primary} />
                    <Text style={[styles.csvHelperBtnText, { color: currentTheme.textPrimary }]}>
                      Paste CSV Text
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Slots Preview */}
            <View style={styles.slotsPreviewBlock}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
                  PREVIEW PARSED CLASSES ({parsedSlots.length} SLOTS)
                </Text>
                <Text style={[styles.previewMetaSub, { color: currentTheme.textMuted }]}>
                  Mon – Sat
                </Text>
              </View>

              <View style={styles.slotsMiniList}>
                {parsedSlots.slice(0, 4).map((slot) => {
                  const allSubjects = [...subjects, ...pendingSubjects];
                  const subject = allSubjects.find((s) => s.id === slot.subjectId);
                  const subjectName = subject?.name || slot.subjectId;
                  const dayName = DAY_NAMES[slot.dayOfWeek] || 'Mon';

                  return (
                    <View
                      key={slot.id}
                      style={[styles.slotMiniItem, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
                    >
                      <View style={[styles.slotMiniDayBadge, { backgroundColor: currentTheme.primary + '18' }]}>
                        <Text style={[styles.slotMiniDayText, { color: currentTheme.primary }]}>
                          {dayName}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slotMiniSubject, { color: currentTheme.textPrimary }]} numberOfLines={1}>
                          {subjectName}
                        </Text>
                        <Text style={[styles.slotMiniTime, { color: currentTheme.textMuted }]}>
                          {slot.startTime} - {slot.endTime} • {slot.room}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {parsedSlots.length > 4 && (
                  <Text style={[styles.moreSlotsNotice, { color: currentTheme.textMuted }]}>
                    + {parsedSlots.length - 4} additional lecture slots configured
                  </Text>
                )}
              </View>
            </View>

            {/* Submit Action */}
            <View style={{ marginTop: 12, gap: 10 }}>
              <EmeraldButton label="Complete Setup & Launch Colio" onPress={handleFinish} />
              <GlassButton label="Back to Details" onPress={() => setStep(1)} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal 1: Structure & Rules Guide */}
      <Modal
        visible={showStructureModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStructureModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={[styles.modalIconCircle, { backgroundColor: currentTheme.primary + '20' }]}>
                  <Feather name="file-text" size={18} color={currentTheme.primary} />
                </View>
                <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                  Excel & CSV Format Guide
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowStructureModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color={currentTheme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.guideIntro, { color: currentTheme.textMuted }]}>
                To import your weekly schedule from Microsoft Excel or Google Sheets, your file should include the following header row and columns:
              </Text>

              {/* Column Rules Table */}
              <View style={[styles.guideTable, { borderColor: currentTheme.borderGlass }]}>
                <View style={[styles.guideTableRow, { backgroundColor: currentTheme.bgCardSecondary }]}>
                  <Text style={[styles.guideColHeader, { color: currentTheme.primary, flex: 1.2 }]}>Column</Text>
                  <Text style={[styles.guideColHeader, { color: currentTheme.primary, flex: 1.2 }]}>Format</Text>
                  <Text style={[styles.guideColHeader, { color: currentTheme.primary, flex: 2 }]}>Example</Text>
                </View>

                {[
                  { col: 'Day', req: 'Mon-Sat or 1-6', ex: 'Monday or Mon' },
                  { col: 'Period', req: 'Number (1-9)', ex: '1, 2, 3' },
                  { col: 'StartTime', req: 'HH:MM / 12h', ex: '08:30 or 8:30 AM' },
                  { col: 'EndTime', req: 'HH:MM / 12h', ex: '09:30 or 9:30 AM' },
                  { col: 'Subject', req: 'Full Name', ex: 'Python Programming' },
                  { col: 'Code', req: 'Optional', ex: 'PYTH, CS101' },
                  { col: 'Room', req: 'Optional', ex: 'Lab 3, Room 201' },
                  { col: 'Teacher', req: 'Optional', ex: 'Dr. Sharma' },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.guideTableRow, { borderTopColor: currentTheme.borderGlass, borderTopWidth: 0.6 }]}>
                    <Text style={[styles.guideCellBold, { color: currentTheme.textPrimary, flex: 1.2 }]}>{item.col}</Text>
                    <Text style={[styles.guideCell, { color: currentTheme.textMuted, flex: 1.2 }]}>{item.req}</Text>
                    <Text style={[styles.guideCell, { color: currentTheme.textPrimary, flex: 2 }]}>{item.ex}</Text>
                  </View>
                ))}
              </View>

              {/* How to export */}
              <Text style={[styles.guideSectionTitle, { color: currentTheme.textPrimary }]}>
                How to Export from Excel / Google Sheets
              </Text>
              <View style={[styles.exportStepBox, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass }]}>
                <Text style={[styles.exportStepText, { color: currentTheme.textMuted }]}>
                  1. In <Text style={{ color: currentTheme.textPrimary, fontWeight: '700' }}>Microsoft Excel</Text>: Click <Text style={{ color: currentTheme.primary }}>File → Save As → CSV (Comma delimited) (*.csv)</Text>.
                </Text>
                <Text style={[styles.exportStepText, { color: currentTheme.textMuted }]}>
                  2. In <Text style={{ color: currentTheme.textPrimary, fontWeight: '700' }}>Google Sheets</Text>: Click <Text style={{ color: currentTheme.primary }}>File → Download → Comma Separated Values (.csv)</Text>.
                </Text>
                <Text style={[styles.exportStepText, { color: currentTheme.textMuted }]}>
                  3. In Colio: Tap <Text style={{ color: currentTheme.primary }}>Pick Excel / CSV Timetable File</Text> and choose your file!
                </Text>
              </View>

              {/* Sample Code Block */}
              <Text style={[styles.guideSectionTitle, { color: currentTheme.textPrimary }]}>
                Sample CSV Content
              </Text>
              <View style={[styles.codeBlock, { backgroundColor: '#111614', borderColor: currentTheme.borderGlass }]}>
                <Text style={[styles.codeText, { color: '#A7F3D0' }]}>
                  {SAMPLE_TIMETABLE_CSV}
                </Text>
              </View>

              <View style={{ marginTop: 14, gap: 10 }}>
                <EmeraldButton label="Load Sample Template (1-Tap Test)" onPress={handleLoadSample} />
                <GlassButton label="Close Guide" onPress={() => setShowStructureModal(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Paste CSV Text */}
      <Modal
        visible={showPasteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={[styles.modalIconCircle, { backgroundColor: currentTheme.primary + '20' }]}>
                  <Feather name="edit-3" size={18} color={currentTheme.primary} />
                </View>
                <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                  Paste CSV Timetable
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowPasteModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color={currentTheme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.guideIntro, { color: currentTheme.textMuted }]}>
                Paste comma-separated rows directly from your spreadsheet. First row must contain column headers.
              </Text>

              <TextInput
                style={[
                  styles.pasteInput,
                  {
                    backgroundColor: currentTheme.bgCardSecondary,
                    borderColor: currentTheme.borderGlass,
                    color: currentTheme.textPrimary,
                  },
                ]}
                multiline
                numberOfLines={8}
                placeholder={`Day,Period,StartTime,EndTime,Subject,Code,Room,Teacher\nMonday,1,08:30,09:30,Data Structures,DS,Room 101,Dr. Rao`}
                placeholderTextColor={currentTheme.textDisabled}
                value={pastedCsvText}
                onChangeText={setPastedCsvText}
              />

              <View style={{ marginTop: 14, gap: 10 }}>
                <EmeraldButton
                  label="Parse & Apply Schedule"
                  onPress={() => handleApplyCsvText(pastedCsvText)}
                />
                <TouchableOpacity
                  style={[styles.sampleFillBtn, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.primary + '40' }]}
                  onPress={() => setPastedCsvText(SAMPLE_TIMETABLE_CSV)}
                >
                  <Text style={[styles.sampleFillBtnText, { color: currentTheme.primary }]}>
                    Paste Sample Template Text
                  </Text>
                </TouchableOpacity>
                <GlassButton label="Cancel" onPress={() => setShowPasteModal(false)} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.6,
    gap: 12,
    width: '100%',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepSub: {
    fontSize: 11,
    marginTop: 1,
  },
  progressBarTrack: {
    height: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  scrollArea: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  stepContainer: {
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  formGroup: {
    gap: 12,
  },
  semestersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  semPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.6,
  },
  semPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modeCardsWrap: {
    gap: 10,
  },
  modeOptionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.8,
  },
  modeIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  modeDesc: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  screenshotActionBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.6,
    gap: 12,
  },
  uploadScreenshotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 0.8,
  },
  uploadScreenshotBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  csvFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.8,
  },
  csvIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  csvFileTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  csvFileSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 0.8,
    gap: 4,
  },
  csvHelperBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  csvHelperBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  slotsPreviewBlock: {
    gap: 8,
  },
  previewMetaSub: {
    fontSize: 11,
  },
  slotsMiniList: {
    gap: 6,
  },
  slotMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.6,
    gap: 10,
  },
  slotMiniDayBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotMiniDayText: {
    fontSize: 10,
    fontWeight: '700',
  },
  slotMiniSubject: {
    fontSize: 12,
    fontWeight: '600',
  },
  slotMiniTime: {
    fontSize: 10,
    marginTop: 1,
  },
  moreSlotsNotice: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScroll: {
    marginTop: 12,
  },
  guideIntro: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  guideTable: {
    borderRadius: 8,
    borderWidth: 0.8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  guideTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  guideColHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  guideCellBold: {
    fontSize: 11,
    fontWeight: '700',
  },
  guideCell: {
    fontSize: 11,
  },
  guideSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  exportStepBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.8,
    gap: 6,
    marginBottom: 12,
  },
  exportStepText: {
    fontSize: 11,
    lineHeight: 17,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.8,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    lineHeight: 15,
  },
  pasteInput: {
    borderRadius: 8,
    borderWidth: 0.8,
    padding: 12,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    minHeight: 160,
    textAlignVertical: 'top',
  },
  sampleFillBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleFillBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
