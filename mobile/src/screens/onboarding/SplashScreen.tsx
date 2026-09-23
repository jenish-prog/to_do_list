import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { useAuth } from '../../store/authStore';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { user, token, hasCompletedOnboarding, isInitializing } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Elegant entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // After 1.3 seconds, route appropriately
    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        navigation.replace('Welcome');
      } else if (token && user) {
        navigation.replace('App');
      } else {
        navigation.replace('Login');
      }
    }, 1300);

    return () => clearTimeout(timer);
  }, [hasCompletedOnboarding, token, user, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Minimal geometric brand mark */}
        <View style={styles.logoOuter}>
          <View style={styles.logoInner} />
        </View>

        <Text style={styles.brandTitle}>TASKLY</Text>
        <Text style={styles.tagline}>Plan. Focus. Finish.</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: colors.primaryMuted,
  },
  logoInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: colors.secondaryText,
    letterSpacing: 1.5,
    fontWeight: '500',
  },
});
