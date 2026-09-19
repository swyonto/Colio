import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { Holiday } from '../types/campus';

export const HolidaysScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { holidays, addHoliday, deleteHoliday } = useCampus();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('2026-10-02');
  const [type, setType] = useState<Holiday['type']>('HOLIDAY');

  const handleSave = () => {
    if (!name.trim() || !date.trim()) return;
    addHoliday(name.trim(), date.trim(), type);
    setName('');
    setDate('2026-10-02');
    setIsAddOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleLg, styles.headerTitle]}>Holidays & Leaves</Text>
          <Text style={styles.headerSubtitle}>Semester Academic Calendar</Text>
        </View>
        <TouchableOpacity onPress={() => setIsAddOpen(true)} style={styles.addBtn}>
          <Feather name="plus" size={18} color={Colors.emeraldPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 12.2: Smart Holiday Rule Card */}
        <EmeraldGlassCard>
          <View style={styles.ruleCardContent}>
            <View style={styles.ruleIconBox}>
              <MaterialIcons name="event-available" size={26} color={Colors.emeraldPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.titleSm, styles.ruleTitle]}>
                Smart Attendance Protection
              </Text>
              <Text style={[Typography.bodySm, styles.ruleDesc]}>
                Classes scheduled on listed holidays and approved Duty Leaves are automatically excluded from missed class calculations.
              </Text>
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Holidays List */}
        <View style={styles.holidaysSection}>
          <Text style={[Typography.overline, { color: Colors.textMuted }]}>
            SCHEDULED HOLIDAYS ({holidays.length})
          </Text>

          {holidays.map((hol) => {
            const isDutyLeave = hol.type === 'DUTY_LEAVE';

            return (
              <View key={hol.id} style={styles.holidayItem}>
                <View
                  style={[
                    styles.dateBadge,
                    {
                      backgroundColor: isDutyLeave ? 'rgba(0, 176, 255, 0.15)' : Colors.statusHolidayBg,
                      borderColor: isDutyLeave ? 'rgba(0, 176, 255, 0.35)' : 'rgba(255, 193, 7, 0.35)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dateBadgeDay,
                      { color: isDutyLeave ? '#00B0FF' : Colors.statusHoliday },
                    ]}
                  >
                    {hol.date.split('-')[2]}
                  </Text>
                  <Text style={styles.dateBadgeMonth}>
                    {new Date(hol.date).toLocaleString('default', { month: 'short' })}
                  </Text>
                </View>

                <View style={styles.holidayDetails}>
                  <Text style={[Typography.titleSm, styles.holidayName]} numberOfLines={1}>
                    {hol.name}
                  </Text>
                  <Text style={styles.holidayDateString}>
                    {hol.date} • {isDutyLeave ? 'Academic Duty Leave' : 'College Gazetted Holiday'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteHoliday(hol.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={14} color={Colors.textDisabled} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Holiday Dialog */}
      <GlassDialog visible={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Holiday or Leave">
        <GlassInput
          label="Occasion / Event Title *"
          placeholder="e.g. Diwali Vacation"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <GlassInput
          label="Date (YYYY-MM-DD) *"
          placeholder="2026-10-02"
          value={date}
          onChangeText={setDate}
        />

        <Text style={[Typography.labelSm, styles.dialogLabel]}>TYPE</Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.typeChip, type === 'HOLIDAY' && styles.typeChipActive]}
            onPress={() => setType('HOLIDAY')}
          >
            <Text style={[styles.typeChipText, type === 'HOLIDAY' && styles.typeChipTextActive]}>
              Gazetted Holiday
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeChip, type === 'DUTY_LEAVE' && styles.typeChipActive]}
            onPress={() => setType('DUTY_LEAVE')}
          >
            <Text style={[styles.typeChipText, type === 'DUTY_LEAVE' && styles.typeChipTextActive]}>
              Duty Leave
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 18 }}>
          <EmeraldButton label="Save to Calendar" onPress={handleSave} />
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
  addBtn: {
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
  ruleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ruleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 0.8,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleTitle: {
    color: Colors.textPrimary,
  },
  ruleDesc: {
    color: Colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  holidaysSection: {
    gap: 10,
  },
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1210',
    borderRadius: 14,
    padding: 12,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  dateBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadgeDay: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateBadgeMonth: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  holidayDetails: {
    flex: 1,
    gap: 3,
  },
  holidayName: {
    color: Colors.textPrimary,
  },
  holidayDateString: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  dialogLabel: {
    color: Colors.textMuted,
    marginTop: 10,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    fontSize: 12,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
