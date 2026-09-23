import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertCircle,
  Bell,
  Check,
} from 'lucide-react-native';
import { useTasks } from '../../store/taskStore';
import { TaskPriority } from '../../types/task';
import { colors } from '../../theme/colors';
import { DateTimePickerModal } from '../../components/DateTimePickerModal';
import { formatDateTime } from '../../utils/date';

interface AddTaskScreenProps {
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

export const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ navigation }) => {
  const { addTask, isLoading } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Work');

  // Dates: allows selecting any valid date and any hour/minute
  const [scheduledDate, setScheduledDate] = useState<Date>(
    new Date(Date.now() + 60 * 60 * 1000)
  );
  const [hasDeadline, setHasDeadline] = useState<boolean>(false);
  const [deadlineDate, setDeadlineDate] = useState<Date>(
    new Date(Date.now() + 4 * 60 * 60 * 1000)
  );

  // Active Picker Modal
  const [activePicker, setActivePicker] = useState<'scheduled' | 'deadline' | null>(null);

  // Reminder settings
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderMinutes, setReminderMinutes] = useState<number>(15);
  const [isCustomReminder, setIsCustomReminder] = useState<boolean>(false);
  const [customReminderInput, setCustomReminderInput] = useState<string>('45');

  const [validationError, setValidationError] = useState<string | null>(null);

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

  const handleCustomReminderChange = (val: string) => {
    setCustomReminderInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setReminderMinutes(parsed);
    }
  };

  const handleCreate = async () => {
    setValidationError(null);
    if (!title.trim()) {
      setValidationError('Please enter a task title');
      return;
    }

    try {
      const finalReminderMinutes = isCustomReminder
        ? Math.max(1, parseInt(customReminderInput, 10) || 15)
        : reminderMinutes;

      const success = await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        dateTime: scheduledDate.toISOString(),
        deadline: hasDeadline ? deadlineDate.toISOString() : undefined,
        priority,
        category,
        reminderEnabled,
        reminderMinutesBefore: reminderEnabled ? finalReminderMinutes : undefined,
      });

      if (success) {
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to create task');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIndicator} />
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Create Task</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color={colors.secondaryText} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Validation Error Banner */}
        {Boolean(validationError) && (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={colors.danger} strokeWidth={2} />
            <Text style={styles.errorBannerText}>{validationError}</Text>
          </View>
        )}

        {/* Task Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Task title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.mutedText}
            value={title}
            onChangeText={(val) => {
              setTitle(val);
              if (validationError) setValidationError(null);
            }}
            autoFocus
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description (optional)</Text>
          <TextInput
            style={styles.descInput}
            placeholder="Add details, notes, or instructions..."
            placeholderTextColor={colors.mutedText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Priority Segmented Control */}
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
                  activeOpacity={0.7}
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

        {/* Category Selector */}
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
                  activeOpacity={0.7}
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

        {/* Schedule: Date & Time Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Scheduled Date & Time</Text>
          <TouchableOpacity
            style={styles.pickerTriggerCard}
            onPress={() => setActivePicker('scheduled')}
            activeOpacity={0.75}
          >
            <View style={styles.pickerTriggerLeft}>
              <CalendarIcon size={16} color={colors.primarySoft} strokeWidth={2} />
              <Text style={styles.pickerTriggerValue}>
                {formatDateTime(scheduledDate)}
              </Text>
            </View>
            <Text style={styles.pickerChangeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Deadline Toggle & Picker */}
        <View style={styles.inputGroup}>
          <View style={styles.toggleRow}>
            <Text style={styles.inputLabel}>Add Deadline</Text>
            <Switch
              value={hasDeadline}
              onValueChange={setHasDeadline}
              trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
              thumbColor={hasDeadline ? colors.primaryText : colors.secondaryText}
            />
          </View>

          {hasDeadline && (
            <TouchableOpacity
              style={[styles.pickerTriggerCard, { marginTop: 8 }]}
              onPress={() => setActivePicker('deadline')}
              activeOpacity={0.75}
            >
              <View style={styles.pickerTriggerLeft}>
                <Clock size={16} color={colors.warning} strokeWidth={2} />
                <Text style={styles.pickerTriggerValue}>
                  {formatDateTime(deadlineDate)}
                </Text>
              </View>
              <Text style={styles.pickerChangeText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Task Reminder Notification Section */}
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
            <View style={styles.reminderOptionsContainer}>
              <Text style={styles.reminderSubLabel}>Notify me:</Text>
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
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <Check size={11} color={colors.primaryText} strokeWidth={3} />
                      )}
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
                  <Text style={styles.customReminderPrompt}>Minutes before:</Text>
                  <TextInput
                    style={styles.customReminderInput}
                    keyboardType="numeric"
                    value={customReminderInput}
                    onChangeText={handleCustomReminderChange}
                    maxLength={4}
                  />
                  <Text style={styles.customReminderUnit}>min</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.disabledButton]}
            onPress={handleCreate}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryText} size="small" />
            ) : (
              <>
                <Plus size={18} color={colors.primaryText} strokeWidth={2.4} />
                <Text style={styles.createButtonText}>Create Task</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date & Time Picker Modal */}
      <DateTimePickerModal
        visible={activePicker !== null}
        mode="datetime"
        value={activePicker === 'deadline' ? deadlineDate : scheduledDate}
        title={activePicker === 'deadline' ? 'Set Deadline' : 'Set Scheduled Time'}
        minimumDate={new Date()}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 12,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  titleInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descInput: {
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
  pickerTriggerCard: {
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
  pickerTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerTriggerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  pickerChangeText: {
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
  reminderOptionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10,
    marginTop: 6,
  },
  reminderSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    paddingTop: 4,
  },
  customReminderPrompt: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  customReminderInput: {
    width: 64,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  customReminderUnit: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  actionContainer: {
    paddingTop: 10,
  },
  createButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
});
