import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Briefcase,
  Camera,
  Check,
  X,
  Link2,
  ImagePlus,
  Bell,
  BellRing,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../store/authStore';
import { useTasks } from '../store/taskStore';
import { UserAvatar, AVATAR_MALE, AVATAR_FEMALE } from '../components/UserAvatar';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendTestNotification,
} from '../services/notificationService';
import { colors } from '../theme/colors';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, focusArea, avatar, setAvatar, logout } = useAuth();
  const { tasks } = useTasks();

  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const [notificationStatus, setNotificationStatus] = useState<string>('undetermined');
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setNotificationStatus(status);
    } catch {
      setNotificationStatus('undetermined');
    }
  };

  const handleToggleOrRequestPermission = async () => {
    try {
      const granted = await requestNotificationPermission();
      await checkPermissions();
      if (granted) {
        Alert.alert('Notifications Enabled', 'You will now receive timely task reminders on your device.');
      } else {
        Alert.alert(
          'Permission Needed',
          'Notification permissions are currently denied. Would you like to open system settings to enable them?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update notification settings');
    }
  };

  const handleSendTestNotification = async () => {
    try {
      setIsTestingNotification(true);
      const sent = await sendTestNotification();
      if (sent) {
        Alert.alert('Test Sent', 'A task notification reminder banner was sent to your device!');
      } else {
        Alert.alert(
          'Notifications Not Enabled',
          'Please allow notifications for Taskly in your device settings to receive reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send test reminder');
    } finally {
      setIsTestingNotification(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your workspace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const handleSelectAvatar = async (type: string) => {
    await setAvatar(type);
    setIsAvatarModalVisible(false);
    setShowCustomInput(false);
  };

  const handlePickFromGallery = async () => {
    try {
      setIsPickingImage(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your device photos to select a profile image.'
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
        const localUri = result.assets[0].uri;
        await setAvatar(localUri);
        setIsAvatarModalVisible(false);
        setShowCustomInput(false);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Unable to pick image: ' + (err.message || 'Unknown error'));
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsPickingImage(true);
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to capture a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        await setAvatar(localUri);
        setIsAvatarModalVisible(false);
        setShowCustomInput(false);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Unable to take photo: ' + (err.message || 'Unknown error'));
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleApplyCustomUrl = async () => {
    if (!customUrlInput.trim()) {
      Alert.alert('Validation', 'Please paste a valid image link');
      return;
    }
    const cleanUrl = customUrlInput.trim();
    await setAvatar(cleanUrl);
    setCustomUrlInput('');
    setIsAvatarModalVisible(false);
    setShowCustomInput(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* User Card with Avatar */}
        <View style={styles.userCard}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            activeOpacity={0.75}
            onPress={() => setIsAvatarModalVisible(true)}
          >
            <UserAvatar avatar={avatar} name={user?.name} size={64} />
            <View style={styles.cameraIconBadge}>
              <Camera size={13} color={colors.primaryText} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Productive User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <TouchableOpacity
              style={styles.changeAvatarBtn}
              onPress={() => setIsAvatarModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.changeAvatarText}>Change Avatar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Focus Area Pill */}
        {Boolean(focusArea) && (
          <View style={styles.focusPillCard}>
            <View style={styles.focusPillIcon}>
              <Briefcase size={16} color={colors.text} strokeWidth={2} />
            </View>
            <View style={styles.focusPillContent}>
              <Text style={styles.focusPillLabel}>CURRENT FOCUS</Text>
              <Text style={styles.focusPillValue}>{focusArea}</Text>
            </View>
          </View>
        )}

        {/* Productivity Stats Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>PRODUCTIVITY METRICS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <ListTodo size={18} color={colors.text} strokeWidth={2} />
              <Text style={styles.statValue}>{totalTasks}</Text>
              <Text style={styles.statName}>Total Tasks</Text>
            </View>

            <View style={styles.statBox}>
              <CheckCircle2 size={18} color={colors.success} strokeWidth={2} />
              <Text style={styles.statValue}>{completedTasks}</Text>
              <Text style={styles.statName}>Completed</Text>
            </View>

            <View style={styles.statBox}>
              <TrendingUp size={18} color={colors.warning} strokeWidth={2} />
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statName}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* Notifications & Reminders Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>NOTIFICATIONS & REMINDERS</Text>
          <View style={styles.notificationCard}>
            <View style={styles.notifHeaderRow}>
              <View style={styles.notifIconWrap}>
                <Bell size={18} color={colors.text} strokeWidth={2} />
              </View>
              <View style={styles.notifHeaderTextWrap}>
                <Text style={styles.notifTitle}>Push Reminders</Text>
                <Text style={styles.notifDescription}>
                  Receive alerts and banners before scheduled tasks & deadlines
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  notificationStatus === 'granted' ? styles.statusBadgeActive : styles.statusBadgeInactive,
                ]}
              >
                {notificationStatus === 'granted' ? (
                  <ShieldCheck size={12} color={colors.success} strokeWidth={2.5} />
                ) : (
                  <AlertCircle size={12} color={colors.warning} strokeWidth={2.5} />
                )}
                <Text
                  style={[
                    styles.statusBadgeText,
                    notificationStatus === 'granted' ? styles.statusActiveText : styles.statusInactiveText,
                  ]}
                >
                  {notificationStatus === 'granted' ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>

            <View style={styles.notifActionsRow}>
              {notificationStatus === 'granted' ? (
                <>
                  <TouchableOpacity
                    style={styles.testNotifBtn}
                    onPress={handleSendTestNotification}
                    activeOpacity={0.8}
                    disabled={isTestingNotification}
                  >
                    <BellRing size={14} color={colors.text} strokeWidth={2} />
                    <Text style={styles.testNotifBtnText}>
                      {isTestingNotification ? 'Sending...' : 'Test Reminder Alert'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.openSettingsBtn}
                    onPress={() => Linking.openSettings()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.openSettingsBtnText}>System Settings</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.enableNotifBtn}
                  onPress={handleToggleOrRequestPermission}
                  activeOpacity={0.8}
                >
                  <ShieldCheck size={16} color={colors.primaryText} strokeWidth={2.5} />
                  <Text style={styles.enableNotifBtnText}>Enable Device Reminders</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={18} color={colors.danger} strokeWidth={2} />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersionText}>Taskly v1.0.0 · Minimalist Productivity</Text>
        </View>
      </ScrollView>

      {/* Avatar Selection Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Avatar</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsAvatarModalVisible(false);
                  setShowCustomInput(false);
                }}
                style={styles.modalCloseBtn}
              >
                <X size={18} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select a 3D avatar, take a photo, or choose any picture from your device gallery.
            </Text>

            {/* Local Media Pickers */}
            <View style={styles.mediaButtonsRow}>
              <TouchableOpacity
                style={styles.browseGalleryBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.8}
                disabled={isPickingImage}
              >
                <ImagePlus size={18} color={colors.primaryText} strokeWidth={2.4} />
                <Text style={styles.browseGalleryText}>
                  {isPickingImage ? 'Opening Gallery...' : 'Browse from Gallery'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.takePhotoBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
                disabled={isPickingImage}
              >
                <Camera size={18} color={colors.text} strokeWidth={2} />
                <Text style={styles.takePhotoText}>Take Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CHOOSE PRESET</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Avatar Options Grid */}
            <View style={styles.avatarGrid}>
              {/* Option 1: Male Avatar */}
              <TouchableOpacity
                style={[
                  styles.avatarOptionCard,
                  avatar === 'male' && styles.selectedAvatarOption,
                ]}
                onPress={() => handleSelectAvatar('male')}
                activeOpacity={0.7}
              >
                <Image source={AVATAR_MALE} style={styles.avatarThumb} />
                <Text style={styles.avatarOptionLabel}>Male</Text>
                {avatar === 'male' && (
                  <View style={styles.optionCheckBadge}>
                    <Check size={11} color={colors.primaryText} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Option 2: Female Avatar */}
              <TouchableOpacity
                style={[
                  styles.avatarOptionCard,
                  avatar === 'female' && styles.selectedAvatarOption,
                ]}
                onPress={() => handleSelectAvatar('female')}
                activeOpacity={0.7}
              >
                <Image source={AVATAR_FEMALE} style={styles.avatarThumb} />
                <Text style={styles.avatarOptionLabel}>Female</Text>
                {avatar === 'female' && (
                  <View style={styles.optionCheckBadge}>
                    <Check size={11} color={colors.primaryText} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Option 3: Initials */}
              <TouchableOpacity
                style={[
                  styles.avatarOptionCard,
                  avatar === 'initials' && styles.selectedAvatarOption,
                ]}
                onPress={() => handleSelectAvatar('initials')}
                activeOpacity={0.7}
              >
                <View style={styles.initialsThumb}>
                  <Text style={styles.initialsThumbText}>
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </Text>
                </View>
                <Text style={styles.avatarOptionLabel}>Initials</Text>
                {avatar === 'initials' && (
                  <View style={styles.optionCheckBadge}>
                    <Check size={11} color={colors.primaryText} strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Custom Image Option Accordion / Input */}
            {!showCustomInput ? (
              <TouchableOpacity
                style={styles.customImageToggle}
                onPress={() => setShowCustomInput(true)}
                activeOpacity={0.7}
              >
                <Link2 size={16} color={colors.secondaryText} />
                <Text style={styles.customImageToggleText}>
                  Use Custom Photo Link (URL)
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.customInputArea}>
                <Text style={styles.customInputLabel}>Image URL / Web Link</Text>
                <TextInput
                  style={styles.customUrlInput}
                  placeholder="https://example.com/my-photo.jpg"
                  placeholderTextColor={colors.mutedText}
                  value={customUrlInput}
                  onChangeText={setCustomUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.applyCustomBtn}
                  onPress={handleApplyCustomUrl}
                  activeOpacity={0.85}
                >
                  <Text style={styles.applyCustomBtnText}>Apply Photo Link</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  avatarTouchable: {
    position: 'relative',
    marginRight: 14,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 6,
  },
  changeAvatarBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  changeAvatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  focusPillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 24,
  },
  focusPillIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  focusPillContent: {
    flex: 1,
  },
  focusPillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 0.8,
  },
  focusPillValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondaryText,
    textAlign: 'center',
  },
  actionSection: {
    marginTop: 10,
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  appInfo: {
    alignItems: 'center',
  },
  appVersionText: {
    fontSize: 12,
    color: colors.mutedText,
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  avatarOptionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.elevatedSurface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    position: 'relative',
  },
  selectedAvatarOption: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceHighlight,
  },
  avatarThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  initialsThumb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initialsThumbText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  avatarOptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  optionCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customImageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customImageToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  customInputArea: {
    backgroundColor: colors.elevatedSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
  },
  customInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customUrlInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  applyCustomBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyCustomBtnText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  mediaButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  browseGalleryBtn: {
    flex: 1.2,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseGalleryText: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  takePhotoBtn: {
    flex: 0.9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  takePhotoText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.mutedText,
    letterSpacing: 0.8,
  },
  /* Notification Settings Card */
  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifHeaderTextWrap: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  notifDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  statusBadgeInactive: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusActiveText: {
    color: colors.success,
  },
  statusInactiveText: {
    color: colors.warning,
  },
  notifActionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  testNotifBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 10,
    borderRadius: 10,
  },
  testNotifBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  openSettingsBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevatedSurface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 10,
  },
  openSettingsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  enableNotifBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  enableNotifBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryText,
  },
});

