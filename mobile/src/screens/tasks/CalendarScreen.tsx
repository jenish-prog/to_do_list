import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react-native';
import { useTasks } from '../../store/taskStore';
import { TaskCard } from '../../components/TaskCard';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { getFormattedHeaderDate } from '../../utils/date';

interface CalendarScreenProps {
  navigation: any;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  // Generate 7 days ahead
  const days = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      list.push({
        offset: i,
        dateObj: d,
        dayName: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        dateStr: d.toISOString().split('T')[0],
      });
    }
    return list;
  }, []);

  // Compute tasks count per day for dot indicators
  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach((t) => {
      const dateStr = (t.dateTime || t.deadline || '').split('T')[0];
      if (dateStr) {
        map[dateStr] = (map[dateStr] || 0) + 1;
      }
    });
    return map;
  }, [tasks]);

  // Selected date object
  const selectedDay = useMemo(() => {
    return days[selectedDayOffset] || days[0];
  }, [days, selectedDayOffset]);

  // Filter tasks matching the selected day
  const filteredTasks = useMemo(() => {
    const targetDateStr = selectedDay.dateStr;
    return tasks.filter((t) => {
      const taskDate = (t.dateTime || t.deadline || '').split('T')[0];
      return taskDate === targetDateStr;
    });
  }, [tasks, selectedDay]);

  const monthYearLabel = useMemo(() => {
    return selectedDay.dateObj.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDay]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>{monthYearLabel}</Text>
        </View>

        {selectedDayOffset !== 0 && (
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => setSelectedDayOffset(0)}
            activeOpacity={0.75}
          >
            <RotateCcw size={13} color={colors.text} strokeWidth={2.2} />
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Date Picker Strip */}
      <View style={styles.dateStrip}>
        {days.map((day) => {
          const isSelected = selectedDayOffset === day.offset;
          const count = tasksByDate[day.dateStr] || 0;

          return (
            <TouchableOpacity
              key={day.offset}
              style={[
                styles.dayCard,
                isSelected && styles.selectedDayCard,
              ]}
              onPress={() => setSelectedDayOffset(day.offset)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNameText,
                  isSelected && styles.selectedDayNameText,
                ]}
              >
                {day.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNumText,
                  isSelected && styles.selectedDayNumText,
                ]}
              >
                {day.dayNum}
              </Text>

              {/* Task Indicator Dot */}
              <View
                style={[
                  styles.dotIndicator,
                  count > 0 && (isSelected ? styles.selectedDot : styles.activeDot),
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Summary Bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryDateText}>
          {getFormattedHeaderDate(selectedDay.dateObj)}
        </Text>
        <Text style={styles.summaryCountText}>
          {filteredTasks.length === 0
            ? 'No tasks scheduled'
            : `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`}
        </Text>
      </View>

      {/* Task List for Selected Day */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetails', { taskId: item._id })}
            onToggleStatus={() => toggleTaskStatus(item._id)}
            onDelete={() => deleteTask(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No tasks on this date"
            description="You have free time! Schedule a new task or take a well-deserved break."
            actionLabel="Add Task"
            onAction={() => navigation.navigate('AddTask')}
            icon={<CalendarIcon size={30} color={colors.primarySoft} strokeWidth={1.8} />}
          />
        }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
    fontWeight: '500',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  todayButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  dateStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selectedDayCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondaryText,
    marginBottom: 4,
  },
  selectedDayNameText: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  dayNumText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  selectedDayNumText: {
    color: colors.primaryText,
    fontWeight: '800',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    backgroundColor: 'transparent',
  },
  activeDot: {
    backgroundColor: colors.secondaryText,
  },
  selectedDot: {
    backgroundColor: colors.primaryText,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 8,
  },
  summaryDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  summaryCountText: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
