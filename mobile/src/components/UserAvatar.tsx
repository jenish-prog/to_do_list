import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export const AVATAR_MALE = require('../assets/avatars/avatar_male.jpg');
export const AVATAR_FEMALE = require('../assets/avatars/avatar_female.jpg');

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  size?: number;
  style?: any;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = 48,
  style,
}) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = () => {
    if (!name || !name.trim()) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  };

  const borderRadius = size / 2;

  // Determine avatar image source
  if (!hasError && avatar && avatar !== 'initials') {
    let source: any = null;
    if (avatar === 'male') {
      source = AVATAR_MALE;
    } else if (avatar === 'female') {
      source = AVATAR_FEMALE;
    } else {
      source = { uri: avatar };
    }

    if (source) {
      return (
        <Image
          source={source}
          style={[
            {
              width: size,
              height: size,
              borderRadius,
              backgroundColor: colors.surfaceHighlight,
              borderWidth: 1.5,
              borderColor: colors.borderLight,
            },
            style,
          ]}
          onError={() => setHasError(true)}
          resizeMode="cover"
        />
      );
    }
  }

  // Fallback: Initials Avatar
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: colors.surfaceHighlight,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: colors.borderLight,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: colors.text,
          fontSize: Math.max(12, Math.round(size * 0.38)),
          fontWeight: '700',
          letterSpacing: 0.5,
        }}
      >
        {getInitials()}
      </Text>
    </View>
  );
};
