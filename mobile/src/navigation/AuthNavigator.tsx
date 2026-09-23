import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { FeaturePreviewScreen } from '../screens/onboarding/FeaturePreviewScreen';
import { PersonalSetupScreen } from '../screens/onboarding/PersonalSetupScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { colors } from '../theme/colors';

export type AuthStackParamList = {
  Welcome: undefined;
  FeaturePreview: undefined;
  PersonalSetup: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  initialRouteName?: keyof AuthStackParamList;
}

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({
  initialRouteName = 'Login',
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="FeaturePreview" component={FeaturePreviewScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="PersonalSetup" component={PersonalSetupScreen} />
    </Stack.Navigator>
  );
};
