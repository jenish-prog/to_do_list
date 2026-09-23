import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ListTodo, Calendar as CalendarIcon, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/tasks/HomeScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { CalendarScreen } from '../screens/tasks/CalendarScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AddTaskScreen } from '../screens/tasks/AddTaskScreen';
import { TaskDetailsScreen } from '../screens/tasks/TaskDetailsScreen';
import { colors } from '../theme/colors';

export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  AddTask: undefined;
  TaskDetails: { taskId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconStroke = focused ? 2.4 : 1.8;
          switch (route.name) {
            case 'Home':
              return <Home size={22} color={color} strokeWidth={iconStroke} />;
            case 'Tasks':
              return <ListTodo size={22} color={color} strokeWidth={iconStroke} />;
            case 'Calendar':
              return <CalendarIcon size={22} color={color} strokeWidth={iconStroke} />;
            case 'Profile':
              return <User size={22} color={color} strokeWidth={iconStroke} />;
            default:
              return null;
          }
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
    paddingTop: 10,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
