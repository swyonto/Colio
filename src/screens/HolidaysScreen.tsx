import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../components/common/EmeraldGlassCard';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { Holiday } from '../types/campus';

export const HolidaysScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { holidays, addHoliday, deleteHoliday, currentTheme } = useCampus();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<Holiday['type']>('HOLIDAY');

  const handleSave = () => {
    if (!name.trim() || !date.trim()) return;
    addHoliday(name.trim(), date.trim(), type);
    setName('');
    setDate('');
    setIsAddOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Header */}
      <View style={[styles.headerBar, { backgroundColor: currentTheme.bgCardSecondary, borderBottomColor: currentTheme.borderGlass }]}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: currentTheme.bgCard }]}>
            <Feather name="arrow-left" size={18} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleMd, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
            Academic Calendar & Leaves
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.textMuted }]}>
            Official Breaks & Duty Leaves
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsAddOpen(true)}
          style={[styles.addBtn, { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary }]}
        >
          <Feather name="plus" size={16} color={currentTheme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Smart Holiday Rule Card */}
        <EmeraldGlassCard>
          <View style={styles.ruleCardContent}>
            <View style={[styles.ruleIconBox, { backgroundColor: currentTheme.primary + '18', borderColor: currentTheme.primary + '35' }]}>
              <MaterialIcons name="event-available" size={26} color={currentTheme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '700' }]}>
                Smart Attendance Protection
              </Text>
              <Text style={[Typography.bodySm, { color: currentTheme.textMuted, fontSize: 12, marginTop: 2 }]}>
                Classes scheduled on listed holidays and approved Duty Leaves are automatically excluded from missed class calculations.
              </Text>
            </View>
          </View>
        </EmeraldGlassCard>

        {/* Holidays List */}
        <View style={styles.holidaysSection}>
          <Text style={[Typography.overline, { color: currentTheme.textMuted }]}>
            ACADEMIC SCHEDULE ({holidays.length})
          </Text>

          {holidays.map((h) => {
            const isDutyLeave = h.type === 'DUTY_LEAVE';
            const badgeColor = isDutyLeave ? '#00B0FF' : '#FFD600';
            const dateParts = h.date.split('-');
            const dayNum = dateParts[2] || '01';
            const monthNames = ['', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const monthText = monthNames[parseInt(dateParts[1] || '1', 10)] || 'SEP';

            return (
              <View
                key={h.id}
                style={[styles.holidayItem, { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass }]}
              >
                {/* Date Badge */}
                <View style={[styles.dateBadge, { borderColor: `${badgeColor}40`, backgroundColor: `${badgeColor}12` }]}>
                  <Text style={[styles.dateBadgeDay, { color: badgeColor }]}>{dayNum}</Text>
                  <Text style={[styles.dateBadgeMonth, { color: badgeColor }]}>{monthText}</Text>
                </View>

                {/* Details */}
                <View style={styles.holidayDetails}>
                  <Text style={[Typography.titleSm, { color: currentTheme.textPrimary, fontWeight: '600' }]}>{h.name}</Text>
                  <Text style={[styles.holidayDateString, { color: currentTheme.textMuted }]}>
                    {h.date} • {isDutyLeave ? 'Official Duty Leave' : 'Public Holiday'}
                  </Text>
                </View>

                {/* Delete */}
                <TouchableOpacity
                  onPress={() => deleteHoliday(h.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={14} color={currentTheme.textDisabled} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Holiday Dialog */}
      <GlassDialog
        visible={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Holiday or Duty Leave"
      >
        <GlassInput
          label="Event / Leave Name *"
          placeholder="e.g. Gandhi Jayanti or Hackathon Leave"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <GlassInput
          label="Date (YYYY-MM-DD) *"
          placeholder="e.g. 2026-10-02"
          value={date}
          onChangeText={setDate}
        />

        {/* Type Choice */}
        <Text style={[Typography.labelSm, { color: currentTheme.textMuted, marginTop: 10, marginBottom: 6 }]}>
          TYPE
        </Text>
        <View style={styles.chipsRow}>
          {(['HOLIDAY', 'DUTY_LEAVE'] as Holiday['type'][]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeChip,
                { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                type === t && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  { color: currentTheme.textMuted },
                  type === t && { color: currentTheme.textPrimary, fontWeight: '700' },
                ]}
              >
                {t === 'HOLIDAY' ? 'Holiday' : 'Duty Leave'}
              </Text>
            </TouchableOpacity>
          ))}
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
  },
  headerBar: {
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
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 0.8,
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
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  holidaysSection: {
    gap: 10,
  },
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 0.7,
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
    textTransform: 'uppercase',
  },
  holidayDetails: {
    flex: 1,
    gap: 3,
  },
  holidayDateString: {
    fontSize: 11,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.6,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
