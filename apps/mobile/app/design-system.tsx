import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import {
  ScreenContainer,
  AppText,
  AppHeading,
  AppButton,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  IconButton,
  AppInput,
  PasswordInput,
  SearchInput,
  AppCard,
  ElevatedCard,
  SoftCard,
  GradientCard,
  AppAvatar,
  AppBadge,
  AppChip,
  AppDivider,
  AppProgressBar,
  AppIcon,
  LoadingIndicator,
  EmptyState,
  ErrorState,
  SectionHeader,
  BottomSheet,
} from '@/components/ui';
import { FadeInView, FloatingView } from '@/utils/animations';
import { PALETTE } from '@/theme/colors';

export default function DesignSystemScreen(): React.JSX.Element {
  const router = useRouter();
  const { isDark, themeMode, setThemeMode, colors } = useTheme();

  // Component Demo States
  const [buttonLoading, setButtonLoading] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>(['Mindfulness', 'Calm']);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('Secret123!');
  const [progress, setProgress] = useState(0.68);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const toggleChip = (name: string) => {
    setSelectedChips((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  return (
    <ScreenContainer scrollable showsVerticalScrollIndicator={false}>
      {/* Top Bar with Navigation & Theme Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <AppIcon name="arrowLeft" size="sm" color={colors.textPrimary} />
          <AppText variant="label" style={{ marginLeft: 6 }}>
            Back
          </AppText>
        </TouchableOpacity>

        {/* Theme Mode Selector Pills */}
        <View style={[styles.themePills, { backgroundColor: colors.surfaceSecondary }]}>
          <TouchableOpacity
            onPress={() => setThemeMode('light')}
            style={[
              styles.themePill,
              themeMode === 'light' && [
                styles.activeThemePill,
                { backgroundColor: colors.surface },
              ],
            ]}
          >
            <AppIcon
              name="sun"
              size="xs"
              color={themeMode === 'light' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setThemeMode('dark')}
            style={[
              styles.themePill,
              themeMode === 'dark' && [styles.activeThemePill, { backgroundColor: colors.surface }],
            ]}
          >
            <AppIcon
              name="moon"
              size="xs"
              color={themeMode === 'dark' ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setThemeMode('system')}
            style={[
              styles.themePill,
              themeMode === 'system' && [
                styles.activeThemePill,
                { backgroundColor: colors.surface },
              ],
            ]}
          >
            <AppText
              variant="caption"
              style={{
                color: themeMode === 'system' ? colors.primary : colors.textMuted,
                fontWeight: '600',
              }}
            >
              Auto
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Title */}
      <View style={styles.headerBlock}>
        <AppBadge label="Internal Preview" variant="mint" size="sm" style={{ marginBottom: 8 }} />
        <AppHeading level={1}>Solace Design System</AppHeading>
        <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: 4 }}>
          Comprehensive component library and visual tokens. Theme: {themeMode} (
          {isDark ? 'Dark' : 'Light'})
        </AppText>
      </View>

      <AppDivider marginVertical={20} />

      {/* 1. Color System */}
      <SectionHeader title="1. Color Palette" subtitle="Natural, warm and accessible tones" />
      <AppCard variant="soft" style={styles.sectionCard}>
        <AppText variant="label" style={styles.subheading}>
          Primary Palette
        </AppText>
        <View style={styles.swatchRow}>
          <ColorSwatch name="PRIMARY" hex={colors.primary} />
          <ColorSwatch name="PRIMARY_DARK" hex={colors.primaryDark} />
          <ColorSwatch name="PRIMARY_LIGHT" hex={colors.primaryLight} />
        </View>

        <AppText variant="label" style={[styles.subheading, { marginTop: 14 }]}>
          Backgrounds & Surfaces
        </AppText>
        <View style={styles.swatchRow}>
          <ColorSwatch name="BACKGROUND" hex={colors.background} withBorder />
          <ColorSwatch name="SURFACE" hex={colors.surface} withBorder />
          <ColorSwatch name="SURFACE_SEC" hex={colors.surfaceSecondary} withBorder />
        </View>

        <AppText variant="label" style={[styles.subheading, { marginTop: 14 }]}>
          Soft Pastel Accents
        </AppText>
        <View style={styles.swatchRow}>
          <ColorSwatch name="LAVENDER" hex={PALETTE.LAVENDER} />
          <ColorSwatch name="PEACH" hex={PALETTE.PEACH} />
          <ColorSwatch name="MINT" hex={PALETTE.MINT} />
          <ColorSwatch name="BUTTER" hex={PALETTE.BUTTER} />
        </View>

        <AppText variant="label" style={[styles.subheading, { marginTop: 14 }]}>
          Functional
        </AppText>
        <View style={styles.swatchRow}>
          <ColorSwatch name="SUCCESS" hex={colors.success} />
          <ColorSwatch name="WARNING" hex={colors.warning} />
          <ColorSwatch name="ERROR" hex={colors.error} />
          <ColorSwatch name="INFO" hex={colors.info} />
        </View>
      </AppCard>

      {/* 2. Typography System */}
      <SectionHeader
        title="2. Typography System"
        subtitle="Spacious, readable and elegant hierarchy"
      />
      <AppCard variant="default" style={styles.sectionCard}>
        <AppText variant="displayLarge">Display Large (34pt)</AppText>
        <AppText variant="displayMedium">Display Medium (28pt)</AppText>
        <AppText variant="h1">Heading 1 (24pt)</AppText>
        <AppText variant="h2">Heading 2 (20pt)</AppText>
        <AppText variant="h3">Heading 3 (18pt)</AppText>
        <AppText variant="bodyLarge" style={{ marginTop: 8 }}>
          Body Large (17pt): Gentle reflection nurtures clarity and emotional balance.
        </AppText>
        <AppText variant="bodyMedium">
          Body Medium (15pt): Your personal space to feel, heal and grow every day.
        </AppText>
        <AppText variant="bodySmall" color="textSecondary">
          Body Small (13pt): Secondary descriptions and informative wellness metadata.
        </AppText>
        <AppText variant="caption" color="textMuted">
          Caption (12pt): Timestamps, tiny helpers, and footnotes.
        </AppText>
      </AppCard>

      {/* 3. Buttons System */}
      <SectionHeader
        title="3. Buttons"
        subtitle="Variants, sizes, states, and haptic feedback"
        actionText={buttonLoading ? 'Stop loading' : 'Simulate loading'}
        onActionPress={() => setButtonLoading(!buttonLoading)}
      />
      <View style={styles.buttonStack}>
        <PrimaryButton
          title="Primary Action Button"
          leadingIcon="heart"
          loading={buttonLoading}
          fullWidth
          onPress={() => {}}
        />

        <SecondaryButton
          title="Secondary Action Button"
          trailingIcon="arrowRight"
          fullWidth
          onPress={() => {}}
        />

        <OutlineButton
          title="Outline Action Button"
          leadingIcon="sparkles"
          fullWidth
          onPress={() => {}}
        />

        <GhostButton title="Ghost Action Button" leadingIcon="smile" fullWidth onPress={() => {}} />

        <View style={styles.buttonRow}>
          <AppButton title="Small" size="sm" variant="primary" style={{ marginRight: 8 }} />
          <AppButton title="Medium" size="md" variant="secondary" style={{ marginRight: 8 }} />
          <AppButton title="Large" size="lg" variant="outline" style={{ marginRight: 8 }} />
          <IconButton icon="bell" size="md" />
        </View>

        <PrimaryButton title="Disabled Button State" disabled fullWidth />
      </View>

      {/* 4. Form Inputs */}
      <SectionHeader
        title="4. Inputs & Forms"
        subtitle="Accessible inputs with focus and validation states"
      />
      <AppCard variant="default" style={styles.sectionCard}>
        <AppInput
          label="Full Name"
          placeholder="e.g. Maya Lin"
          leadingIcon="user"
          value={inputValue}
          onChangeText={setInputValue}
          helperText="We use this to personalize your reflections."
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          leadingIcon="lock"
          value={passwordValue}
          onChangeText={setPasswordValue}
        />

        <SearchInput
          placeholder="Search meditations, moods or notes..."
          value={searchValue}
          onChangeText={setSearchValue}
        />

        <AppInput
          label="Email Address (Validation State)"
          value="invalid-email@"
          leadingIcon="mail"
          error="Please provide a valid email address."
        />

        <AppInput
          label="Disabled Field"
          value="Read-only account setting"
          leadingIcon="shield"
          disabled
        />
      </AppCard>

      {/* 5. Cards System */}
      <SectionHeader
        title="5. Cards System"
        subtitle="Default, elevated, soft and gradient cards"
      />
      <View style={styles.cardStack}>
        <AppCard variant="default" style={styles.cardItem}>
          <AppHeading level={3}>Default Card</AppHeading>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: 4 }}>
            Standard bordered surface with soft ambient card shadow.
          </AppText>
        </AppCard>

        <ElevatedCard style={styles.cardItem}>
          <AppHeading level={3}>Elevated Card</AppHeading>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: 4 }}>
            Floating elevated card for featured wellness insights and high priority cards.
          </AppText>
        </ElevatedCard>

        <SoftCard style={styles.cardItem}>
          <AppHeading level={3}>Soft Card</AppHeading>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: 4 }}>
            Tinted secondary surface for subtle grouping and section blocks.
          </AppText>
        </SoftCard>

        <GradientCard style={styles.cardItem}>
          <AppHeading level={3}>Gradient Card</AppHeading>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: 4 }}>
            Subtle organic gradient surface for calm, reflective moments.
          </AppText>
        </GradientCard>

        <AppCard variant="default" onPress={() => {}} style={styles.cardItem}>
          <View style={styles.pressableCardContent}>
            <View style={{ flex: 1 }}>
              <AppHeading level={3}>Interactive Pressable Card</AppHeading>
              <AppText variant="bodySmall" color="textSecondary">
                Tap me to experience subtle spring scale and haptic feedback.
              </AppText>
            </View>
            <AppIcon name="chevronRight" size="sm" color={colors.primary} />
          </View>
        </AppCard>
      </View>

      {/* 6. Badges & Chips */}
      <SectionHeader
        title="6. Badges & Chips"
        subtitle="Pills, emotion tags and interactive filters"
      />
      <AppCard variant="soft" style={styles.sectionCard}>
        <AppText variant="label" style={styles.subheading}>
          Badges
        </AppText>
        <View style={styles.flexWrapRow}>
          <AppBadge label="Primary" variant="primary" showDot style={styles.chipMargin} />
          <AppBadge label="Calm" variant="mint" icon="smile" style={styles.chipMargin} />
          <AppBadge label="Reflect" variant="lavender" icon="sparkles" style={styles.chipMargin} />
          <AppBadge label="Energy" variant="peach" icon="zap" style={styles.chipMargin} />
          <AppBadge label="Grounded" variant="butter" icon="feather" style={styles.chipMargin} />
          <AppBadge label="Active" variant="success" showDot style={styles.chipMargin} />
          <AppBadge label="Alert" variant="warning" showDot style={styles.chipMargin} />
          <AppBadge label="Urgent" variant="error" showDot style={styles.chipMargin} />
        </View>

        <AppText variant="label" style={[styles.subheading, { marginTop: 16 }]}>
          Interactive Chips
        </AppText>
        <View style={styles.flexWrapRow}>
          {['Mindfulness', 'Calm', 'Journaling', 'Breathing', 'Gratitude'].map((item) => (
            <AppChip
              key={item}
              label={item}
              selected={selectedChips.includes(item)}
              onPress={() => toggleChip(item)}
              icon="sparkles"
            />
          ))}
        </View>
      </AppCard>

      {/* 7. Avatars */}
      <SectionHeader title="7. Avatars" subtitle="Different dimensions and status indicators" />
      <AppCard variant="default" style={styles.sectionCard}>
        <View style={styles.avatarRow}>
          <AppAvatar size="xs" name="Solace" />
          <AppAvatar size="sm" name="Maya Lin" status="offline" />
          <AppAvatar size="md" name="Alex Rivera" status="calm" />
          <AppAvatar size="lg" name="Elena Rose" status="online" />
          <AppAvatar size="xl" name="Companion" status="busy" />
        </View>
      </AppCard>

      {/* 8. Progress & Loading */}
      <SectionHeader
        title="8. Progress & Loading"
        subtitle="Animated indicators with smooth progression"
        actionText="Randomize progress"
        onActionPress={() => setProgress(Number((Math.random() * 0.8 + 0.1).toFixed(2)))}
      />
      <AppCard variant="default" style={styles.sectionCard}>
        <View style={{ marginBottom: 16 }}>
          <View style={styles.progressLabelRow}>
            <AppText variant="label">Mindfulness Completion</AppText>
            <AppText variant="label" color="primary">
              {Math.round(progress * 100)}%
            </AppText>
          </View>
          <AppProgressBar progress={progress} height={10} />
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={styles.progressLabelRow}>
            <AppText variant="label">Calm Peach Progress</AppText>
            <AppText variant="label">{Math.round(progress * 100)}%</AppText>
          </View>
          <AppProgressBar progress={progress} height={6} color={PALETTE.PEACH_TEXT} />
        </View>

        <AppDivider marginVertical={12} />
        <LoadingIndicator size="small" message="Harmonizing companion thoughts..." />
      </AppCard>

      {/* 9. States & Feedback */}
      <SectionHeader title="9. Empty & Error States" subtitle="Calm, user-friendly feedback" />
      <AppCard variant="soft" style={[styles.sectionCard, { marginBottom: 12 }]}>
        <EmptyState
          icon="bookOpen"
          title="No reflections recorded yet"
          description="Take a gentle breath and start your first mindful journal entry today."
          actionTitle="Begin Reflection"
          onActionPress={() => {}}
        />
      </AppCard>

      <AppCard variant="default" style={styles.sectionCard}>
        <ErrorState
          title="Unable to reach sanctuary"
          message="We could not sync your entries. Please check your network connection."
          onRetry={() => {}}
        />
      </AppCard>

      {/* 10. Animations & Modal */}
      <SectionHeader
        title="10. Animations & Modal"
        subtitle="Subtle, performant Reanimated interactions"
      />
      <AppCard variant="default" style={styles.sectionCard}>
        <View style={styles.animationShowcase}>
          <FloatingView floatDistance={10}>
            <View
              style={[
                styles.floatingMascot,
                { backgroundColor: isDark ? colors.surfaceSecondary : colors.mint },
              ]}
            >
              <AppIcon name="sparkles" size="xl" color={colors.primary} />
            </View>
          </FloatingView>
          <AppText
            variant="bodySmall"
            align="center"
            color="textSecondary"
            style={{ marginTop: 12 }}
          >
            Gentle floating animation (FloatingView)
          </AppText>
        </View>

        <FadeInView delay={200} style={{ marginTop: 16 }}>
          <PrimaryButton
            title="Open Interactive Bottom Sheet"
            leadingIcon="sliders"
            fullWidth
            onPress={() => setBottomSheetVisible(true)}
          />
        </FadeInView>
      </AppCard>

      {/* Bottom Sheet Modal Demo */}
      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title="Wellness Preferences"
      >
        <AppText variant="bodyMedium" color="textSecondary" style={{ marginBottom: 16 }}>
          This bottom sheet component demonstrates accessible modal presentation, clean drag handle,
          and safe area padding.
        </AppText>

        <AppInput
          label="Companion Name"
          value="Solace"
          leadingIcon="heart"
          containerStyle={{ marginBottom: 16 }}
        />

        <PrimaryButton
          title="Save Preferences"
          fullWidth
          onPress={() => setBottomSheetVisible(false)}
        />
      </BottomSheet>
    </ScreenContainer>
  );
}

interface ColorSwatchProps {
  name: string;
  hex: string;
  withBorder?: boolean;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, hex, withBorder }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.swatchItem}>
      <View
        style={[
          styles.swatchCircle,
          { backgroundColor: hex },
          withBorder && { borderWidth: 1, borderColor: colors.border },
        ]}
      />
      <AppText variant="caption" style={styles.swatchText} numberOfLines={1}>
        {name}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 12,
  },
  themePills: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: 20,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeThemePill: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerBlock: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionCard: {
    marginBottom: 20,
  },
  subheading: {
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchItem: {
    alignItems: 'center',
    width: 68,
  },
  swatchCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 6,
  },
  swatchText: {
    fontSize: 9,
    textAlign: 'center',
  },
  buttonStack: {
    gap: 12,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardStack: {
    gap: 12,
    marginBottom: 20,
  },
  cardItem: {
    marginBottom: 2,
  },
  pressableCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipMargin: {
    marginRight: 8,
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  animationShowcase: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  floatingMascot: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
