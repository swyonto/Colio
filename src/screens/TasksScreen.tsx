import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GlassDialog } from '../components/common/GlassDialog';
import { GlassInput } from '../components/common/GlassInput';
import { EmeraldButton } from '../components/common/Buttons';
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

  const getPriorityTheme = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return { bg: 'rgba(255, 82, 82, 0.15)', text: '#FF5252' };
      case 'HIGH':
        return { bg: 'rgba(255, 145, 0, 0.15)', text: '#FF9100' };
      case 'MEDIUM':
        return { bg: currentTheme.primary + '18', text: currentTheme.primary };
      case 'LOW':
      default:
        return { bg: 'rgba(0, 176, 255, 0.15)', text: '#00B0FF' };
    }
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
            Tasks & Deadlines
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.textMuted }]}>
            {tasks.filter((t) => !t.completed).length} Pending • {tasks.filter((t) => t.completed).length} Completed
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          style={[styles.addBtn, { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary }]}
        >
          <Feather name="plus" size={16} color={currentTheme.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterRow, { backgroundColor: currentTheme.bgCardSecondary, borderBottomColor: currentTheme.borderGlass }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['all', 'pending', 'completed', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((f) => {
            const isSelected = filterPriority === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                  isSelected && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
                ]}
                onPress={() => setFilterPriority(f)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: currentTheme.textMuted },
                    isSelected && { color: currentTheme.textPrimary, fontWeight: '700' },
                  ]}
                >
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
            <Text style={[styles.emptyText, { color: currentTheme.textMuted }]}>No tasks found in this view.</Text>
          </View>
        ) : (
          filteredTasks.map((t) => {
            const pTheme = getPriorityTheme(t.priority);

            return (
              <View
                key={t.id}
                style={[
                  styles.taskCard,
                  { backgroundColor: currentTheme.bgCard, borderColor: currentTheme.borderGlass },
                  t.completed && [styles.taskCardCompleted, { backgroundColor: currentTheme.bgCardSecondary }],
                ]}
              >
                {/* Checkbox */}
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: currentTheme.primary + '50' },
                    t.completed && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary },
                  ]}
                  onPress={() => toggleTask(t.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {t.completed && (
                    <Feather
                      name="check"
                      size={13}
                      color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
                    />
                  )}
                </TouchableOpacity>

                {/* Content */}
                <View style={styles.taskContent}>
                  <Text
                    style={[
                      Typography.titleSm,
                      { color: currentTheme.textPrimary, fontWeight: '600' },
                      t.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {t.title}
                  </Text>
                  {Boolean(t.description) && (
                    <Text style={[styles.taskDesc, { color: currentTheme.textMuted }]}>
                      {t.description}
                    </Text>
                  )}

                  <View style={styles.metaRow}>
                    <View style={[styles.priorityPill, { backgroundColor: pTheme.bg }]}>
                      <Text style={[styles.priorityText, { color: pTheme.text }]}>
                        {t.priority}
                      </Text>
                    </View>
                    <View style={styles.dueRow}>
                      <Feather name="clock" size={11} color={currentTheme.textMuted} />
                      <Text style={[styles.dueText, { color: currentTheme.textMuted }]}>{t.dueDate}</Text>
                    </View>
                  </View>
                </View>

                {/* Trash */}
                <TouchableOpacity
                  onPress={() => deleteTask(t.id)}
                  style={styles.trashBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={14} color={currentTheme.textDisabled} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Task Dialog */}
      <GlassDialog
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Assignment / Task"
      >
        <GlassInput
          label="Title *"
          placeholder="e.g. Physics Lab Report Unit 3"
          value={title}
          onChangeText={setTitle}
          autoFocus
        />

        <GlassInput
          label="Description (Optional)"
          placeholder="e.g. Include circuit diagram & graph"
          value={desc}
          onChangeText={setDesc}
        />

        <GlassInput
          label="Due Date / Tag"
          placeholder="e.g. Today, Tomorrow, Friday, or 2026-10-02"
          value={dueDate}
          onChangeText={setDueDate}
        />

        {/* Priority Chips */}
        <Text style={[Typography.labelSm, { color: currentTheme.textMuted, marginTop: 10, marginBottom: 6 }]}>
          PRIORITY
        </Text>
        <View style={styles.chipsWrap}>
          {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.dialogChip,
                { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                priority === p && { backgroundColor: currentTheme.primary + '25', borderColor: currentTheme.primary },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.dialogChipText,
                  { color: currentTheme.textMuted },
                  priority === p && { color: currentTheme.textPrimary, fontWeight: '700' },
                ]}
              >
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
  filterRow: {
    paddingVertical: 8,
    borderBottomWidth: 0.6,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 0.6,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
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
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.7,
    gap: 12,
  },
  taskCardCompleted: {
    opacity: 0.55,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskDesc: {
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueText: {
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
    fontSize: 13,
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
    borderWidth: 0.6,
  },
  dialogChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
