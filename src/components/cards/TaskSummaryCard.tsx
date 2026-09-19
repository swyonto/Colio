import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { EmeraldGlassCard } from '../common/EmeraldGlassCard';
import { GlassDialog } from '../common/GlassDialog';
import { GlassInput } from '../common/GlassInput';
import { EmeraldButton } from '../common/Buttons';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { useCampus } from '../../context/CampusContext';
import { Task, Priority } from '../../types/campus';
import { triggerHapticFeedback } from '../../utils/haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TaskSummaryCardProps {
  onNavigateToTasks: () => void;
}

// Interactive Animated Task Row with smooth checkmark and strikethrough effect
const AnimatedTaskItem: React.FC<{
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  getPriorityTheme: (p: Priority) => { bg: string; text: string; border: string };
}> = ({ task, onToggle, onDelete, getPriorityTheme }) => {
  const checkScale = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const boxScale = useRef(new Animated.Value(1)).current;
  const lineProgress = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const priorityTheme = getPriorityTheme(task.priority);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: task.completed ? 1 : 0,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(lineProgress, {
        toValue: task.completed ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [task.completed]);

  const handlePress = () => {
    triggerHapticFeedback('selection');
    // Button pop bounce
    Animated.sequence([
      Animated.timing(boxScale, { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.spring(boxScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {}

    onToggle(task.id);
  };

  const lineWidth = lineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.taskRow, task.completed && styles.taskRowCompleted]}>
      {/* Animated Checkbox */}
      <TouchableOpacity
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.checkbox,
            task.completed && styles.checkboxChecked,
            { transform: [{ scale: boxScale }] },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: checkScale }], opacity: checkScale }}>
            <MaterialIcons name="check" size={13} color="#050907" />
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
              task.completed && styles.taskTitleCompleted,
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
            <Feather name="clock" size={10} color={Colors.textMuted} />
            <Text style={styles.dueDateText}>{task.dueDate}</Text>
          </View>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => onDelete(task.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.deleteBtn}
      >
        <Feather name="trash-2" size={14} color={Colors.textDisabled} />
      </TouchableOpacity>
    </View>
  );
};

export const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({ onNavigateToTasks }) => {
  const { tasks, toggleTask, addTask, deleteTask, pendingTasksCount } = useCampus();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('Today');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');

  // Preview first 4 tasks on home dashboard
  const previewTasks = tasks.slice(0, 4);

  const getPriorityTheme = (p: Priority) => {
    switch (p) {
      case 'URGENT':
        return { bg: Colors.statusAbsentBg, text: Colors.statusAbsent, border: 'rgba(255, 82, 82, 0.4)' };
      case 'HIGH':
        return { bg: Colors.statusPendingBg, text: Colors.statusPending, border: 'rgba(255, 171, 64, 0.4)' };
      case 'LOW':
        return { bg: 'rgba(255, 255, 255, 0.06)', text: Colors.textMuted, border: 'rgba(255, 255, 255, 0.12)' };
      case 'MEDIUM':
      default:
        return { bg: Colors.statusPresentBg, text: Colors.statusPresent, border: 'rgba(0, 230, 118, 0.4)' };
    }
  };

  const handleSaveTask = () => {
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newDesc.trim(), newDueDate, newPriority);
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('Today');
    setNewPriority('MEDIUM');
    setIsAddModalOpen(false);
  };

  return (
    <>
      <EmeraldGlassCard onPress={onNavigateToTasks}>
        {/* Header: Title is now "Tasks" */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <View style={styles.iconCircle}>
              <Feather name="check-square" size={17} color={Colors.emeraldPrimary} />
            </View>
            <Text style={[Typography.titleMd, styles.cardTitle]}>Tasks</Text>
            {pendingTasksCount > 0 && (
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>{pendingTasksCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addTaskCircleBtn}
              onPress={() => setIsAddModalOpen(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="plus" size={16} color={Colors.emeraldPrimary} />
            </TouchableOpacity>

            <View style={styles.arrowCircle}>
              <Feather name="arrow-up-right" size={16} color={Colors.emeraldPrimary} />
            </View>
          </View>
        </View>

        {/* Task List */}
        {previewTasks.length === 0 ? (
          <View style={styles.emptyTasksContainer}>
            <Text style={styles.emptyTasksText}>All caught up! No tasks pending.</Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {previewTasks.map((task) => (
              <AnimatedTaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                getPriorityTheme={getPriorityTheme}
              />
            ))}
          </View>
        )}
      </EmeraldGlassCard>

      {/* Simplified New Task Modal (Section 6.2 - No Subject Friction) */}
      <GlassDialog
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="New Task"
      >
        <GlassInput
          label="Task Title *"
          placeholder="e.g. Submit Operating System Assignment"
          value={newTitle}
          onChangeText={setNewTitle}
          autoFocus
        />

        <GlassInput
          label="Description (Optional)"
          placeholder="e.g. Include questions 1 to 5 and graphs"
          value={newDesc}
          onChangeText={setNewDesc}
        />

        {/* Quick Date Chips */}
        <Text style={[Typography.labelSm, styles.chipGroupLabel]}>DUE DATE</Text>
        <View style={styles.chipsRow}>
          {['Today', 'Tomorrow', 'This Week'].map((dateOption) => {
            const isSelected = newDueDate === dateOption;
            return (
              <TouchableOpacity
                key={dateOption}
                style={[styles.quickChip, isSelected && styles.quickChipActive]}
                onPress={() => setNewDueDate(dateOption)}
              >
                <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                  {dateOption}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Priority Selector */}
        <Text style={[Typography.labelSm, styles.chipGroupLabel]}>PRIORITY</Text>
        <View style={styles.chipsRow}>
          {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map((p) => {
            const isSelected = newPriority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.quickChip, isSelected && styles.quickChipActive]}
                onPress={() => setNewPriority(p)}
              >
                <Text style={[styles.quickChipText, isSelected && styles.quickChipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 18 }}>
          <EmeraldButton label="Save Task" onPress={handleSaveTask} />
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
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: Colors.textPrimary,
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  counterText: {
    color: Colors.emeraldPrimary,
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
    backgroundColor: '#161917',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 230, 118, 0.10)',
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
    backgroundColor: '#0C0F0D',
    borderRadius: 10,
    padding: 10,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  taskRowCompleted: {
    opacity: 0.55,
    backgroundColor: '#0A0C0A',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 230, 118, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.emeraldPrimary,
    borderColor: Colors.emeraldPrimary,
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
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  taskTitleCompleted: {
    color: Colors.textMuted,
  },
  strikeThroughLine: {
    position: 'absolute',
    left: 0,
    top: '50%',
    height: 1.5,
    backgroundColor: Colors.emeraldPrimary,
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
    color: Colors.textMuted,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyTasksContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyTasksText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  chipGroupLabel: {
    color: Colors.textMuted,
    marginTop: 10,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#121614',
    borderWidth: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickChipActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.20)',
    borderColor: Colors.emeraldPrimary,
  },
  quickChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  quickChipTextActive: {
    color: Colors.textPrimary,
  },
});
