import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, SlidersHorizontal, Plus } from 'lucide-react-native';
import { useTasks } from '../../store/taskStore';
import { TaskCard } from '../../components/TaskCard';
import { EmptyState } from '../../components/EmptyState';
import { TaskPriority } from '../../types/task';
import { colors } from '../../theme/colors';

interface TasksScreenProps {
  navigation: any;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ navigation }) => {
  const {
    tasks,
    isLoading,
    isRefreshing,
    fetchTasks,
    toggleTaskStatus,
    deleteTask,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        !searchQuery.trim() ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        selectedPriority === 'all' || task.priority === selectedPriority;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, selectedPriority]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Tasks</Text>
        <Text style={styles.subtitle}>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={colors.mutedText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={15} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Priority Filter Chips */}
      <View style={styles.filterRow}>
        {(['all', 'high', 'medium', 'low'] as const).map((p) => {
          const isSelected = selectedPriority === p;
          const labels = {
            all: 'All Priorities',
            high: 'High',
            medium: 'Medium',
            low: 'Low',
          };

          return (
            <TouchableOpacity
              key={p}
              style={[styles.filterChip, isSelected && styles.activeFilterChip]}
              onPress={() => setSelectedPriority(p)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.activeFilterChipText,
                ]}
              >
                {labels[p]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
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
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              title={
                searchQuery || selectedPriority !== 'all'
                  ? 'No matching tasks'
                  : 'Your workspace is empty'
              }
              description={
                searchQuery || selectedPriority !== 'all'
                  ? 'Try changing your search keywords or priority filter.'
                  : 'Start planning your day by adding your first task.'
              }
              actionLabel="Create Task"
              onAction={() => navigation.navigate('AddTask')}
            />
          )
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearBtn: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterChip: {
    backgroundColor: colors.elevatedSurface,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  activeFilterChipText: {
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
});
