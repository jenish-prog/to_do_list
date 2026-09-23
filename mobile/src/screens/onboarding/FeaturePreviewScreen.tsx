import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Clock, ArrowRight, Zap, Flame } from 'lucide-react-native';
import { colors } from '../../theme/colors';

interface FeaturePreviewScreenProps {
  navigation: any;
}

export const FeaturePreviewScreen: React.FC<FeaturePreviewScreenProps> = ({
  navigation,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide === 0) {
      setCurrentSlide(1);
    } else {
      navigation.navigate('Register');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header with Skip */}
      <View style={styles.topHeader}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>0{currentSlide + 1} / 02</Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Interactive Preview Card Area */}
      <View style={styles.previewContainer}>
        {currentSlide === 0 ? (
          /* Slide 1 Preview: Realistic Task Cards */
          <View style={styles.previewMockup}>
            <View style={styles.miniHeader}>
              <Text style={styles.miniHeaderTitle}>TODAY</Text>
              <Text style={styles.miniHeaderCount}>2 tasks</Text>
            </View>

            {/* Task 1 */}
            <View style={styles.miniCard}>
              <View style={[styles.miniCheck, styles.checkedCircle]}>
                <Check size={11} color={colors.white} strokeWidth={3} />
              </View>
              <View style={styles.miniContent}>
                <Text style={[styles.miniTitle, styles.struckTitle]}>
                  Review system design
                </Text>
                <View style={styles.miniMeta}>
                  <View style={[styles.dot, { backgroundColor: colors.success }]} />
                  <Text style={styles.miniPriority}>Low</Text>
                  <Text style={styles.miniMetaDot}>•</Text>
                  <Text style={styles.miniTime}>Completed</Text>
                </View>
              </View>
            </View>

            {/* Task 2 */}
            <View style={[styles.miniCard, styles.activeMiniCard]}>
              <View style={styles.miniCheck} />
              <View style={styles.miniContent}>
                <Text style={styles.miniTitle}>Submit React Native assignment</Text>
                <View style={styles.miniMeta}>
                  <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                  <Text style={[styles.miniPriority, { color: colors.danger }]}>High</Text>
                  <Text style={styles.miniMetaDot}>•</Text>
                  <Clock size={11} color={colors.secondaryText} />
                  <Text style={styles.miniTime}>Due 6:00 PM</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Slide 2 Preview: Urgency Focus Engine */
          <View style={styles.previewMockup}>
            <View style={styles.focusHeader}>
              <View style={styles.focusPill}>
                <Flame size={12} color={colors.warning} />
                <Text style={styles.focusPillText}>RECOMMENDED NEXT</Text>
              </View>
              <Text style={styles.scoreText}>Score 100</Text>
            </View>

            <View style={styles.focusCard}>
              <View style={styles.focusCardTop}>
                <Text style={styles.focusCardTitle}>Finalize authentication API</Text>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>HIGH</Text>
                </View>
              </View>
              <Text style={styles.focusCardDesc}>
                JWT verification with MongoDB database
              </Text>
              <View style={styles.focusMetaRow}>
                <Clock size={12} color={colors.warning} />
                <Text style={styles.focusDeadline}>Due today · in 2 hours</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Copy Section */}
      <View style={styles.copyContainer}>
        {currentSlide === 0 ? (
          <>
            <Text style={styles.featureTitle}>Know what matters.</Text>
            <Text style={styles.featureDescription}>
              Prioritize important tasks and never lose track of deadlines with clean, scannable cards.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.featureTitle}>Stay ahead of deadlines.</Text>
            <Text style={styles.featureDescription}>
              Intelligent priority and deadline scoring dynamically shows what needs your focus right now.
            </Text>
          </>
        )}
      </View>

      {/* Bottom Footer: Dots & Next */}
      <View style={styles.bottomBar}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          <View
            style={[
              styles.dotIndicator,
              currentSlide === 0 ? styles.activeDot : styles.inactiveDot,
            ]}
          />
          <View
            style={[
              styles.dotIndicator,
              currentSlide === 1 ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={styles.continueText}>
            {currentSlide === 0 ? 'Continue' : 'Get Started'}
          </Text>
          <ArrowRight size={16} color={colors.primaryText} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  stepIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: colors.secondaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  previewMockup: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
  },
  miniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  miniHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 0.8,
  },
  miniHeaderCount: {
    fontSize: 12,
    color: colors.mutedText,
  },
  miniCard: {
    backgroundColor: colors.elevatedSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeMiniCard: {
    borderColor: colors.borderLight,
    backgroundColor: colors.elevatedSurface,
  },
  miniCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: colors.mutedText,
    marginRight: 12,
  },
  checkedCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniContent: {
    flex: 1,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  struckTitle: {
    textDecorationLine: 'line-through',
    color: colors.mutedText,
  },
  miniMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  miniPriority: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  miniMetaDot: {
    color: colors.mutedText,
    marginHorizontal: 6,
    fontSize: 10,
  },
  miniTime: {
    fontSize: 11,
    color: colors.secondaryText,
    marginLeft: 3,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.warningSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  focusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
    letterSpacing: 0.5,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedText,
  },
  focusCard: {
    backgroundColor: colors.elevatedSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
  },
  focusCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  focusCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  badgePill: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePillText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '700',
  },
  focusCardDesc: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
    marginBottom: 10,
  },
  focusMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  focusDeadline: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  copyContainer: {
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 15,
    color: colors.secondaryText,
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotIndicator: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: colors.borderLight,
  },
  continueButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  continueText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
});
