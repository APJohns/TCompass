import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext } from 'react';
import { AllStationsContext, Station, TrackedStationsContext } from '../_layout';

export default function TabTwoScreen() {
  const allStations = useContext(AllStationsContext);
  const [trackedStations, setTrackedStations] = useContext(TrackedStationsContext);

  const updateTracked = (station: Station) => {
    if (setTrackedStations) {
      if (trackedStations.includes(station.id)) {
        setTrackedStations(trackedStations.filter((id) => id !== station.id));
      } else {
        setTrackedStations([...trackedStations, station.id]);
      }
    }
  };

  return (
    <ThemedView style={{ flex: 1 }} isSafeArea>
      <ScrollView>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Stations</ThemedText>
          {allStations.map((station) => (
            <View key={station.id} style={styles.stationRow}>
              <ThemedText style={{ flexShrink: 1 }}>{station.attributes.name}</ThemedText>
              <Switch value={trackedStations.includes(station.id)} onValueChange={() => updateTracked(station)} />
            </View>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 32,
    gap: 32,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  stationRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
