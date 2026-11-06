import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../constants/colors';
import { AppAvatar } from '../../../components/ui';
import { triggerHaptic } from '../../../utils/haptics';

interface ProfileHeaderProps {
  name: string;
  preferredName?: string;
  email: string;
  avatarUrl?: string;
  memberSince?: string;
  onEditPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  preferredName,
  email,
  memberSince,
  onEditPress,
}) => {
  const displayName = preferredName || name;
  const yearCreated = memberSince ? new Date(memberSince).getFullYear() : '2026';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <AppAvatar
          name={displayName}
          size="lg"
          backgroundColor={colors.sageLight}
          textColor={colors.sageDark}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.memberTag}>Sanctuary Member since {yearCreated}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => {
          triggerHaptic.light();
          onEditPress();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.editBtnText}>Edit Profile ✎</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  memberTag: {
    fontSize: 11,
    color: colors.sageDark,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: colors.cream,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

