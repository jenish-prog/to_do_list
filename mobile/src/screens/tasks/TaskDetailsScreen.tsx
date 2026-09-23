import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Save,
  Bell,
} from 'lucide-react-native';
import { useTasks } from '../../store/taskStore';
import { PriorityBadge } from '../../components/PriorityBadge';
import { TaskPriority } from '../../types/task';
import { formatDateTime, isOverdue } from '../../utils/date';
import { colors } from '../../theme/colors';
import { DateTimePickerModal } from '../../components/DateTimePickerModal';

interface TaskDetailsScreenProps {
  route: any;
  navigation: any;
}

const REMINDER_OPTIONS = [
  { label: 'At time', minutes: 0 },
  { label: '5m before', minutes: 5 },
  { label: '10m before', minutes: 10 },
  { label: '15m before', minutes: 15 },
  { label: '30m before', minutes: 30 },
  { label: '1h before', minutes: 60 },
  { label: '1d before', minutes: 1440 },
  { label: 'Custom', minutes: -1 },
];

export const TaskDetailsScreen: React.FC<TaskDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { taskId } = route.params;
  const { tasks, updateTask, toggleTaskStatus, deleteTask } = useTasks();

  const task = tasks.find((t) => t._id === taskId);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Work');

  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [hasDeadline, setHasDeadline] = useState<boolean>(false);
  const [deadlineDate, setDeadlineDate] = useState<Date>(new Date());

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [reminderMinutes, setReminderMinutes] = useState<number>(15);
  const [isCustomReminder, setIsCustomReminder] = useState<boolean>(false);
  const [customReminderInput, setCustomReminderInput] = useState<string>('45');

  const [activePicker, setActivePicker] = useState<'scheduled' | 'deadline' | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setCategory(task.category || 'Work');
      if (task.dateTime) {
        setScheduledDate(new Date(task.dateTime));
      }
      if (task.deadline) {
        setHasDeadline(true);
        setDeadlineDate(new Date(task.deadline));
      } else {
        setHasDeadline(false);
      }
      setReminderEnabled(Boolean(task.reminderEnabled));
      if (task.reminderMinutesBefore !== undefined && task.reminderMinutesBefore !== null) {
        setReminderMinutes(task.reminderMinutesBefore);
        const isStandard = REMINDER_OPTIONS.some((o) => o.minutes === task.reminderMinutesBefore);
        if (!isStandard) {
          setIsCustomReminder(true);
          setCustomReminderInput(String(task.reminderMinutesBefore));
        }
      }
    }
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Task not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={18} color={colors.primaryText} />
            <Text style={styles.backButtonText}>Return</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSelectReminder = (minutes: number) => {
    if (minutes === -1) {
      setIsCustomReminder(true);
      const parsed = parseInt(customReminderInput, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setReminderMinutes(parsed);
      }
    } else {
      setIsCustomReminder(false);
      setReminderMinutes(minutes);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title cannot be empty');
      return;
    }

    try {
      const finalReminderMinutes = isCustomReminder
        ? Math.max(1, parseInt(customReminderInput, 10) || 15)
        : reminderMinutes;

      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dateTime: scheduledDate.toISOString(),
        deadline: hasDeadline ? deadlineDate.toISOString() : undefined,
        reminderEnabled,
        reminderMinutesBefore: reminderEnabled ? finalReminderMinutes : undefined,
      });

      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update task');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to permanently delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  };

  const isTaskOverdue = !task.completed && isOverdue(task.deadline);

  const getReminderText = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return 'At scheduled time';
    if (minutes === 0) return 'At scheduled time';
    if (minutes === 60) return '1 hour before';
    if (minutes === 1440) return '1 day before';
    return `${minutes} minutes before`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={20} color={colors.secondaryText} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            style={[styles.actionPill, isEditing && styles.saveActionPill]}
            activeOpacity={0.7}
          >
            {isEditing ? (
              <>
                <Save size={15} color={colors.primaryText} strokeWidth={2.4} />
                <Text style={styles.savePillText}>Save</Text>
              </>
            ) : (
              <>
                <Edit2 size={15} color={colors.text} strokeWidth={2} />
                <Text style={styles.actionPillText}>Edit</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color={colors.danger} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Completion Toggle Card */}
        <TouchableOpacity
          style={[styles.statusBanner, task.completed && styles.completedBanner]}
          onPress={() => toggleTaskStatus(task._id)}
          activeOpacity={0.8}
        >
          <View style={[styles.statusCheckbox, task.completed && styles.checkedCheckbox]}>
            {task.completed && <Check size={14} color={colors.primaryText} strokeWidth={3} />}
          </View>
          <Text style={[styles.statusText, task.completed && styles.completedStatusText]}>
            {task.completed ? 'Task completed' : 'Mark as complete'}
          </Text>
        </TouchableOpacity>

        {/* Content Area */}
        {isEditing ? (
          /* EDIT MODE */
          <View style={styles.editSection}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.editTitleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Task title"
                placeholderTextColor={colors.mutedText}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.editDescInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Task description"
                placeholderTextColor={colors.mutedText}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Priority */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Priority</Text>
              <View style={styles.segmentedControl}>
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                  const isSelected = priority === p;
                  const color =
                    p === 'high'
                      ? colors.danger
                      : p === 'medium'
                      ? colors.warning
                      : colors.success;

                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.segmentTab,
                        isSelected && styles.selectedSegmentTab,
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <View style={[styles.segmentDot, { backgroundColor: color }]} />
                      <Text
                        style={[
                          styles.segmentText,
                          isSelected && styles.selectedSegmentText,
                        ]}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.chipsRow}>
                {['Work', 'Study', 'Personal', 'Other'].map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        isSelected && styles.selectedChip,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.selectedChipText,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Scheduled Date/Time Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Scheduled Time</Text>
              <TouchableOpacity
                style={styles.pickerTrigger}
                onPress={() => setActivePicker('scheduled')}
              >
                <CalendarIcon size={16} color={colors.primarySoft} strokeWidth={2} />
                <Text style={styles.pickerValue}>{formatDateTime(scheduledDate)}</Text>
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Deadline Picker */}
            <View style={styles.inputGroup}>
              <View style={styles.toggleRow}>
                <Text style={styles.inputLabel}>Deadline</Text>
                <Switch
                  value={hasDeadline}
                  onValueChange={setHasDeadline}
                  trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                  thumbColor={hasDeadline ? colors.primaryText : colors.secondaryText}
                />
              </View>
              {hasDeadline && (
                <TouchableOpacity
                  style={[styles.pickerTrigger, { marginTop: 8 }]}
                  onPress={() => setActivePicker('deadline')}
                >
                  <Clock size={16} color={colors.warning} strokeWidth={2} />
                  <Text style={styles.pickerValue}>{formatDateTime(deadlineDate)}</Text>
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Reminder Setting */}
            <View style={styles.inputGroup}>
              <View style={styles.toggleRow}>
                <View style={styles.labelWithIcon}>
                  <Bell size={16} color={colors.primarySoft} strokeWidth={2} />
                  <Text style={styles.inputLabel}>Reminder Notification</Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                  thumbColor={reminderEnabled ? colors.primaryText : colors.secondaryText}
                />
              </View>

              {reminderEnabled && (
                <View style={styles.reminderContainer}>
                  <Text style={styles.reminderSub}>Notify me:</Text>
                  <View style={styles.chipsRow}>
                    {REMINDER_OPTIONS.map((opt) => {
                      const isSelected = isCustomReminder
                        ? opt.minutes === -1
                        : reminderMinutes === opt.minutes;

                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[
                            styles.reminderChip,
                            isSelected && styles.selectedReminderChip,
                          ]}
                          onPress={() => handleSelectReminder(opt.minutes)}
                        >
                          <Text
                            style={[
                              styles.reminderChipText,
                              isSelected && styles.selectedReminderChipText,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {isCustomReminder && (
                    <View style={styles.customReminderRow}>
                      <Text style={styles.customReminderText}>Minutes before:</Text>
                      <TextInput
                        style={styles.customInput}
                        keyboardType="numeric"
                        value={customReminderInput}
                        onChangeText={(val) => {
                          setCustomReminderInput(val);
                          const p = parseInt(val, 10);
                          if (!isNaN(p) && p > 0) setReminderMinutes(p);
                        }}
                        maxLength={4}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : (
          /* VIEW MODE */
          <View style={styles.viewSection}>
            <Text
              style={[
                styles.taskTitle,
                task.completed && styles.completedTaskTitle,
              ]}
            >
              {task.title}
            </Text>

            {Boolean(task.description) && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}

            {/* Information Grid */}
            <View style={styles.metaCardsContainer}>
              {/* Priority */}
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>PRIORITY</Text>
                <PriorityBadge priority={task.priority} />
              </View>

              {/* Category */}
              {Boolean(task.category) && (
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>CATEGORY</Text>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{task.category}</Text>
                  </View>
                </View>
              )}

              {/* Scheduled Time */}
              {Boolean(task.dateTime) && (
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>SCHEDULED TIME</Text>
                  <View style={styles.valueRow}>
                    <CalendarIcon size={14} color={colors.primarySoft} strokeWidth={2} />
                    <Text style={styles.valueText}>{formatDateTime(task.dateTime)}</Text>
                  </View>
                </View>
              )}

              {/* Deadline */}
              {Boolean(task.deadline) && (
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>DEADLINE</Text>
                  <View style={styles.valueRow}>
                    {isTaskOverdue ? (
                      <AlertCircle size={14} color={colors.danger} strokeWidth={2} />
                    ) : (
                      <Clock size={14} color={colors.secondaryText} strokeWidth={2} />
                    )}
                    <Text
                      style={[
                        styles.valueText,
                        isTaskOverdue && styles.overdueValueText,
                      ]}
                    >
                      {formatDateTime(task.deadline)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Reminder Notification Badge */}
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>REMINDER</Text>
                <View style={styles.valueRow}>
                  <Bell
                    size={14}
                    color={task.reminderEnabled ? colors.primarySoft : colors.mutedText}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.valueText,
                      !task.reminderEnabled && styles.disabledReminderText,
                    ]}
                  >
                    {task.reminderEnabled
                      ? getReminderText(task.reminderMinutesBefore)
                      : 'Disabled'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Date & Time Picker Modal */}
      <DateTimePickerModal
        visible={activePicker !== null}
        mode="datetime"
        value={activePicker === 'deadline' ? deadlineDate : scheduledDate}
        title={activePicker === 'deadline' ? 'Set Deadline' : 'Set Scheduled Time'}
        onConfirm={(picked) => {
          if (activePicker === 'deadline') {
            setDeadlineDate(picked);
          } else {
            setScheduledDate(picked);
          }
          setActivePicker(null);
        }}
        onCancel={() => setActivePicker(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveActionPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  savePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryText,
  },
  deleteIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  completedBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: colors.borderLight,
  },
  statusCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  completedStatusText: {
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  viewSection: {
    gap: 18,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: colors.mutedText,
  },
  taskDescription: {
    fontSize: 15,
    color: colors.secondaryText,
    lineHeight: 22,
  },
  metaCardsContainer: {
    gap: 12,
    marginTop: 8,
  },
  metaCard: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  overdueValueText: {
    color: colors.danger,
    fontWeight: '700',
  },
  disabledReminderText: {
    color: colors.mutedText,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  editSection: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  editTitleInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  editDescInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 74,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  selectedSegmentTab: {
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  segmentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  selectedSegmentText: {
    color: colors.text,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  selectedChipText: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerValue: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primarySoft,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10,
  },
  reminderSub: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  reminderChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedReminderChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reminderChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  selectedReminderChipText: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  customReminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customReminderText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  customInput: {
    width: 60,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
});
