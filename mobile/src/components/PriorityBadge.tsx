import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TaskPriority } from '../types/task';
import { colors } from '../theme/colors';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showDotOnly?: boolean;
  size?: 'small' | 'medium';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showDotOnly = false,
  size = 'small',
}) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return {
          label: 'High',
          color: colors.danger,
          bg: colors.dangerSoft,
        };
      case 'medium':
        return {
          label: 'Medium',
          color: colors.warning,
          bg: colors.warningSoft,
        };
      case 'low':
      default:
        return {
          label: 'Low',
          color: colors.success,
          bg: colors.successSoft,
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <View style={[styles.container, !showDotOnly && styles.badgePill]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      {!showDotOnly && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: 'transparent',
    paddingVertical: 2,
    paddingRight: 6,
    borderRadius: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
