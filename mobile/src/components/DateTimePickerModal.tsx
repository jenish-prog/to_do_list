import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';

interface DateTimePickerModalProps {
  visible: boolean;
  mode: 'date' | 'time' | 'datetime';
  value: Date;
  title?: string;
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  mode,
  value,
  title,
  minimumDate,
  onConfirm,
  onCancel,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(value || new Date());
  // For Android datetime flow: first 'date', then 'time'
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');

  if (!visible) return null;

  // ANDROID HANDLING:
  if (Platform.OS === 'android') {
    if (mode === 'datetime') {
      if (androidStep === 'date') {
        return (
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="default"
            minimumDate={minimumDate}
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              if (event.type === 'dismissed' || !selectedDate) {
                onCancel();
                return;
              }
              setCurrentDate(selectedDate);
              setAndroidStep('time');
            }}
          />
        );
      } else {
        // time step
        return (
          <DateTimePicker
            value={currentDate}
            mode="time"
            display="default"
            is24Hour={false}
            minuteInterval={1}
            onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
              setAndroidStep('date');
              if (event.type === 'dismissed' || !selectedTime) {
                onCancel();
                return;
              }
              const finalDate = new Date(currentDate);
              finalDate.setHours(selectedTime.getHours());
              finalDate.setMinutes(selectedTime.getMinutes());
              finalDate.setSeconds(0);
              onConfirm(finalDate);
            }}
          />
        );
      }
    }

    // Direct mode ('date' or 'time')
    return (
      <DateTimePicker
        value={currentDate}
        mode={mode}
        display="default"
        minimumDate={mode === 'date' ? minimumDate : undefined}
        is24Hour={false}
        minuteInterval={1}
        onChange={(event: DateTimePickerEvent, selected?: Date) => {
          if (event.type === 'dismissed' || !selected) {
            onCancel();
            return;
          }
          onConfirm(selected);
        }}
      />
    );
  }

  // IOS HANDLING (Modal with styled sheet):
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.iosOverlay}>
        <TouchableOpacity
          style={styles.iosBackdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={styles.iosSheet}>
          <View style={styles.iosHeader}>
            <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={styles.headerBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {title || (mode === 'date' ? 'Select Date' : mode === 'time' ? 'Select Time' : 'Select Date & Time')}
            </Text>

            <TouchableOpacity
              onPress={() => onConfirm(currentDate)}
              activeOpacity={0.7}
              style={styles.headerBtn}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={currentDate}
              mode={mode === 'datetime' ? 'datetime' : mode}
              display="spinner"
              minimumDate={minimumDate}
              is24Hour={false}
              minuteInterval={1}
              textColor={colors.text}
              themeVariant="dark"
              onChange={(_, date) => {
                if (date) setCurrentDate(date);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  iosBackdrop: {
    flex: 1,
  },
  iosSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingBottom: 28,
  },
  iosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 15,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
