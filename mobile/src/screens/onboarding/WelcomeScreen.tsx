import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Spacer */}
        <View style={styles.headerArea}>
          <View style={styles.iconWrapper}>
            <Sparkles size={28} color={colors.primarySoft} strokeWidth={2} />
          </View>
        </View>

        {/* Hero Copy */}
        <View style={styles.copyArea}>
          <Text style={styles.headline}>
            Get things done.{'\n'}Without the clutter.
          </Text>
          <Text style={styles.subtext}>
            Organize your tasks, deadlines and priorities in one simple workspace.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionArea}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FeaturePreview')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <ArrowRight size={18} color={colors.primaryText} strokeWidth={2.4} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerArea: {
    alignItems: 'flex-start',
    marginTop: 20,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyArea: {
    marginVertical: 'auto',
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
    lineHeight: 42,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: colors.secondaryText,
    lineHeight: 24,
    maxWidth: 320,
  },
  actionArea: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  signInLink: {
    color: colors.text,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
