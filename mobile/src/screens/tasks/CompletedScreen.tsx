import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../../store/taskStore';
import { TaskCard } from '../../components/TaskCard';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../theme/colors';

interface CompletedScreenProps {
  navigation: any;
}

export const CompletedScreen: React.FC<CompletedScreenProps> = ({ navigation }) => {
  const { tasks, isLoading, isRefreshing, fetchTasks, toggleTaskStatus, deleteTask } =
    useTasks();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Completed</Text>
          <Text style={styles.headerSubtitle}>
            {completedTasks.length} task{completedTasks.length === 1 ? '' : 's'} finished
          </Text>
        </View>

        {/* List */}
        {isLoading && !isRefreshing && tasks.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={completedTasks}
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
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchTasks(true)}
                tintColor={colors.primarySoft}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No completed tasks"
                description="When you finish tasks, they will appear here with completion timestamps."
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
