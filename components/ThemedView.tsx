import { SafeAreaView, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  isSafeArea?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, isSafeArea, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  if (isSafeArea) {
    return <SafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />;
  } else {
    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
  }
}
