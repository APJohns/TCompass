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
        <View style={{ flex: 1, gap: 8 }}>
          <ThemedText type="defaultSemiBold">Location types</ThemedText>
          <View style={styles.switches}>
            <View style={styles.switchRow}>
              <View style={{ flexShrink: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={styles.busMarker}>
                  <ThemedText type="small" style={{ fontWeight: 'bold', color: 'black' }}>
                    T
                  </ThemedText>
                </View>
                <ThemedText style={{ flexShrink: 1 }}>Buses</ThemedText>
              </View>
              <Switch
                style={{ marginLeft: 'auto' }}
                value={settings.locationTypes.buses}
                onValueChange={(value) => updateLocationTypes('buses', value)}
              />
            </View>
            <View style={styles.switchRow}>
              <View style={{ flexShrink: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={styles.trainMaker}>
                  <ThemedText type="small" style={{ fontWeight: 'bold', color: 'black' }}>
                    T
                  </ThemedText>
                </View>
                <ThemedText style={{ flexShrink: 1 }}>Trains</ThemedText>
              </View>
              <Switch
                style={{ marginLeft: 'auto' }}
                value={settings.locationTypes.stations}
                onValueChange={(value) => updateLocationTypes('stations', value)}
              />
            </View>
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );
}
