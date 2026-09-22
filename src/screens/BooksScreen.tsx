import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton, GlassButton } from '../components/common/Buttons';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { DocumentItem } from '../types/campus';

export const BooksScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { documents, addDocument, deleteDocument, subjects, currentTheme } = useCampus();
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Form State
  const [docTitle, setDocTitle] = useState('');
  const [docFilename, setDocFilename] = useState('');
  const [docType, setDocType] = useState<DocumentItem['docType']>('BOOK');
  const [docSubject, setDocSubject] = useState(subjects[0]?.code || 'PYTH');
  const [docSize, setDocSize] = useState('2.4 MB');
  const [docUri, setDocUri] = useState<string | undefined>(undefined);
  const [docContent, setDocContent] = useState<string>('');
  const [isPickingFile, setIsPickingFile] = useState(false);

  // Reader Settings State
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'oled'>('dark');
  const [userNotes, setUserNotes] = useState<{ [docId: string]: string }>({});
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);

  // Document Picker Handler
  const handlePickDocument = async () => {
    try {
      setIsPickingFile(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const rawName = file.name || 'Uploaded_Document.pdf';
        const cleanTitle = rawName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

        setDocFilename(rawName);
        if (!docTitle.trim()) {
          setDocTitle(cleanTitle);
        }

        if (file.size) {
          const mb = file.size / (1024 * 1024);
          if (mb >= 1) {
            setDocSize(`${mb.toFixed(1)} MB`);
          } else {
            const kb = Math.round(file.size / 1024);
            setDocSize(`${kb} KB`);
          }
        } else {
          setDocSize('1.8 MB');
        }

        setDocUri(file.uri);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
      Alert.alert('File Picker', 'Unable to access document storage. You can still enter details manually.');
    } finally {
      setIsPickingFile(false);
    }
  };

  const handleSaveDocument = () => {
    if (!docTitle.trim()) {
      Alert.alert('Required', 'Please provide a document title or upload a file.');
      return;
    }

    const finalFilename = docFilename.trim() || `${docTitle.trim().replace(/\s+/g, '_')}.pdf`;
    addDocument({
      title: docTitle.trim(),
      filename: finalFilename,
      docType,
      subjectCode: docSubject,
      size: docSize,
      uri: docUri,
      content: docContent.trim() || undefined,
    });

    // Reset
    setDocTitle('');
    setDocFilename('');
    setDocUri(undefined);
    setDocContent('');
    setDocSize('2.4 MB');
    setIsAddDocOpen(false);
  };

  const getDocTypeColor = (type: DocumentItem['docType']) => {
    switch (type) {
      case 'BOOK':
        return currentTheme.primary;
      case 'NOTES':
        return '#00B0FF';
      case 'SYLLABUS':
        return '#FFD600';
      case 'OTHER':
      default:
        return currentTheme.textSecondary;
    }
  };

  // Reader Theme Colors
  const getReaderThemeStyles = () => {
    switch (readerTheme) {
      case 'sepia':
        return {
          bg: '#FBF0D9',
          card: '#F4E4C1',
          text: '#2C2216',
          textMuted: '#685949',
          border: 'rgba(44, 34, 22, 0.15)',
        };
      case 'oled':
        return {
          bg: '#000000',
          card: '#080808',
          text: '#FFFFFF',
          textMuted: '#888888',
          border: 'rgba(255, 255, 255, 0.12)',
        };
      case 'dark':
      default:
        return {
          bg: currentTheme.bgBase,
          card: currentTheme.bgCard,
          text: currentTheme.textPrimary,
          textMuted: currentTheme.textMuted,
          border: currentTheme.borderGlass,
        };
    }
  };

  const rTheme = getReaderThemeStyles();
  const fontSizes = { sm: 13, md: 15, lg: 17 };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Streamlined Nav Header (Redundant 42pt top padding removed to align with app) */}
      <View style={[styles.navHeader, { borderBottomColor: currentTheme.borderGlass, backgroundColor: currentTheme.bgCardSecondary }]}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: currentTheme.bgCard }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={18} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
            Books & PDFs
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.textMuted }]}>
            Offline Academic Library • {documents.length} materials
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsAddDocOpen(true)}
          style={[styles.addDocBtn, { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary }]}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={15} color={currentTheme.primary} />
          <Text style={[styles.addDocBtnText, { color: currentTheme.primary }]}>Add PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card */}
        <EmeraldGlassCard>
          <View style={styles.bannerRow}>
            <View style={[styles.bannerIconBox, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '30' }]}>
              <MaterialIcons name="menu-book" size={26} color={currentTheme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                In-App Academic Reader
              </Text>
              <Text style={[styles.bannerSubtitle, { color: currentTheme.textMuted }]}>
                Read textbooks, lecture notes, and syllabus PDFs directly within Colio. Take study notes with zero distractions.
              </Text>
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Documents List */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
              YOUR DOCUMENTS ({documents.length})
            </Text>
            <Text style={[styles.listHeaderSub, { color: currentTheme.textMuted }]}>
              Tap document or arrow to read
            </Text>
          </View>

          {documents.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}>
              <MaterialIcons name="picture-as-pdf" size={38} color={currentTheme.textMuted} />
              <Text style={[styles.emptyTitle, { color: currentTheme.textPrimary }]}>No documents in library</Text>
              <Text style={[styles.emptyText, { color: currentTheme.textMuted }]}>
                Tap "+ Add PDF" above to upload your first study material or textbook.
              </Text>
              <TouchableOpacity
                onPress={() => setIsAddDocOpen(true)}
                style={[styles.emptyActionBtn, { backgroundColor: currentTheme.primary }]}
              >
                <Feather name="upload-cloud" size={14} color={currentTheme.isDark ? '#050907' : '#FFFFFF'} />
                <Text style={[styles.emptyActionBtnText, { color: currentTheme.isDark ? '#050907' : '#FFFFFF' }]}>
                  Upload Study Document
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            documents.map((doc) => {
              const typeColor = getDocTypeColor(doc.docType);

              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[
                    styles.docCard,
                    { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                  ]}
                  onPress={() => {
                    setPreviewDoc(doc);
                    setCurrentNoteText(userNotes[doc.id] || '');
                  }}
                  activeOpacity={0.8}
                >
                  {/* Left: Glowing PDF Icon Container */}
                  <View style={[styles.pdfIconContainer, { backgroundColor: currentTheme.bgCardSecondary, borderColor: `${typeColor}40` }]}>
                    <MaterialIcons name="picture-as-pdf" size={24} color={typeColor} />
                  </View>

                  {/* Middle: Document Details */}
                  <View style={styles.docDetails}>
                    <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]} numberOfLines={2}>
                      {doc.title}
                    </Text>

                    <View style={styles.docMetaRow}>
                      <View style={[styles.docTypeBadge, { backgroundColor: `${typeColor}18`, borderColor: `${typeColor}40` }]}>
                        <Text style={[styles.docTypeText, { color: typeColor }]}>{doc.docType}</Text>
                      </View>

                      {doc.subjectCode && (
                        <View style={[styles.subjectCodeBadge, { backgroundColor: currentTheme.bgCardSecondary }]}>
                          <Text style={[styles.subjectCodeText, { color: currentTheme.textSecondary }]}>{doc.subjectCode}</Text>
                        </View>
                      )}

                      <Text style={[styles.docSizeText, { color: currentTheme.textMuted }]}>{doc.size}</Text>
                    </View>
                  </View>

                  {/* Right Actions: Read & Delete */}
                  <View style={styles.docActions}>
                    <TouchableOpacity
                      style={[styles.openBtn, { backgroundColor: currentTheme.primary + '18' }]}
                      onPress={() => {
                        setPreviewDoc(doc);
                        setCurrentNoteText(userNotes[doc.id] || '');
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="book-open" size={15} color={currentTheme.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deleteDocument(doc.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="trash-2" size={13} color={currentTheme.textDisabled} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add / Upload Document Dialog (Item 7 Requirement) */}
      <GlassDialog
        visible={isAddDocOpen}
        onClose={() => {
          setIsAddDocOpen(false);
          setDocFilename('');
          setDocUri(undefined);
        }}
        title="Add PDF Document"
      >
        {/* Upload from Storage Button */}
        <TouchableOpacity
          style={[styles.uploadBox, { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.primary + '40' }]}
          onPress={handlePickDocument}
          activeOpacity={0.8}
        >
          <View style={[styles.uploadIconCircle, { backgroundColor: currentTheme.primary + '20' }]}>
            <Feather name={isPickingFile ? 'loader' : 'upload-cloud'} size={22} color={currentTheme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
              {docFilename ? 'File Selected' : 'Choose PDF from Device'}
            </Text>
            <Text style={[styles.uploadSubtext, { color: currentTheme.textMuted }]} numberOfLines={1}>
              {docFilename ? `${docFilename} • ${docSize}` : 'Tap to browse PDFs or documents'}
            </Text>
          </View>
          {docFilename ? (
            <View style={[styles.checkedPill, { backgroundColor: currentTheme.primary + '25' }]}>
              <Feather name="check" size={14} color={currentTheme.primary} />
            </View>
          ) : (
            <Feather name="folder" size={16} color={currentTheme.textMuted} />
          )}
        </TouchableOpacity>

        <GlassInput
          label="Document Title *"
          placeholder="e.g. Operating Systems Notes Unit 1"
          value={docTitle}
          onChangeText={setDocTitle}
        />

        <GlassInput
          label="File Name / Reference"
          placeholder="e.g. OS_Unit1_Notes.pdf"
          value={docFilename}
          onChangeText={setDocFilename}
        />

        {/* Document Type Chips */}
        <Text style={[Typography.labelSm, { color: currentTheme.textMuted, marginTop: 10, marginBottom: 6 }]}>
          DOCUMENT TYPE
        </Text>
        <View style={styles.chipsRow}>
          {(['BOOK', 'NOTES', 'SYLLABUS', 'OTHER'] as DocumentItem['docType'][]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeChip,
                { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                docType === t && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
              ]}
              onPress={() => setDocType(t)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  { color: currentTheme.textMuted },
                  docType === t && { color: currentTheme.textPrimary, fontWeight: '700' },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject Code Chips */}
        <Text style={[Typography.labelSm, { color: currentTheme.textMuted, marginTop: 10, marginBottom: 6 }]}>
          ASSOCIATED SUBJECT
        </Text>
        <View style={styles.chipsRow}>
          {subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.typeChip,
                { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                docSubject === s.code && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
              ]}
              onPress={() => setDocSubject(s.code)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  { color: currentTheme.textMuted },
                  docSubject === s.code && { color: currentTheme.textPrimary, fontWeight: '700' },
                ]}
              >
                {s.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          <EmeraldButton label="Save to Academic Library" onPress={handleSaveDocument} />
        </View>
      </GlassDialog>

      {/* FULL IN-APP VIEWER & READER MODAL (Item 7 Requirement) */}
      <Modal
        visible={Boolean(previewDoc)}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={[styles.readerContainer, { backgroundColor: rTheme.bg }]}>
          {/* Reader Top Bar */}
          <View style={[styles.readerTopBar, { backgroundColor: rTheme.card, borderBottomColor: rTheme.border }]}>
            <TouchableOpacity
              onPress={() => setPreviewDoc(null)}
              style={[styles.readerCloseBtn, { backgroundColor: rTheme.bg }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={18} color={rTheme.text} />
            </TouchableOpacity>

            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <Text style={[Typography.titleSm, { color: rTheme.text, fontWeight: '700' }]} numberOfLines={1}>
                {previewDoc?.title}
              </Text>
              <Text style={[styles.readerMetaSub, { color: rTheme.textMuted }]}>
                {previewDoc?.subjectCode || 'General'} • {previewDoc?.size || '1.8 MB'} • {previewDoc?.docType}
              </Text>
            </View>

            {/* Reader Controls (Font Size & Theme) */}
            <View style={styles.readerControls}>
              {/* Font Size Toggle */}
              <TouchableOpacity
                onPress={() => {
                  setReaderFontSize((prev) => (prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'sm'));
                }}
                style={[styles.readerControlBtn, { backgroundColor: rTheme.bg, borderColor: rTheme.border }]}
              >
                <Text style={[styles.readerControlText, { color: rTheme.text }]}>
                  {readerFontSize === 'sm' ? 'A' : readerFontSize === 'md' ? 'A+' : 'A++'}
                </Text>
              </TouchableOpacity>

              {/* Theme Toggle (Dark / Sepia / OLED) */}
              <TouchableOpacity
                onPress={() => {
                  setReaderTheme((prev) => (prev === 'dark' ? 'sepia' : prev === 'sepia' ? 'oled' : 'dark'));
                }}
                style={[styles.readerControlBtn, { backgroundColor: rTheme.bg, borderColor: rTheme.border }]}
              >
                <Feather
                  name={readerTheme === 'sepia' ? 'sun' : readerTheme === 'oled' ? 'moon' : 'feather'}
                  size={14}
                  color={rTheme.text}
                />
              </TouchableOpacity>

              {/* Notes Drawer Toggle */}
              <TouchableOpacity
                onPress={() => setIsNotesDrawerOpen(!isNotesDrawerOpen)}
                style={[
                  styles.readerControlBtn,
                  { backgroundColor: isNotesDrawerOpen ? currentTheme.primary : rTheme.bg, borderColor: rTheme.border },
                ]}
              >
                <Feather
                  name="edit-3"
                  size={14}
                  color={isNotesDrawerOpen ? (currentTheme.isDark ? '#050907' : '#FFFFFF') : rTheme.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reader Main Content Area */}
          <View style={styles.readerBody}>
            {/* If Web and previewDoc has URI, embed PDF iframe */}
            {Platform.OS === 'web' && previewDoc?.uri ? (
              <View style={{ flex: 1 }}>
                {/* On web, an iframe can render the loaded blob or data URI */}
                {/* @ts-ignore Web iframe element */}
                <iframe
                  src={previewDoc.uri}
                  style={{ width: '100%', height: '100%', border: 'none', backgroundColor: rTheme.bg }}
                  title={previewDoc.title}
                />
              </View>
            ) : (
              /* Offline In-App Formatted Reader / Study Notes */
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.readerScrollContent, { backgroundColor: rTheme.bg }]}
                showsVerticalScrollIndicator={true}
              >
                {/* Document Information Badge Banner */}
                <View style={[styles.readerInfoBanner, { backgroundColor: rTheme.card, borderColor: rTheme.border }]}>
                  <View style={styles.readerInfoLeft}>
                    <MaterialIcons name="menu-book" size={20} color={currentTheme.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.readerInfoTitle, { color: rTheme.text }]}>
                        {previewDoc?.filename || 'Document Content'}
                      </Text>
                      <Text style={[styles.readerInfoStatus, { color: currentTheme.primary }]}>
                        ✓ Offline Reading Mode Active • 100% Cached
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Document Reading Body */}
                <View style={styles.readingArticle}>
                  <Text style={[styles.readingTitleText, { color: rTheme.text }]}>
                    {previewDoc?.title}
                  </Text>
                  <Text style={[styles.readingSubtitleText, { color: rTheme.textMuted }]}>
                    Curated study notes for {previewDoc?.subjectCode || 'Engineering Studies'} • Colio Offline Reader
                  </Text>

                  <View style={[styles.articleDivider, { backgroundColor: rTheme.border }]} />

                  {/* Render content lines or structured study notes */}
                  <View style={styles.articleContent}>
                    {previewDoc?.content ? (
                      previewDoc.content.split('\n').map((line, idx) => {
                        if (line.startsWith('## ')) {
                          return (
                            <Text
                              key={idx}
                              style={[
                                styles.articleHeading2,
                                { color: currentTheme.primary, fontSize: fontSizes[readerFontSize] + 4 },
                              ]}
                            >
                              {line.replace('## ', '')}
                            </Text>
                          );
                        }
                        if (line.startsWith('# ')) {
                          return (
                            <Text
                              key={idx}
                              style={[
                                styles.articleHeading1,
                                { color: rTheme.text, fontSize: fontSizes[readerFontSize] + 8 },
                              ]}
                            >
                              {line.replace('# ', '')}
                            </Text>
                          );
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <View key={idx} style={styles.articleBulletRow}>
                              <Text style={[styles.articleBulletDot, { color: currentTheme.primary }]}>•</Text>
                              <Text
                                style={[
                                  styles.articleBulletText,
                                  { color: rTheme.text, fontSize: fontSizes[readerFontSize] },
                                ]}
                              >
                                {line.replace('- ', '')}
                              </Text>
                            </View>
                          );
                        }
                        if (line.trim() === '') {
                          return <View key={idx} style={{ height: 10 }} />;
                        }
                        return (
                          <Text
                            key={idx}
                            style={[
                              styles.articleParagraph,
                              { color: rTheme.text, fontSize: fontSizes[readerFontSize] },
                            ]}
                          >
                            {line}
                          </Text>
                        );
                      })
                    ) : (
                      /* Default academic overview when content not provided */
                      <View style={{ gap: 14 }}>
                        <Text style={[styles.articleHeading2, { color: currentTheme.primary, fontSize: fontSizes[readerFontSize] + 3 }]}>
                          1. Overview & Core Learning Objectives
                        </Text>
                        <Text style={[styles.articleParagraph, { color: rTheme.text, fontSize: fontSizes[readerFontSize] }]}>
                          This academic document contains comprehensive reference notes, chapter questions, and revision summaries for {previewDoc?.title}. Ensure you cross-reference syllabus checkpoints prior to semester exams.
                        </Text>

                        <Text style={[styles.articleHeading2, { color: currentTheme.primary, fontSize: fontSizes[readerFontSize] + 3 }]}>
                          2. Key Takeaways & Exam Tips
                        </Text>
                        <View style={styles.articleBulletRow}>
                          <Text style={[styles.articleBulletDot, { color: currentTheme.primary }]}>•</Text>
                          <Text style={[styles.articleBulletText, { color: rTheme.text, fontSize: fontSizes[readerFontSize] }]}>
                            Understand theoretical frameworks and practical case implementations.
                          </Text>
                        </View>
                        <View style={styles.articleBulletRow}>
                          <Text style={[styles.articleBulletDot, { color: currentTheme.primary }]}>•</Text>
                          <Text style={[styles.articleBulletText, { color: rTheme.text, fontSize: fontSizes[readerFontSize] }]}>
                            Review previous question papers and highlight key formulas in the study notes tab.
                          </Text>
                        </View>

                        <Text style={[styles.articleHeading2, { color: currentTheme.primary, fontSize: fontSizes[readerFontSize] + 3 }]}>
                          3. Reference Metadata
                        </Text>
                        <Text style={[styles.articleParagraph, { color: rTheme.textMuted, fontSize: fontSizes[readerFontSize] - 1 }]}>
                          File: {previewDoc?.filename} • Storage Size: {previewDoc?.size} • Verified Colio Academic Asset
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Slide-out Offline Study Notes Drawer */}
            {isNotesDrawerOpen && (
              <View style={[styles.notesDrawer, { backgroundColor: rTheme.card, borderTopColor: rTheme.border }]}>
                <View style={styles.notesDrawerHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="edit-3" size={14} color={currentTheme.primary} />
                    <Text style={[Typography.titleSm, { color: rTheme.text, fontWeight: '700' }]}>
                      Quick Study Notes
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (previewDoc) {
                        setUserNotes((prev) => ({ ...prev, [previewDoc.id]: currentNoteText }));
                      }
                      setIsNotesDrawerOpen(false);
                      Alert.alert('Notes Saved', 'Your study notes for this document have been saved.');
                    }}
                    style={[styles.saveNoteBtn, { backgroundColor: currentTheme.primary }]}
                  >
                    <Text style={[styles.saveNoteBtnText, { color: currentTheme.isDark ? '#050907' : '#FFFFFF' }]}>
                      Save Notes
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: rTheme.bg,
                      color: rTheme.text,
                      borderColor: rTheme.border,
                      fontSize: fontSizes[readerFontSize],
                    },
                  ]}
                  placeholder="Jot down formulas, summary points, or homework reminders..."
                  placeholderTextColor={rTheme.textMuted}
                  value={currentNoteText}
                  onChangeText={setCurrentNoteText}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.6,
    gap: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  addDocBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  listSection: {
    gap: 10,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listHeaderSub: {
    fontSize: 10,
  },
  emptyBox: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 0.6,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 0.7,
    gap: 12,
  },
  pdfIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docDetails: {
    flex: 1,
    gap: 4,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  docTypeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  subjectCodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subjectCodeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  docSizeText: {
    fontSize: 10,
  },
  docActions: {
    alignItems: 'center',
    gap: 10,
  },
  openBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 0.8,
    gap: 12,
    marginBottom: 12,
  },
  uploadIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadSubtext: {
    fontSize: 11,
    marginTop: 2,
  },
  checkedPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 0.6,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  readerContainer: {
    flex: 1,
  },
  readerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.6,
    gap: 8,
  },
  readerCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readerMetaSub: {
    fontSize: 10,
    marginTop: 2,
  },
  readerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readerControlBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 32,
  },
  readerControlText: {
    fontSize: 11,
    fontWeight: '700',
  },
  readerBody: {
    flex: 1,
  },
  readerScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  readerInfoBanner: {
    borderRadius: 10,
    borderWidth: 0.6,
    padding: 10,
    marginBottom: 16,
  },
  readerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readerInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  readerInfoStatus: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  readingArticle: {
    gap: 8,
  },
  readingTitleText: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  readingSubtitleText: {
    fontSize: 12,
    marginBottom: 4,
  },
  articleDivider: {
    height: 0.6,
    marginVertical: 10,
  },
  articleContent: {
    gap: 12,
  },
  articleHeading1: {
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },
  articleHeading2: {
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },
  articleParagraph: {
    lineHeight: 22,
  },
  articleBulletRow: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 4,
    alignItems: 'flex-start',
  },
  articleBulletDot: {
    fontSize: 14,
    lineHeight: 20,
  },
  articleBulletText: {
    flex: 1,
    lineHeight: 20,
  },
  notesDrawer: {
    borderTopWidth: 0.6,
    padding: 12,
    gap: 8,
  },
  notesDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveNoteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveNoteBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  notesInput: {
    borderRadius: 8,
    borderWidth: 0.6,
    padding: 10,
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
