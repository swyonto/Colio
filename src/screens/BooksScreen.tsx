import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { DocumentItem } from '../types/campus';

export const BooksScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { documents, addDocument, deleteDocument, subjects } = useCampus();
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const [docTitle, setDocTitle] = useState('');
  const [docFilename, setDocFilename] = useState('');
  const [docType, setDocType] = useState<DocumentItem['docType']>('BOOK');
  const [docSubject, setDocSubject] = useState('PYTH');

  const handleSaveDocument = () => {
    if (!docTitle.trim()) return;
    const finalFilename = docFilename.trim() || `${docTitle.trim().replace(/\s+/g, '_')}.pdf`;
    addDocument({
      title: docTitle.trim(),
      filename: finalFilename,
      docType,
      subjectCode: docSubject,
      size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
    });
    setDocTitle('');
    setDocFilename('');
    setIsAddDocOpen(false);
  };

  const getDocTypeColor = (type: DocumentItem['docType']) => {
    switch (type) {
      case 'BOOK':
        return Colors.emeraldHighlight;
      case 'NOTES':
        return '#00B0FF';
      case 'SYLLABUS':
        return '#FFD600';
      case 'OTHER':
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleLg, styles.headerTitle]}>Books & PDFs</Text>
          <Text style={styles.headerSubtitle}>Offline Academic Library</Text>
        </View>
        <TouchableOpacity onPress={() => setIsAddDocOpen(true)} style={styles.addDocCircle}>
          <Feather name="plus" size={18} color={Colors.emeraldPrimary} />
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
            <View style={styles.bannerIconBox}>
              <MaterialIcons name="picture-as-pdf" size={28} color={Colors.emeraldHighlight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.titleMd, styles.bannerTitle]}>
                Instant PDF Reader
              </Text>
              <Text style={styles.bannerSubtitle}>
                Study notes, textbooks, and syllabus sheets cached for instant offline reading.
              </Text>
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Documents List */}
        <View style={styles.listSection}>
          <Text style={[Typography.overline, { color: Colors.textMuted }]}>
            AVAILABLE DOCUMENTS ({documents.length})
          </Text>

          {documents.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No documents added yet. Tap '+' to add your first PDF.</Text>
            </View>
          ) : (
            documents.map((doc) => {
              const typeColor = getDocTypeColor(doc.docType);

              return (
                <View key={doc.id} style={styles.docCard}>
                  {/* Left: Glowing PDF Icon Container */}
                  <View style={[styles.pdfIconContainer, { borderColor: `${typeColor}40` }]}>
                    <MaterialIcons name="picture-as-pdf" size={24} color={typeColor} />
                  </View>

                  {/* Middle: Document Details */}
                  <View style={styles.docDetails}>
                    <Text style={[Typography.titleSm, styles.docTitle]} numberOfLines={2}>
                      {doc.title}
                    </Text>

                    <View style={styles.docMetaRow}>
                      <View style={[styles.docTypeBadge, { backgroundColor: `${typeColor}15`, borderColor: `${typeColor}40` }]}>
                        <Text style={[styles.docTypeText, { color: typeColor }]}>{doc.docType}</Text>
                      </View>

                      {doc.subjectCode && (
                        <View style={styles.subjectCodeBadge}>
                          <Text style={styles.subjectCodeText}>{doc.subjectCode}</Text>
                        </View>
                      )}

                      <Text style={styles.docSizeText}>{doc.size}</Text>
                    </View>
                  </View>

                  {/* Right Actions: Open & Delete */}
                  <View style={styles.docActions}>
                    <TouchableOpacity
                      style={styles.openBtn}
                      onPress={() => setPreviewDoc(doc)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="arrow-up-right" size={18} color={Colors.emeraldPrimary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deleteDocument(doc.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="trash-2" size={14} color={Colors.textDisabled} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Simplified Add Document Dialog (Section 10.3) */}
      <GlassDialog
        visible={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Add PDF Document"
      >
        <GlassInput
          label="Document Title *"
          placeholder="e.g. Operating Systems Notes Unit 1"
          value={docTitle}
          onChangeText={setDocTitle}
          autoFocus
        />

        <GlassInput
          label="Filename (Optional)"
          placeholder="e.g. OS_Unit1_Notes.pdf"
          value={docFilename}
          onChangeText={setDocFilename}
        />

        {/* Document Type Chips */}
        <Text style={[Typography.labelSm, styles.dialogLabel]}>TYPE</Text>
        <View style={styles.chipsRow}>
          {(['BOOK', 'NOTES', 'SYLLABUS', 'OTHER'] as DocumentItem['docType'][]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, docType === t && styles.typeChipActive]}
              onPress={() => setDocType(t)}
            >
              <Text style={[styles.typeChipText, docType === t && styles.typeChipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject Code Chips */}
        <Text style={[Typography.labelSm, styles.dialogLabel]}>ASSOCIATED SUBJECT</Text>
        <View style={styles.chipsRow}>
          {subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.typeChip, docSubject === s.code && styles.typeChipActive]}
              onPress={() => setDocSubject(s.code)}
            >
              <Text style={[styles.typeChipText, docSubject === s.code && styles.typeChipTextActive]}>
                {s.code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 18 }}>
          <EmeraldButton label="Save to Library" onPress={handleSaveDocument} />
        </View>
      </GlassDialog>

      {/* Native PDF Preview Dialog (Section 10.4) */}
      <GlassDialog
        visible={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.title || 'Document Preview'}
      >
        <View style={styles.previewBox}>
          <MaterialIcons name="picture-as-pdf" size={48} color={Colors.emeraldPrimary} />
          <Text style={[Typography.titleMd, styles.previewTitle]}>{previewDoc?.filename}</Text>
          <Text style={styles.previewMeta}>
            Size: {previewDoc?.size} • Subject: {previewDoc?.subjectCode || 'General'}
          </Text>
          <View style={styles.previewBadge}>
            <Feather name="check" size={12} color={Colors.emeraldPrimary} />
            <Text style={styles.previewBadgeText}>Ready for Offline Viewing</Text>
          </View>
        </View>

        <View style={{ marginTop: 16, gap: 10 }}>
          <EmeraldButton
            label="Open in Native PDF Viewer"
            onPress={() => {
              Alert.alert('Opening PDF', `Launching native viewer for ${previewDoc?.filename}`);
              setPreviewDoc(null);
            }}
          />
        </View>
      </GlassDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 12,
    backgroundColor: '#0A0E0C',
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#131714',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  addDocCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121614',
    borderWidth: 0.8,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 0.8,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: Colors.textPrimary,
  },
  bannerSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  listSection: {
    gap: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1210',
    borderRadius: 14,
    padding: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  pdfIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#141815',
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docDetails: {
    flex: 1,
    gap: 4,
  },
  docTitle: {
    color: Colors.textPrimary,
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
    backgroundColor: '#161A17',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subjectCodeText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
  },
  docSizeText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  docActions: {
    alignItems: 'center',
    gap: 12,
  },
  openBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  dialogLabel: {
    color: Colors.textMuted,
    marginTop: 10,
    marginBottom: 6,
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
    backgroundColor: '#131714',
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typeChipActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderColor: Colors.emeraldPrimary,
  },
  typeChipText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  previewBox: {
    alignItems: 'center',
    backgroundColor: '#101412',
    borderRadius: 14,
    padding: 20,
    borderWidth: 0.7,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    gap: 8,
  },
  previewTitle: {
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  previewMeta: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  previewBadgeText: {
    color: Colors.emeraldPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});
