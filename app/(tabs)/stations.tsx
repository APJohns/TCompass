import { ScrollView, StyleSheet, Switch, TextInput, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useContext, useEffect, useState } from 'react';
import { AllStationsContext, Station, TrackedStationsContext } from '../_layout';

export default function TabTwoScreen() {
  const allStations = useContext(AllStationsContext);
  const [trackedStations, setTrackedStations] = useContext(TrackedStationsContext);
  const colorScheme = useColorScheme() ?? 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [stations, setStations] = useState<Station[]>([]);

  const updateTracked = (station: Station) => {
    if (setTrackedStations) {
      if (trackedStations.includes(station.id)) {
        setTrackedStations(trackedStations.filter((id) => id !== station.id));
      } else {
        setTrackedStations([...trackedStations, station.id]);
      }
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filteredStations = allStations.filter((station) =>
        station.attributes.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setStations(filteredStations);
    } else {
      setStations(allStations);
    }
  }, [allStations, searchQuery]);

  return (
    <ThemedView style={{ flex: 1 }} isSafeArea>
      <ScrollView>
        <ThemedView style={styles.content}>
          <ThemedText type="title">Stations</ThemedText>
          <ThemedView>
            <TextInput
              placeholder="Search"
              style={{
                fontSize: 16,
                backgroundColor: Colors[colorScheme].subtle,
                borderRadius: 10,
                padding: 8,
                paddingLeft: 32,
              }}
              onChangeText={(text) => setSearchQuery(text)}
              value={searchQuery}
            />
            <IconSymbol
              name="magnifyingglass"
              size={18}
              color="#aaa"
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
              }}
            />
          </ThemedView>
          <View style={{ flex: 1, marginTop: 16, gap: 24 }}>
            {stations.map((station) => (
              <View key={station.id} style={styles.stationRow}>
                <ThemedText style={{ flexShrink: 1 }}>{station.attributes.name}</ThemedText>
                <Switch value={trackedStations.includes(station.id)} onValueChange={() => updateTracked(station)} />
              </View>
            ))}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 32,
  },
  stationRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
