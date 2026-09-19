import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { useCampus } from '../context/CampusContext';
import { Priority, Task } from '../types/campus';

export const TasksScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { tasks, toggleTask, addTask, deleteTask, currentTheme } = useCampus();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('Today');
  const [priority, setPriority] = useState<Priority>('MEDIUM');

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === 'all') return true;
    if (filterPriority === 'completed') return t.completed;
    if (filterPriority === 'pending') return !t.completed;
    return t.priority === filterPriority;
  });

  const handleSave = () => {
    if (!title.trim()) return;
    addTask(title.trim(), desc.trim(), dueDate, priority);
    setTitle('');
    setDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.bgBase }]}>
      {/* Top Header */}
      <View style={styles.headerBar}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[Typography.titleLg, styles.headerTitle]}>All Tasks & Deadlines</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.filter((t) => !t.completed).length} Pending • {tasks.filter((t) => t.completed).length} Completed
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsAddModalOpen(true)} style={styles.addBtn}>
          <Feather name="plus" size={18} color={Colors.emeraldPrimary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'pending', 'completed', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((f) => {
            const isSelected = filterPriority === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setFilterPriority(f)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No tasks found in this view.</Text>
          </View>
        ) : (
          filteredTasks.map((t) => (
            <View key={t.id} style={[styles.taskCard, t.completed && styles.taskCardCompleted]}>
              {/* Checkbox (Does not delete, strikes through & dims to 55%) */}
              <TouchableOpacity
                style={[styles.checkbox, t.completed && styles.checkboxChecked]}
                onPress={() => toggleTask(t.id)}
              >
                {t.completed && <MaterialIcons name="check" size={14} color="#050907" />}
              </TouchableOpacity>

              <View style={styles.taskContent}>
                <Text
                  style={[
                    Typography.titleSm,
                    styles.taskTitle,
                    t.completed && styles.taskTitleCompleted,
                  ]}
                >
                  {t.title}
                </Text>
                {Boolean(t.description) && (
                  <Text style={styles.taskDesc} numberOfLines={2}>
                    {t.description}
                  </Text>
                )}

                <View style={styles.metaRow}>
                  <View style={styles.priorityPill}>
                    <Text style={styles.priorityText}>{t.priority}</Text>
                  </View>
                  <View style={styles.dueRow}>
                    <Feather name="calendar" size={11} color={Colors.textMuted} />
                    <Text style={styles.dueText}>{t.dueDate}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => deleteTask(t.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.trashBtn}
              >
                <Feather name="trash-2" size={15} color={Colors.textDisabled} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* New Task Dialog */}
      <GlassDialog visible={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Task">
        <GlassInput
          label="Title *"
          placeholder="e.g. Complete DSA Laboratory Assignment"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <GlassInput
          label="Details / Notes"
          placeholder="e.g. Upload PDF to Google Classroom"
          value={desc}
          onChangeText={setDesc}
        />

        <Text style={[Typography.labelSm, styles.dialogLabel]}>DUE DATE</Text>
        <View style={styles.chipsWrap}>
          {['Today', 'Tomorrow', 'This Weekend', 'Next Week'].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dialogChip, dueDate === d && styles.dialogChipActive]}
              onPress={() => setDueDate(d)}
            >
              <Text style={[styles.dialogChipText, dueDate === d && styles.dialogChipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[Typography.labelSm, styles.dialogLabel]}>PRIORITY</Text>
        <View style={styles.chipsWrap}>
          {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.dialogChip, priority === p && styles.dialogChipActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.dialogChipText, priority === p && styles.dialogChipTextActive]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 18 }}>
          <EmeraldButton label="Save Task" onPress={handleSave} />
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
  filterRow: {
    backgroundColor: '#0A0E0B',
    paddingVertical: 8,
    borderBottomWidth: 0.6,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#131714',
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderColor: Colors.emeraldPrimary,
  },
  filterChipText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: Colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0F1210',
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  taskCardCompleted: {
    opacity: 0.55,
    backgroundColor: '#0A0C0A',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 230, 118, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.emeraldPrimary,
    borderColor: Colors.emeraldPrimary,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    color: Colors.textPrimary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  taskDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  priorityPill: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.emeraldPrimary,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  trashBtn: {
    padding: 4,
  },
  emptyBox: {
    paddingVertical: 32,
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dialogChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#131714',
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dialogChipActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderColor: Colors.emeraldPrimary,
  },
  dialogChipText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  dialogChipTextActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
