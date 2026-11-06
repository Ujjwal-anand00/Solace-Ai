import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../constants/colors';
import { triggerHaptic } from '../../../utils/haptics';

interface ProfileMenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
  destructive?: boolean;
}

export const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
  destructive = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        triggerHaptic.selection();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, destructive && styles.destructiveIconBox]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>

      <View style={styles.textBox}>
        <Text style={[styles.title, destructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {badge && (
        <View style={styles.badgeBox}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      <Text style={styles.arrowText}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIconBox: {
    backgroundColor: '#FFE4E6',
  },
  iconText: {
    fontSize: 16,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  destructiveText: {
    color: '#E11D48',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeBox: {
    backgroundColor: colors.lavender,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.sageDark,
  },
  arrowText: {
    fontSize: 18,
    color: colors.textMuted,
  },
});

