import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useTheme } from '../../src/hooks/useTheme';

export default function AppearanceScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useTheme();

  const themes: Array<{ id: 'system' | 'light' | 'dark'; label: string; desc: string }> = [
    {
      id: 'system',
      label: 'System Match',
      desc: 'Matches your device operating system theme automatically.',
    },
    {
      id: 'light',
      label: 'Warm Linen (Light)',
      desc: 'Gentle cream and sage greens designed to feel like morning sunlight.',
    },
    {
      id: 'dark',
      label: 'Quiet Evening (Dark)',
      desc: 'Deep muted tones designed for evening rest and reduced eye fatigue.',
    },
  ];

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
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Visual Theme</Text>
        <Text style={styles.sectionSubtitle}>
          Select your sanctuary ambience. Changes are instantly applied across Solace AI.
        </Text>

        <View style={styles.list}>
          {themes.map((t) => {
            const isSelected = themeMode === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => {
                  triggerHaptic.selection();
                  setThemeMode(t.id);
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                    {t.label}
                  </Text>
                  <Text style={styles.radio}>{isSelected ? '◉' : '○'}</Text>
                </View>
                <Text style={styles.cardDesc}>{t.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  list: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardSelected: {
    backgroundColor: '#F0F5F1',
    borderColor: colors.sage,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardTitleSelected: {
    color: colors.sageDark,
  },
  radio: {
    fontSize: 16,
    color: colors.sageDark,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

