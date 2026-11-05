import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  AppHeading,
  AppText,
  AppIcon,
  AppButton,
  SolaceMascot,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { soundEngine } from '../../../utils/audio';
import {
  BREATHING_PATTERNS,
  SESSION_DURATIONS,
} from '../constants/breathingPatterns';
import {
  BreathingExerciseCircle,
  BreathPhase,
} from './BreathingExerciseCircle';
import { useCompleteActivity } from '../../../hooks/useActivities';
import { BreathingPattern } from '@solace/shared';

interface BreathingSessionModalProps {
  visible: boolean;
  initialPatternId?: string;
  activityId?: string; // MongoDB activity ID if opened from activity card
  onClose: () => void;
  onActivityCompleted?: () => void;
}

type SessionState = 'config' | 'active' | 'paused' | 'completed';

export const BreathingSessionModal: React.FC<BreathingSessionModalProps> = ({
  visible,
  initialPatternId = 'box',
  activityId,
  onClose,
  onActivityCompleted,
}) => {
  const { colors } = useTheme();
  const completeActivityMutation = useCompleteActivity();

  // Configuration state
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(() => {
    const found = BREATHING_PATTERNS.find((p) => p.id === initialPatternId);
    return found || BREATHING_PATTERNS[0];
  });
  const [selectedDuration, setSelectedDuration] = useState<number>(120); // 2 mins default
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Active Session state
  const [sessionState, setSessionState] = useState<SessionState>('config');
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [phaseCountdown, setPhaseCountdown] = useState<number>(4);
  const [totalSecondsRemaining, setTotalSecondsRemaining] = useState<number>(120);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [selectedFeeling, setSelectedFeeling] = useState<string>('Calm');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial pattern if prop changes
  useEffect(() => {
    if (initialPatternId) {
      const match = BREATHING_PATTERNS.find((p) => p.id === initialPatternId);
      if (match) setSelectedPattern(match);
    }
  }, [initialPatternId]);

  // Clean audio on unmount or modal close
  useEffect(() => {
    return () => {
      soundEngine.stopAmbient();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Compute duration of a specific phase
  const getPhaseDuration = useCallback((phase: BreathPhase): number => {
    switch (phase) {
      case 'inhale':
        return selectedPattern.inhale;
      case 'hold1':
        return selectedPattern.hold1;
      case 'exhale':
        return selectedPattern.exhale;
      case 'hold2':
        return selectedPattern.hold2;
    }
  }, [selectedPattern]);

  // Transition to next phase in pattern
  const transitionToNextPhase = useCallback(() => {
    let nextPhase: BreathPhase = 'inhale';

    if (currentPhase === 'inhale') {
      nextPhase = selectedPattern.hold1 > 0 ? 'hold1' : 'exhale';
    } else if (currentPhase === 'hold1') {
      nextPhase = 'exhale';
    } else if (currentPhase === 'exhale') {
      nextPhase = selectedPattern.hold2 > 0 ? 'hold2' : 'inhale';
      if (nextPhase === 'inhale') {
        setCyclesCompleted((prev) => prev + 1);
      }
    } else if (currentPhase === 'hold2') {
      nextPhase = 'inhale';
      setCyclesCompleted((prev) => prev + 1);
    }

    const duration = getPhaseDuration(nextPhase);
    setCurrentPhase(nextPhase);
    setPhaseCountdown(duration);

    // Audio cue
    if (soundEnabled) {
      if (nextPhase === 'inhale') soundEngine.playChime(528);
      else if (nextPhase === 'exhale') soundEngine.playChime(432);
      else soundEngine.playChime(396);
    }

    // Haptic cue
    if (hapticsEnabled) {
      if (nextPhase === 'inhale') triggerHaptic.light();
      else if (nextPhase === 'exhale') triggerHaptic.medium();
      else triggerHaptic.selection();
    }
  }, [currentPhase, selectedPattern, soundEnabled, hapticsEnabled, getPhaseDuration]);

  // Active Timer Loop
  useEffect(() => {
    if (sessionState !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      // 1. Decrement overall session time
      setTotalSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Session finished
          if (timerRef.current) clearInterval(timerRef.current);
          soundEngine.stopAmbient();
          triggerHaptic.success();
          setSessionState('completed');
          return 0;
        }
        return prev - 1;
      });

      // 2. Decrement current phase countdown
      setPhaseCountdown((prev) => {
        if (prev <= 1) {
          transitionToNextPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState, transitionToNextPhase]);

  // Start Session
  const handleStartSession = () => {
    triggerHaptic.medium();
    setSessionState('active');
    setCurrentPhase('inhale');
    setPhaseCountdown(selectedPattern.inhale);
    setTotalSecondsRemaining(selectedDuration);
    setCyclesCompleted(0);

    soundEngine.setMuted(!soundEnabled);
    if (soundEnabled) {
      soundEngine.startAmbient();
      soundEngine.playChime(528);
    }
    if (hapticsEnabled) {
      triggerHaptic.light();
    }
  };

  // Pause / Resume
  const handleTogglePause = () => {
    triggerHaptic.selection();
    if (sessionState === 'active') {
      setSessionState('paused');
      soundEngine.stopAmbient();
    } else if (sessionState === 'paused') {
      setSessionState('active');
      if (soundEnabled) soundEngine.startAmbient();
    }
  };

  // Exit prompt
  const handleExitPrompt = () => {
    triggerHaptic.selection();
    if (sessionState === 'active' || sessionState === 'paused') {
      Alert.alert(
        'Pause or End Session?',
        'Would you like to finish your breathing exercise or take a break?',
        [
          { text: 'Keep Breathing', style: 'cancel' },
          {
            text: 'Finish Now',
            onPress: () => {
              soundEngine.stopAmbient();
              setSessionState('completed');
            },
          },
          {
            text: 'Discard & Exit',
            style: 'destructive',
            onPress: handleCloseAll,
          },
        ],
      );
    } else {
      handleCloseAll();
    }
  };

  const handleCloseAll = () => {
    soundEngine.stopAmbient();
    if (timerRef.current) clearInterval(timerRef.current);
    setSessionState('config');
    onClose();
  };

  // Save completion to database
  const handleSaveCompletion = async () => {
    triggerHaptic.selection();
    const durationSpent = selectedDuration - totalSecondsRemaining;

    if (activityId) {
      try {
        await completeActivityMutation.mutateAsync({
          id: activityId,
          dto: {
            durationCompleted: Math.max(durationSpent, 30),
            feedback: `Felt ${selectedFeeling} after ${selectedPattern.name}`,
          },
        });
      } catch {
        // Handled by react-query
      }
    }

    onActivityCompleted?.();
    handleCloseAll();
  };

  const formatRemainingTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const feelings = ['Calm', 'Grounded', 'Refreshed', 'Present', 'Peaceful'];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleExitPrompt}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {/* ========================================================================= */}
        {/* 1. CONFIGURATION VIEW */}
        {/* ========================================================================= */}
        {sessionState === 'config' && (
          <ScrollView contentContainerStyle={styles.configContainer} showsVerticalScrollIndicator={false}>
            {/* Top Close Header */}
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={handleCloseAll}
                style={[styles.circleBtn, { backgroundColor: colors.surfaceVariant }]}
                accessibilityLabel="Close"
              >
                <AppIcon name="x" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <AppHeading level="h4">Guided Breathing</AppHeading>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.mascotHeroWrap}>
              <SolaceMascot
                size={90}
                expression="calm"
                animationState="breathe"
                showGlow
                showCushion
              />
              <AppHeading level="h3" style={styles.heroTitle}>
                Calm Your Nervous System
              </AppHeading>
              <AppText variant="bodyMedium" style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Choose your breathing pace and duration. Allow each breath to ground your awareness.
              </AppText>
            </View>

            {/* Pattern Selection */}
            <View style={styles.section}>
              <AppText variant="caption" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                BREATHING TECHNIQUE
              </AppText>
              <View style={styles.patternsGrid}>
                {BREATHING_PATTERNS.map((p) => {
                  const isSelected = selectedPattern.id === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.patternCard,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                          borderColor: isSelected ? colors.primaryDark : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic.selection();
                        setSelectedPattern(p);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.patternCardHeader}>
                        <AppText
                          variant="bodyMedium"
                          style={[
                            styles.patternCardTitle,
                            { color: isSelected ? colors.primaryDark : colors.textPrimary },
                          ]}
                        >
                          {p.name}
                        </AppText>
                        <View style={[styles.badgePill, { backgroundColor: colors.surfaceVariant }]}>
                          <AppText variant="caption" style={styles.badgeText}>
                            {p.subtitle}
                          </AppText>
                        </View>
                      </View>
                      <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                        {p.description}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Duration Selection */}
            <View style={styles.section}>
              <AppText variant="caption" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                SESSION DURATION
              </AppText>
              <View style={styles.durationsRow}>
                {SESSION_DURATIONS.map((d) => {
                  const isSelected = selectedDuration === d.seconds;
                  return (
                    <TouchableOpacity
                      key={d.seconds}
                      style={[
                        styles.durationPill,
                        {
                          backgroundColor: isSelected ? colors.primaryDark : colors.surface,
                          borderColor: isSelected ? colors.primaryDark : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic.selection();
                        setSelectedDuration(d.seconds);
                      }}
                      activeOpacity={0.8}
                    >
                      <AppText
                        variant="bodyMedium"
                        style={[
                          styles.durationText,
                          { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {d.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sensory Preferences */}
            <View style={styles.section}>
              <AppText variant="caption" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                SENSORY PREFERENCES
              </AppText>
              <View style={styles.prefRow}>
                <TouchableOpacity
                  style={[
                    styles.prefChip,
                    {
                      backgroundColor: soundEnabled ? colors.primaryLight : colors.surface,
                      borderColor: soundEnabled ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSoundEnabled(!soundEnabled);
                  }}
                >
                  <AppIcon
                    name={soundEnabled ? 'volume2' : 'volume2'}
                    size={16}
                    color={soundEnabled ? colors.primaryDark : colors.textSecondary}
                  />
                  <AppText variant="bodySmall" style={{ color: soundEnabled ? colors.primaryDark : colors.textPrimary }}>
                    {soundEnabled ? 'Ambient Audio On' : 'Audio Muted'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.prefChip,
                    {
                      backgroundColor: hapticsEnabled ? colors.primaryLight : colors.surface,
                      borderColor: hapticsEnabled ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic.selection();
                    setHapticsEnabled(!hapticsEnabled);
                  }}
                >
                  <AppIcon
                    name="sparkles"
                    size={16}
                    color={hapticsEnabled ? colors.primaryDark : colors.textSecondary}
                  />
                  <AppText variant="bodySmall" style={{ color: hapticsEnabled ? colors.primaryDark : colors.textPrimary }}>
                    {hapticsEnabled ? 'Haptic Pulse On' : 'Haptics Off'}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Begin Button */}
            <View style={styles.beginBtnWrap}>
              <AppButton
                title="Begin Breathing Session 🌿"
                variant="primary"
                size="lg"
                onPress={handleStartSession}
                fullWidth
              />
            </View>
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* 2. ACTIVE / PAUSED GUIDED SESSION VIEW */}
        {/* ========================================================================= */}
        {(sessionState === 'active' || sessionState === 'paused') && (
          <View style={styles.activeContainer}>
            {/* Top Bar */}
            <View style={styles.activeTopBar}>
              <TouchableOpacity
                onPress={handleExitPrompt}
                style={[styles.circleBtn, { backgroundColor: colors.surface }]}
                accessibilityLabel="Exit session"
              >
                <AppIcon name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.activeHeaderInfo}>
                <AppHeading level="h4" style={styles.activeTechniqueTitle}>
                  {selectedPattern.name}
                </AppHeading>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  {formatRemainingTime(totalSecondsRemaining)} remaining • {cyclesCompleted} cycles
                </AppText>
              </View>

              <TouchableOpacity
                onPress={() => {
                  triggerHaptic.selection();
                  const nextMute = soundEnabled;
                  setSoundEnabled(!nextMute);
                  soundEngine.setMuted(nextMute);
                }}
                style={[styles.circleBtn, { backgroundColor: colors.surface }]}
                accessibilityLabel="Toggle sound"
              >
                <AppIcon
                  name="volume2"
                  size={18}
                  color={soundEnabled ? colors.primaryDark : colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {/* Center Breathing Orb */}
            <View style={styles.centerOrbArea}>
              <BreathingExerciseCircle
                phase={currentPhase}
                phaseDuration={getPhaseDuration(currentPhase)}
                countdown={phaseCountdown}
                isActive={sessionState === 'active'}
              />
            </View>

            {/* Bottom Controls */}
            <View style={styles.activeBottomControls}>
              <TouchableOpacity
                onPress={handleTogglePause}
                style={[styles.pausePlayBtn, { backgroundColor: colors.primaryDark }]}
                accessibilityLabel={sessionState === 'active' ? 'Pause' : 'Resume'}
              >
                <AppIcon
                  name={sessionState === 'active' ? 'pause' : 'play'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {sessionState === 'paused' && (
                <View style={styles.pausedIndicator}>
                  <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
                    Session Paused • Tap button to resume
                  </AppText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* 3. COMPLETED CELEBRATION VIEW */}
        {/* ========================================================================= */}
        {sessionState === 'completed' && (
          <ScrollView contentContainerStyle={styles.completedContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.completedHero}>
              <SolaceMascot
                size={110}
                expression="happy"
                animationState="floating"
                showGlow
                showCushion
              />
              <AppHeading level="h2" style={styles.completedTitle}>
                Well Done 🌿
              </AppHeading>
              <AppText variant="bodyMedium" style={[styles.completedSubtitle, { color: colors.textSecondary }]}>
                You dedicated mindful care to your mind and body.
              </AppText>
            </View>

            {/* Stats Card */}
            <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statCol}>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  DURATION
                </AppText>
                <AppText variant="h3" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                  {Math.round((selectedDuration - totalSecondsRemaining) / 60) || 1} min
                </AppText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statCol}>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  CYCLES
                </AppText>
                <AppText variant="h3" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                  {cyclesCompleted}
                </AppText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statCol}>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  PATTERN
                </AppText>
                <AppText variant="h3" style={{ color: colors.primaryDark, fontWeight: '700', fontSize: 16 }}>
                  {selectedPattern.name.split(' ')[0]}
                </AppText>
              </View>
            </View>

            {/* Post-Check-in feeling */}
            <View style={styles.feelingSection}>
              <AppText variant="caption" style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: 'center' }]}>
                HOW DO YOU FEEL RIGHT NOW?
              </AppText>
              <View style={styles.feelingChipsWrap}>
                {feelings.map((f) => {
                  const isSelected = selectedFeeling === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.feelingChip,
                        {
                          backgroundColor: isSelected ? colors.primaryDark : colors.surface,
                          borderColor: isSelected ? colors.primaryDark : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic.selection();
                        setSelectedFeeling(f);
                      }}
                    >
                      <AppText
                        variant="bodySmall"
                        style={{ color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}
                      >
                        {f}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save & Finish Button */}
            <View style={styles.finishBtnWrap}>
              <AppButton
                title={completeActivityMutation.isPending ? 'Saving...' : 'Finish & Save Progress'}
                variant="primary"
                size="lg"
                onPress={handleSaveCompletion}
                loading={completeActivityMutation.isPending}
                fullWidth
              />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  configContainer: {
    padding: 20,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mascotHeroWrap: {
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  heroTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  patternsGrid: {
    gap: 10,
  },
  patternCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  patternCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patternCardTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  durationsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  durationText: {
    fontWeight: '600',
    fontSize: 14,
  },
  prefRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prefChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  beginBtnWrap: {
    marginTop: 10,
    marginBottom: 24,
  },
  activeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  activeTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeHeaderInfo: {
    alignItems: 'center',
    gap: 2,
  },
  activeTechniqueTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  centerOrbArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBottomControls: {
    alignItems: 'center',
    paddingBottom: 24,
    gap: 12,
  },
  pausePlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pausedIndicator: {
    marginTop: 4,
  },
  completedContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 24,
  },
  completedHero: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  completedTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  completedSubtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: '60%',
  },
  feelingSection: {
    width: '100%',
    gap: 12,
  },
  feelingChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  feelingChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  finishBtnWrap: {
    width: '100%',
    marginTop: 12,
  },
});
