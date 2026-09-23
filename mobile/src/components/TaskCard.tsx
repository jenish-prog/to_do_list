import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, Trash2, Clock, AlertCircle, Bell, Calendar as CalendarIcon } from 'lucide-react-native';
import { Task } from '../types/task';
import { colors } from '../theme/colors';
import { PriorityBadge } from './PriorityBadge';
import { formatDisplayDeadline, isOverdue } from '../utils/date';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  showCategory?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggleStatus,
  onDelete,
}) => {
  const isTaskOverdue = !task.completed && isOverdue(task.deadline);
  const formattedDeadline = formatDisplayDeadline(task.deadline);
  const formattedScheduled = task.dateTime && task.dateTime !== task.deadline
    ? formatDisplayDeadline(task.dateTime)
    : null;

  const formatReminderText = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return 'Reminder';
    if (minutes === 0) return 'At time';
    if (minutes === 5) return '5m before';
    if (minutes === 10) return '10m before';
    if (minutes === 15) return '15m before';
    if (minutes === 30) return '30m before';
    if (minutes === 60) return '1h before';
    if (minutes === 1440) return '1d before';
    return `${minutes}m before`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.card,
        task.completed && styles.completedCard,
        isTaskOverdue && styles.overdueCard,
      ]}
      onPress={onPress}
    >
      <View style={styles.cardLayout}>
        {/* Toggle Checkbox Column */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleStatus}
          style={[
            styles.checkbox,
            task.completed && styles.checkedBox,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {task.completed && (
            <Check size={13} color={colors.primaryText} strokeWidth={3} />
          )}
        </TouchableOpacity>

        {/* Center Content Column */}
        <View style={styles.contentColumn}>
          {/* Title */}
          <Text
            style={[
              styles.title,
              task.completed && styles.completedTitle,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* Description */}
          {Boolean(task.description) && (
            <Text
              style={[
                styles.description,
                task.completed && styles.completedDescription,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}

          {/* Metadata Badges Row */}
          <View style={styles.metaRow}>
            {/* Priority Badge */}
            <PriorityBadge priority={task.priority} />

            {/* Scheduled Date/Time Badge */}
            {Boolean(formattedScheduled) && (
              <View style={styles.metaBadge}>
                <CalendarIcon size={11} color={colors.secondaryText} strokeWidth={2} />
                <Text style={styles.metaBadgeText}>{formattedScheduled}</Text>
              </View>
            )}

            {/* Deadline Badge */}
            {Boolean(formattedDeadline) && (
              <View
                style={[
                  styles.metaBadge,
                  isTaskOverdue && styles.overdueMetaBadge,
                ]}
              >
                {isTaskOverdue ? (
                  <AlertCircle size={11} color={colors.danger} strokeWidth={2.2} />
                ) : (
                  <Clock size={11} color={colors.secondaryText} strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.metaBadgeText,
                    isTaskOverdue && styles.overdueMetaBadgeText,
                    task.completed && styles.completedMetaText,
                  ]}
                >
                  {formattedDeadline}
                </Text>
              </View>
            )}

            {/* Reminder Badge */}
            {Boolean(task.reminderEnabled && !task.completed) && (
              <View style={styles.reminderBadge}>
                <Bell size={11} color={colors.primarySoft} strokeWidth={2.2} />
                <Text style={styles.reminderBadgeText}>
                  {formatReminderText(task.reminderMinutesBefore)}
                </Text>
              </View>
            )}

            {/* Category Tag Badge */}
            {Boolean(task.category) && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{task.category}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right Actions Column */}
        <TouchableOpacity
          activeOpacity={0.65}
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={16} color={colors.mutedText} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  completedCard: {
    opacity: 0.55,
    backgroundColor: '#0F1115',
    borderColor: colors.borderLight,
  },
  overdueCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  cardLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  checkedBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  contentColumn: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.mutedText,
  },
  description: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 18,
    marginTop: 4,
  },
  completedDescription: {
    color: colors.mutedText,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.elevatedSurface,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  overdueMetaBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  overdueMetaBadgeText: {
    color: colors.danger,
    fontWeight: '700',
  },
  completedMetaText: {
    color: colors.mutedText,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  reminderBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  deleteButton: {
    padding: 4,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
