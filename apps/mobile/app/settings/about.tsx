import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';

export default function AboutScreen() {
  const router = useRouter();

  const handleOpenDoc = (title: string, desc: string) => {
    triggerHaptic.light();
    Alert.alert(title, desc);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Solace AI</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Brand Card */}
        <View style={styles.brandCard}>
          <Text style={styles.brandIcon}>🌿</Text>
          <Text style={styles.brandName}>Solace AI</Text>
          <Text style={styles.brandTagline}>Your Personal Sanctuary for Emotional Wellness</Text>
          <Text style={styles.versionText}>Version 1.0.0 (Build 2026.11)</Text>
        </View>

        {/* Narrative */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardText}>
            Solace AI is built on the belief that everyday mental well-being should be gentle,
            private, and judgment-free. By bringing together natural design, guided mindfulness,
            unhurried journaling, and empathetic AI companions, we help you cultivate emotional
            clarity and calm at your own pace.
          </Text>
        </View>

        {/* Legal & Licenses */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              handleOpenDoc(
                'Terms of Service',
                'Solace AI Terms of Service:\n\n1. Solace AI is provided for personal wellness reflection.\n2. Not intended for crisis intervention.\n3. Content and reflections remain your property.',
              )
            }
          >
            <Text style={styles.menuLabel}>Terms of Service</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              handleOpenDoc(
                'Privacy Policy',
                'Solace AI Privacy Policy:\n\n• Zero third-party ad trackers.\n• Private journal isolation by default.\n• Strict user-initiated AI analysis consent.',
              )
            }
          >
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomWidth: 0 }]}
            onPress={() =>
              handleOpenDoc(
                'Open Source Licenses',
                'Solace AI utilizes Expo, React Native, Mongoose, Zod, and TanStack Query under permissive open-source licenses.',
              )
            }
          >
            <Text style={styles.menuLabel}>Open Source Licenses</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyrightText}>
          © 2026 Solace AI Inc. All rights reserved. Crafted with care and peace.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: colors.sageDark,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  brandCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  brandIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.textMuted,
  },
  copyrightText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

