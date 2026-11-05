import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText, AppHeading, AppCard } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { INTENSITY_LEVELS } from '../types';

interface IntensitySliderProps {
  value: number;
  onChange: (val: number) => void;
}

export const IntensitySlider: React.FC<IntensitySliderProps> = ({ value, onChange }) => {
  const { colors, isDark } = useTheme();

  const handleSelect = (val: number) => {
    if (val !== value) {
      triggerHaptic.selection();
      onChange(val);
    }
  };

  const levelInfo = INTENSITY_LEVELS[value] || INTENSITY_LEVELS[5];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppHeading level={1} style={styles.title}>
          How strong is this feeling?
        </AppHeading>
        <AppText
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Tune in to your body and notice the intensity of this emotion right now.
        </AppText>
      </View>

      {/* Main Intensity Gauge Card */}
      <AppCard style={styles.gaugeCard}>
        <View style={styles.gaugeCenter}>
          <View
            style={[
              styles.gaugeCircle,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : colors.primaryLight,
                borderColor: colors.primary,
              },
            ]}
          >
            <AppHeading level="displayLarge" style={[styles.gaugeNumber, { color: colors.primaryDark }]}>
              {value}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              out of 10
            </AppText>
          </View>

          <View style={styles.levelDetails}>
            <AppHeading level={3} style={[styles.levelLabel, { color: colors.textPrimary }]}>
              {levelInfo.label}
            </AppHeading>
            <AppText
              variant="bodySmall"
              style={[styles.levelDescription, { color: colors.textSecondary }]}
            >
              {levelInfo.description}
            </AppText>
          </View>
        </View>

        {/* 10-Step Interactive Track */}
        <View style={styles.sliderContainer}>
          <View style={styles.segmentsRow}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => {
              const isSelected = step === value;
              const isPassed = step <= value;
              return (
                <TouchableOpacity
                  key={step}
                  onPress={() => handleSelect(step)}
                  activeOpacity={0.7}
                  style={styles.stepTouchTarget}
                  accessibilityRole="button"
                  accessibilityLabel={`Intensity ${step} of 10`}
                >
                  <View
                    style={[
                      styles.stepSegment,
                      {
                        backgroundColor: isPassed
                          ? colors.primary
                          : isDark
                          ? 'rgba(255,255,255,0.1)'
                          : '#E2E8E2',
                        height: isSelected ? 32 : 18,
                        transform: [{ scaleY: isSelected ? 1.15 : 1 }],
                      },
                    ]}
                  />
                  <AppText
                    variant="caption"
                    style={[
                      styles.stepNumberText,
                      {
                        color: isSelected
                          ? colors.primaryDark
                          : colors.textSecondary,
                        fontWeight: isSelected ? '800' : '500',
                      },
                    ]}
                  >
                    {step}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.endpointsRow}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              1 • Very Gentle
            </AppText>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              10 • Peak Intensity
            </AppText>
          </View>
        </View>
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  gaugeCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 20,
  },
  gaugeCenter: {
    alignItems: 'center',
    gap: 14,
  },
  gaugeCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeNumber: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },
  levelDetails: {
    alignItems: 'center',
    gap: 4,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  levelDescription: {
    textAlign: 'center',
    fontSize: 13,
  },
  sliderContainer: {
    width: '100%',
    paddingTop: 10,
  },
  segmentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
  },
  stepTouchTarget: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 2,
  },
  stepSegment: {
    width: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  stepNumberText: {
    fontSize: 11,
  },
  endpointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 2,
  },
});

