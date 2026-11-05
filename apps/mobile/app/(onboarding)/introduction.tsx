import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  PrimaryButton,
  GhostButton,
  AppIcon,
} from '../../src/components/ui';
import {
  MoodIllustration,
  CompanionIllustration,
  GrowthIllustration,
  PaginationDots,
} from '../../src/features/onboarding/components';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface IntroSlide {
  id: string;
  heading: string;
  description: string;
  renderVisual: (size: number) => React.ReactNode;
}

const SLIDES: IntroSlide[] = [
  {
    id: 'slide-01',
    heading: 'Understand how you feel.',
    description:
      'Take a moment each day to check in with your emotions and discover patterns that help you understand yourself better.',
    renderVisual: (size) => <MoodIllustration size={size} />,
  },
  {
    id: 'slide-02',
    heading: 'Meet your AI companion.',
    description:
      'Talk openly about your thoughts and feelings. Your personal wellness companion is here to listen and guide you.',
    renderVisual: (size) => <CompanionIllustration size={size} />,
  },
  {
    id: 'slide-03',
    heading: 'Grow at your own pace.',
    description:
      'Build healthier habits through mindful breathing, daily reflections and personalized wellness activities.',
    renderVisual: (size) => <GrowthIllustration size={size} />,
  },
];

export default function IntroductionScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Handle hardware Android Back Button
  useEffect(() => {
    const onBackPress = () => {
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1);
        return true;
      }
      router.back();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [currentIndex, router]);

  const goToSlide = (index: number) => {
    triggerHaptic.light();
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      handleCompleteIntro();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    triggerHaptic.light();
    router.push('/(onboarding)/preferences');
  };

  const handleCompleteIntro = () => {
    triggerHaptic.medium();
    router.push('/(onboarding)/preferences');
  };

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
        setCurrentIndex(index);
        triggerHaptic.light();
      }
    },
    [currentIndex],
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const renderSlideItem = ({ item }: { item: IntroSlide }) => {
    const visualSize = Math.min(SCREEN_WIDTH * 0.72, 280);

    return (
      <View style={[styles.slideContainer, { width: SCREEN_WIDTH }]}>
        {/* Visual Element */}
        <View style={styles.visualWrapper}>{item.renderVisual(visualSize)}</View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <AppHeading level={1} align="center" style={styles.heading}>
            {item.heading}
          </AppHeading>
          <AppText
            variant="bodyLarge"
            color="textSecondary"
            align="center"
            style={styles.description}
          >
            {item.description}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Navigation Bar: Back + Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="chevronLeft" size="md" color={colors.textPrimary} />
        </TouchableOpacity>

        <GhostButton
          title="Skip"
          size="sm"
          onPress={handleSkip}
          accessibilityLabel="Skip intro"
        />
      </View>

      {/* Swipeable Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlideItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={styles.carouselList}
      />

      {/* Bottom Controls: Dots + Action Button */}
      <View style={styles.bottomBar}>
        <PaginationDots
          total={SLIDES.length}
          activeIndex={currentIndex}
          style={styles.dotsWrapper}
        />

        <PrimaryButton
          title={isLastSlide ? 'Continue' : 'Next'}
          size="lg"
          fullWidth
          trailingIcon={isLastSlide ? 'arrowRight' : 'chevronRight'}
          onPress={handleNext}
          style={styles.primaryBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselList: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  visualWrapper: {
    flex: 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 320,
  },
  textContainer: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxWidth: 320,
    paddingTop: 16,
  },
  heading: {
    marginBottom: 14,
    lineHeight: 34,
  },
  description: {
    lineHeight: 24,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    alignItems: 'center',
  },
  dotsWrapper: {
    marginBottom: 20,
  },
  primaryBtn: {
    maxWidth: 340,
  },
});
