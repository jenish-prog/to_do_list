import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Plus, Zap, CheckCircle2, Clock } from 'lucide-react-native';
import { useAuth } from '../../store/authStore';
import { useTasks } from '../../store/taskStore';
import { UserAvatar } from '../../components/UserAvatar';
import { TaskCard } from '../../components/TaskCard';
import { PriorityBadge } from '../../components/PriorityBadge';
import { EmptyState } from '../../components/EmptyState';
import { getGreeting, getFormattedHeaderDate, isToday, isUpcoming, formatDisplayDeadline } from '../../utils/date';
import { getRecommendedNextTasks } from '../../utils/urgency';
import { Task, TaskFilter } from '../../types/task';
import { colors } from '../../theme/colors';

interface HomeScreenProps {
  navigation: any;
}

type FilterTab = 'all' | 'today' | 'upcoming' | 'completed';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, avatar } = useAuth();
  const {
    tasks,
    isLoading,
    isRefreshing,
    fetchTasks,
    toggleTaskStatus,
    deleteTask,
  } = useTasks();

  const [activeTab, setActiveTab] = useState<FilterTab>('today');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const greeting = getGreeting();
  const formattedDate = getFormattedHeaderDate();
  const displayName = user?.name ? user.name.split(' ')[0] : 'there';

  // Metrics calculations
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => isToday(t.dateTime || t.deadline));
  }, [tasks]);

  const completedTodayCount = useMemo(() => {
    return todayTasks.filter((t) => t.completed).length;
  }, [todayTasks]);

  const leftTodayCount = useMemo(() => {
    return todayTasks.filter((t) => !t.completed).length;
  }, [todayTasks]);

  // Urgency Focus: top 1-2 high-priority uncompleted tasks
  const focusTasks = useMemo(() => {
    return getRecommendedNextTasks(tasks, 2);
  }, [tasks]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return tasks.filter((t) => isToday(t.dateTime || t.deadline));
      case 'upcoming':
        return tasks.filter((t) => !t.completed && isUpcoming(t.dateTime || t.deadline));
      case 'completed':
        return tasks.filter((t) => t.completed);
      case 'all':
      default:
        return tasks;
    }
  }, [tasks, activeTab]);

  return (
    <SafeAreaView style={styles.container}>
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchTasks(true)}
            tintColor={colors.primarySoft}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Top Greeting & User Profile */}
            <View style={styles.topRow}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingSub}>{greeting},</Text>
                <Text style={styles.greetingName} numberOfLines={1} ellipsizeMode="tail">
                  {displayName}
                </Text>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>

              <TouchableOpacity
                style={styles.avatarButton}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('Profile')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <UserAvatar avatar={avatar} name={user?.name} size={48} />
              </TouchableOpacity>
            </View>

            {/* Summary Hero Card */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCount}>
                {todayTasks.length > 0 ? todayTasks.length : tasks.length}
              </Text>
              <Text style={styles.summaryLabel}>
                {todayTasks.length > 0 ? 'Tasks today' : 'Total tasks'}
              </Text>

              <View style={styles.summarySubrow}>
                <View style={styles.summaryStat}>
                  <CheckCircle2 size={13} color={colors.success} strokeWidth={2} />
                  <Text style={styles.summaryStatText}>
                    {completedTodayCount} completed
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.summaryStat}>
                  <Clock size={13} color={colors.primarySoft} strokeWidth={2} />
                  <Text style={styles.summaryStatText}>
                    {leftTodayCount} left
                  </Text>
                </View>
              </View>
            </View>

            {/* FOCUS TODAY Section (Recommended Next) */}
            {focusTasks.length > 0 && activeTab !== 'completed' && (
              <View style={styles.focusSection}>
                <View style={styles.focusHeaderRow}>
                  <View style={styles.focusLabelPill}>
                    <Zap size={13} color={colors.warning} strokeWidth={2.2} />
                    <Text style={styles.focusLabelText}>FOCUS TODAY</Text>
                  </View>
                  <Text style={styles.focusCountText}>
                    {focusTasks.length} {focusTasks.length === 1 ? 'task' : 'tasks'}
                  </Text>
                </View>

                {focusTasks.map((task) => (
                  <TouchableOpacity
                    key={task._id}
                    style={styles.focusCard}
                    activeOpacity={0.75}
                    onPress={() =>
                      navigation.navigate('TaskDetails', { taskId: task._id })
                    }
                  >
                    <View style={styles.focusCardTop}>
                      <Text style={styles.focusCardTitle} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <PriorityBadge priority={task.priority} />
                    </View>

                    <View style={styles.focusCardMeta}>
                      <Clock size={12} color={colors.warning} strokeWidth={2} />
                      <Text style={styles.focusDueText}>
                        {formatDisplayDeadline(task.deadline)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Filter Tabs Bar */}
            <View style={styles.filterSection}>
              <View style={styles.filterTabs}>
                {(['today', 'all', 'upcoming', 'completed'] as FilterTab[]).map(
                  (tab) => {
                    const isSelected = activeTab === tab;
                    const labels: Record<FilterTab, string> = {
                      today: 'Today',
                      all: 'All',
                      upcoming: 'Upcoming',
                      completed: 'Done',
                    };

                    return (
                      <TouchableOpacity
                        key={tab}
                        style={[
                          styles.filterTab,
                          isSelected && styles.activeFilterTab,
                        ]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.filterTabText,
                            isSelected && styles.activeFilterTabText,
                          ]}
                        >
                          {labels[tab]}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>

            {/* Section Heading */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab.toUpperCase()}
              </Text>
              <Text style={styles.sectionCount}>
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              title={
                activeTab === 'completed'
                  ? 'No completed tasks yet'
                  : 'No tasks scheduled'
              }
              description={
                activeTab === 'completed'
                  ? 'Complete tasks to track your productivity accomplishments here.'
                  : 'Add a new task to stay organized and prioritize what matters.'
              }
              actionLabel={activeTab !== 'completed' ? 'Create Task' : undefined}
              onAction={() => navigation.navigate('AddTask')}
            />
          )
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Plus size={24} color={colors.primaryText} strokeWidth={2.4} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerArea: {
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingSub: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 31,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedText,
    marginTop: 4,
  },
  avatarButton: {
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    padding: 2,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 22,
  },
  summaryCount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryText,
    marginTop: 2,
    marginBottom: 14,
  },
  summarySubrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryStatText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.borderLight,
    marginHorizontal: 16,
  },
  focusSection: {
    marginBottom: 22,
  },
  focusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  focusLabelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  focusLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
    letterSpacing: 0.8,
  },
  focusCountText: {
    fontSize: 12,
    color: colors.mutedText,
  },
  focusCard: {
    backgroundColor: colors.elevatedSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
    marginBottom: 8,
  },
  focusCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  focusCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  focusCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  focusDueText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 18,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeFilterTab: {
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  activeFilterTabText: {
    color: colors.text,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.mutedText,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});
