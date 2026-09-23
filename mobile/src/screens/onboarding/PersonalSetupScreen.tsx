import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Check, Link2, ImagePlus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { useAuth } from '../../store/authStore';
import { UserAvatar, AVATAR_MALE, AVATAR_FEMALE } from '../../components/UserAvatar';

interface PersonalSetupScreenProps {
  navigation: any;
}

const FOCUS_CATEGORIES = ['Work', 'Study', 'Personal', 'Other'];

export const PersonalSetupScreen: React.FC<PersonalSetupScreenProps> = ({
  navigation,
}) => {
  const { user, updateUserName, setFocusArea, completeOnboarding, setAvatar } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [selectedFocus, setSelectedFocus] = useState('Work');
  const [selectedAvatar, setSelectedAvatar] = useState('male');
  const [customLocalUri, setCustomLocalUri] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your device photos to choose a custom profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setCustomLocalUri(uri);
        setSelectedAvatar(uri);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Could not open media library: ' + (err.message || 'Unknown error'));
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      if (displayName.trim()) {
        updateUserName(displayName.trim());
      }
      await setFocusArea(selectedFocus);
      if (selectedAvatar === 'custom' && customUrl.trim()) {
        await setAvatar(customUrl.trim());
      } else {
        await setAvatar(selectedAvatar);
      }
      await completeOnboarding();
      navigation.replace('App');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepLabel}>STEP 03 OF 03</Text>
            <Text style={styles.title}>You're almost ready</Text>
            <Text style={styles.subtitle}>
              Customize your workspace to fit your workflow.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Display Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>What should we call you?</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.mutedText}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>

            {/* Avatar Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Choose your avatar</Text>
              <View style={styles.avatarRow}>
                {/* Male Avatar */}
                <TouchableOpacity
                  style={[
                    styles.avatarCard,
                    selectedAvatar === 'male' && styles.avatarCardActive,
                  ]}
                  onPress={() => setSelectedAvatar('male')}
                  activeOpacity={0.7}
                >
                  <Image source={AVATAR_MALE} style={styles.avatarPreview} />
                  <Text
                    style={[
                      styles.avatarLabel,
                      selectedAvatar === 'male' && styles.avatarLabelActive,
                    ]}
                  >
                    Male
                  </Text>
                  {selectedAvatar === 'male' && (
                    <View style={styles.activeCheck}>
                      <Check size={10} color={colors.primaryText} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Female Avatar */}
                <TouchableOpacity
                  style={[
                    styles.avatarCard,
                    selectedAvatar === 'female' && styles.avatarCardActive,
                  ]}
                  onPress={() => setSelectedAvatar('female')}
                  activeOpacity={0.7}
                >
                  <Image source={AVATAR_FEMALE} style={styles.avatarPreview} />
                  <Text
                    style={[
                      styles.avatarLabel,
                      selectedAvatar === 'female' && styles.avatarLabelActive,
                    ]}
                  >
                    Female
                  </Text>
                  {selectedAvatar === 'female' && (
                    <View style={styles.activeCheck}>
                      <Check size={10} color={colors.primaryText} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Initials Avatar */}
                <TouchableOpacity
                  style={[
                    styles.avatarCard,
                    selectedAvatar === 'initials' && styles.avatarCardActive,
                  ]}
                  onPress={() => setSelectedAvatar('initials')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatarPreview, styles.initialsPreview]}>
                    <Text style={styles.initialsText}>
                      {displayName ? displayName.slice(0, 2).toUpperCase() : 'ME'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.avatarLabel,
                      selectedAvatar === 'initials' && styles.avatarLabelActive,
                    ]}
                  >
                    Initials
                  </Text>
                  {selectedAvatar === 'initials' && (
                    <View style={styles.activeCheck}>
                      <Check size={10} color={colors.primaryText} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Custom Photo / Device Gallery Card */}
                <TouchableOpacity
                  style={[
                    styles.avatarCard,
                    (selectedAvatar === customLocalUri && customLocalUri !== null) && styles.avatarCardActive,
                  ]}
                  onPress={() => {
                    if (customLocalUri) {
                      setSelectedAvatar(customLocalUri);
                    } else {
                      handlePickFromGallery();
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {customLocalUri ? (
                    <Image source={{ uri: customLocalUri }} style={styles.avatarPreview} />
                  ) : (
                    <View style={[styles.avatarPreview, styles.customPreview]}>
                      <ImagePlus size={20} color={colors.text} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.avatarLabel,
                      (selectedAvatar === customLocalUri && customLocalUri !== null) && styles.avatarLabelActive,
                    ]}
                  >
                    Photo
                  </Text>
                  {selectedAvatar === customLocalUri && customLocalUri !== null && (
                    <View style={styles.activeCheck}>
                      <Check size={10} color={colors.primaryText} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Browse Media Button */}
              <TouchableOpacity
                style={styles.onboardingBrowseBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
              >
                <ImagePlus size={16} color={colors.primaryText} strokeWidth={2.2} />
                <Text style={styles.onboardingBrowseText}>
                  {customLocalUri ? 'Choose Different Photo from Gallery' : 'Browse Photos from Device Gallery'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Focus Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>What are you focusing on?</Text>
              <View style={styles.pillsContainer}>
                {FOCUS_CATEGORIES.map((category) => {
                  const isSelected = selectedFocus === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryPill,
                        isSelected && styles.selectedCategoryPill,
                      ]}
                      onPress={() => setSelectedFocus(category)}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <Check size={14} color={colors.primaryText} strokeWidth={2.5} />
                      )}
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected && styles.selectedCategoryText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleFinish}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              <Text style={styles.continueButtonText}>
                {isSubmitting ? 'Setting up...' : 'Go to Workspace'}
              </Text>
              <ArrowRight size={18} color={colors.primaryText} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  header: {
    marginBottom: 36,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primarySoft,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.secondaryText,
    lineHeight: 22,
  },
  form: {
    flex: 1,
    gap: 28,
  },
  inputGroup: {},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCategoryPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  selectedCategoryText: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  bottomArea: {
    paddingTop: 32,
  },
  continueButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  continueButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  avatarCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  avatarCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceHighlight,
  },
  avatarPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  initialsPreview: {
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  initialsText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  customPreview: {
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  avatarLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  activeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customInputContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  customLivePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  onboardingBrowseBtn: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  onboardingBrowseText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
