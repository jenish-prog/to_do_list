import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { FeaturePreviewScreen } from '../screens/onboarding/FeaturePreviewScreen';
import { PersonalSetupScreen } from '../screens/onboarding/PersonalSetupScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { AppNavigator } from './AppNavigator';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  FeaturePreview: undefined;
  Login: undefined;
  Register: undefined;
  PersonalSetup: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="FeaturePreview"
        component={FeaturePreviewScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PersonalSetup"
        component={PersonalSetupScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="App"
        component={AppNavigator}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};
