import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '@/shared/styles';
import { useContext } from 'react';
import { Switch, View } from 'react-native';
import { SettingsContext } from '../_layout';

export default function SettingsScreen() {
  const [settings, setSettings] = useContext(SettingsContext);
  const updateLocationTypes = (type: 'buses' | 'stations' | 'entrances', value: boolean) => {
    if (setSettings) {
      setSettings((prev) => ({
        ...prev,
        locationTypes: {
          ...prev.locationTypes,
          [type]: value,
        },
      }));
    }
  };
  return (
    <ThemedView style={{ flex: 1 }} isSafeArea>
      <ThemedView
        style={{
          ...styles.content,
          justifyContent: 'flex-start',
        }}
      >
        <ThemedText type="title">Settings</ThemedText>
        <View style={styles.switches}>
          <ThemedText type="defaultSemiBold">Location types</ThemedText>
          <View style={styles.switchRow}>
            <ThemedText style={{ flexShrink: 1 }}>Bus stops</ThemedText>
            <Switch
              value={settings.locationTypes.buses}
              onValueChange={(value) => updateLocationTypes('buses', value)}
            />
          </View>
          <View style={styles.switchRow}>
            <ThemedText style={{ flexShrink: 1 }}>Stations &amp; entrances/exits</ThemedText>
            <Switch
              value={settings.locationTypes.stations}
              onValueChange={(value) => updateLocationTypes('stations', value)}
            />
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );
}
