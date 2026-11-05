import { useThemeContext } from '../theme/ThemeProvider';
import { Theme } from '../theme/lightTheme';
import { ThemeMode } from '../store/themeStore';

export interface UseThemeReturn {
  theme: Theme;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: Theme['colors'];
  typography: Theme['typography'];
  spacing: Theme['spacing'];
  layout: Theme['layout'];
  radius: Theme['radius'];
  shadows: Theme['shadows'];
}

export const useTheme = (): UseThemeReturn => {
  const context = useThemeContext();

  return {
    theme: context.theme,
    isDark: context.isDark,
    themeMode: context.themeMode,
    setThemeMode: context.setThemeMode,
    colors: context.theme.colors,
    typography: context.theme.typography,
    spacing: context.theme.spacing,
    layout: context.theme.layout,
    radius: context.theme.radius,
    shadows: context.theme.shadows,
  };
};
