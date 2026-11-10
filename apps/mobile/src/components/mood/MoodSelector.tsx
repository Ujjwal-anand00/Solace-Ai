import React from 'react';
import { View, StyleSheet, Dimensions, StyleProp, ViewStyle } from 'react-native';
import { MOOD_LIST, MoodKey } from './moodConfig';
import { MoodOption } from './MoodOption';

export interface MoodSelectorProps {
  selectedMood?: MoodKey | null;
  onSelectMood: (mood: MoodKey) => void;
  style?: StyleProp<ViewStyle>;
  characterSize?: number;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  style,
  characterSize,
}) => {
  const windowWidth = Dimensions.get('window').width;
  // Dynamically calculate comfortable character size for responsive screens
  const defaultSize = windowWidth < 360 ? 46 : windowWidth < 400 ? 50 : 54;
  const size = characterSize || defaultSize;

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="radiogroup"
      accessibilityLabel="How are you feeling today mood selector"
    >
      <View style={styles.row}>
        {MOOD_LIST.map((config) => {
          const isSelected = selectedMood === config.key;
          const isSubdued = Boolean(selectedMood && !isSelected);

          return (
            <MoodOption
              key={config.key}
              config={config}
              isSelected={isSelected}
              isSubdued={isSubdued}
              onSelect={onSelectMood}
              size={size}
              style={styles.optionWrapper}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionWrapper: {
    flex: 1,
    alignItems: 'center',
  },
});
