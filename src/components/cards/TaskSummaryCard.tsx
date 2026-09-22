import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { GlassDialog } from '../common/GlassDialog';
import { GlassInput } from '../common/GlassInput';
import { EmeraldButton } from '../common/Buttons';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { Task, Priority } from '../../types/campus';
import { triggerHapticFeedback } from '../../utils/haptics';

const isNative = Platform.OS !== 'web';

interface TaskSummaryCardProps {
  onNavigateToTasks: () => void;
}

// Interactive Animated Task Row with smooth checkmark pop, spring rotate, strikethrough, and opacity
const AnimatedTaskItem: React.FC<{
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getPriorityTheme: (p: Priority) => { bg: string; text: string; border: string };
}> = ({ task, onToggle, onDelete, getPriorityTheme }) => {
  const { currentTheme } = useCampus();
  const checkScale = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const lineProgress = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const rowOpacity = useRef(new Animated.Value(task.completed ? 0.55 : 1)).current;
  const boxScale = useRef(new Animated.Value(1)).current;

  const priorityTheme = getPriorityTheme(task.priority);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: task.completed ? 1 : 0,
        friction: 6,
        tension: 110,
        useNativeDriver: isNative,
      }),
      Animated.timing(lineProgress, {
        toValue: task.completed ? 1 : 0,
        duration: 220,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }),
      Animated.timing(rowOpacity, {
        toValue: task.completed ? 0.55 : 1,
        duration: 200,
        useNativeDriver: isNative,
      }),
    ]).start();
  }, [task.completed]);

  const handlePress = () => {
    triggerHapticFeedback('selection');

    // Pop bounce on the checkbox icon
    Animated.sequence([
      Animated.timing(boxScale, { toValue: 1.3, duration: 100, useNativeDriver: isNative }),
      Animated.spring(boxScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: isNative }),
    ]).start();

    onToggle(task.id);
  };

  const lineWidth = lineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const checkRotate = checkScale.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        styles.taskRow,
        {
          backgroundColor: task.completed ? currentTheme.bgCardSecondary : currentTheme.bgInner,
          borderColor: currentTheme.borderGlass,
        },
        task.completed && styles.taskRowCompleted,
        { opacity: rowOpacity },
      ]}
    >
      {/* Animated Checkbox */}
      <TouchableOpacity
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.checkbox,
            { borderColor: currentTheme.primary + '60' },
            task.completed && {
              backgroundColor: currentTheme.primary,
              borderColor: currentTheme.primary,
            },
            { transform: [{ scale: boxScale }] },
          ]}
        >
          <Animated.View
            style={{
              transform: [{ scale: checkScale }, { rotate: checkRotate }],
              opacity: checkScale,
            }}
          >
            <MaterialIcons
              name="check"
              size={13}
              color={currentTheme.isDark ? '#050907' : '#FFFFFF'}
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* Task Details with Animated Strike-through */}
      <View style={styles.taskDetails}>
        <View style={styles.titleWrapper}>
          <Text
            style={[
              Typography.bodyMd,
              styles.taskTitle,
              { color: task.completed ? currentTheme.textMuted : currentTheme.textPrimary },
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          {/* Animated custom strikethrough line */}
          <Animated.View
            style={[
              styles.strikeThroughLine,
              {
                backgroundColor: currentTheme.primary,
                width: lineWidth,
                opacity: lineProgress,
              },
            ]}
          />
        </View>

        <View style={styles.taskMetaRow}>
          {/* Priority Badge */}
          <View
            style={[
              styles.priorityPill,
              {
                backgroundColor: priorityTheme.bg,
                borderColor: priorityTheme.border,
              },
            ]}
          >
            <Text style={[styles.priorityText, { color: priorityTheme.text }]}>
              {task.priority}
            </Text>
          </View>

          {/* Due Date Chip */}
          <View style={styles.dueDateChip}>
            <Feather name="clock" size={10} color={currentTheme.textMuted} />
            <Text style={[styles.dueDateText, { color: currentTheme.textMuted }]}>
              {task.dueDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        onPress={() => onDelete(task.id)}
        style={styles.deleteActionBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="trash-2" size={13} color={currentTheme.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({ onNavigateToTasks }) => {
  const { tasks, toggleTask, addTask, deleteTask, pendingTasksCount, currentTheme } = useCampus();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDue, setNewDue] = useState('Today');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');

  // Show top 3 pending tasks, if fewer than 3, show completed tasks to fill
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const displayTasks = [...pendingTasks, ...completedTasks].slice(0, 3);

  const getPriorityTheme = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return { bg: 'rgba(255, 82, 82, 0.15)', text: '#FF5252', border: 'rgba(255, 82, 82, 0.35)' };
      case 'HIGH':
        return { bg: 'rgba(255, 171, 64, 0.15)', text: '#FFAB40', border: 'rgba(255, 171, 64, 0.35)' };
      case 'MEDIUM':
        return {
          bg: currentTheme.primary + '18',
          text: currentTheme.primary,
          border: currentTheme.primary + '35',
        };
      case 'LOW':
      default:
        return {
          bg: currentTheme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
          text: currentTheme.textMuted,
          border: currentTheme.borderGlass,
        };
    }
  };

  const handleSaveNewTask = () => {
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newDesc.trim(), newDue, newPriority);
    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <>
      <EmeraldGlassCard onPress={onNavigateToTasks}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={[styles.iconCircle, { backgroundColor: currentTheme.primary + '18' }]}>
              <Feather name="check-square" size={16} color={currentTheme.primary} />
            </View>
            <Text style={[Typography.titleMd, { color: currentTheme.textPrimary }]}>Tasks & Deadlines</Text>
            {pendingTasksCount > 0 && (
              <View style={[styles.counterBadge, { backgroundColor: currentTheme.primary + '20' }]}>
                <Text style={[styles.counterText, { color: currentTheme.primary }]}>
                  {pendingTasksCount}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setIsAddModalOpen(true)}
              style={[styles.addTaskCircleBtn, { backgroundColor: currentTheme.bgCardSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="plus" size={14} color={currentTheme.primary} />
            </TouchableOpacity>
            <View style={[styles.arrowCircle, { backgroundColor: currentTheme.primary + '14' }]}>
              <Feather name="arrow-up-right" size={16} color={currentTheme.primary} />
            </View>
          </View>
        </View>

        {/* Task Items List */}
        <View style={styles.tasksList}>
          {displayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: currentTheme.textMuted }]}>
                All tasks completed! Tap + to add a task.
              </Text>
            </View>
          ) : (
            displayTasks.map((task) => (
              <AnimatedTaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                getPriorityTheme={getPriorityTheme}
              />
            ))
          )}
        </View>
      </EmeraldGlassCard>

      {/* Add Task Dialog */}
      <GlassDialog
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Task"
      >
        <GlassInput
          label="Task Title"
          placeholder="e.g. CS201 Assignment 3"
          value={newTitle}
          onChangeText={setNewTitle}
        />

        <GlassInput
          label="Description / Notes"
          placeholder="Optional notes or rubric details"
          value={newDesc}
          onChangeText={setNewDesc}
        />

        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { color: currentTheme.textMuted }]}>DUE DATE</Text>
          <View style={styles.selectorRow}>
            {['Today', 'Tomorrow', 'This Week'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.optionPill,
                  { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                  newDue === d && { backgroundColor: currentTheme.primary + '20', borderColor: currentTheme.primary },
                ]}
                onPress={() => setNewDue(d)}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    { color: newDue === d ? currentTheme.primary : currentTheme.textMuted },
                    newDue === d && styles.optionPillTextActive,
                  ]}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.sectionLabel, { color: currentTheme.textMuted }]}>PRIORITY LEVEL</Text>
          <View style={styles.selectorRow}>
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map((p) => {
              const pTheme = getPriorityTheme(p);
              const isSelected = newPriority === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.optionPill,
                    { backgroundColor: currentTheme.bgCardSecondary, borderColor: currentTheme.borderGlass },
                    isSelected && { backgroundColor: pTheme.bg, borderColor: pTheme.border },
                  ]}
                  onPress={() => setNewPriority(p)}
                >
                  <Text
                    style={[
                      styles.optionPillText,
                      { color: isSelected ? pTheme.text : currentTheme.textMuted },
                      isSelected && styles.optionPillTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <EmeraldButton label="Create Task" onPress={handleSaveNewTask} />
        </View>
      </GlassDialog>
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addTaskCircleBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksList: {
    gap: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.6,
  },
  taskRowCompleted: {
    opacity: 0.55,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDetails: {
    flex: 1,
    gap: 3,
  },
  titleWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  taskTitle: {
    fontWeight: '600',
  },
  strikeThroughLine: {
    position: 'absolute',
    left: 0,
    top: '50%',
    height: 1.5,
    borderRadius: 1,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dueDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueDateText: {
    fontSize: 10,
  },
  deleteActionBtn: {
    padding: 4,
  },
  emptyState: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
  formSection: {
    marginVertical: 6,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 0.7,
    alignItems: 'center',
  },
  optionPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  optionPillTextActive: {
    fontWeight: '700',
  },
});
