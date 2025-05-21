import { FlatList, Switch, TextInput, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import styles from '@/shared/styles';
import { getDistanceBetweenCoordinates } from '@/shared/utils';
import { useContext, useEffect, useState } from 'react';
import { LocationContext, Station, StationsContext, TrackedStationsContext } from '../_layout';

export default function TabTwoScreen() {
  const allStations = useContext(StationsContext);
  const colorScheme = useColorScheme() ?? 'light';
  const location = useContext(LocationContext);

  const [trackedStations, setTrackedStations] = useContext(TrackedStationsContext);
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
      const sortedStations = [...allStations];
      sortedStations.sort((a, b) => {
        if (!location) return 0;
        return (
          getDistanceBetweenCoordinates(
            location.coords.latitude,
            location.coords.longitude,
            a.attributes.latitude,
            a.attributes.longitude
          ) -
          getDistanceBetweenCoordinates(
            location.coords.latitude,
            location.coords.longitude,
            b.attributes.latitude,
            b.attributes.longitude
          )
        );
      });
      setStations(sortedStations);
    }
  }, [allStations, location, searchQuery]);

  return (
    <ThemedView style={{ flex: 1 }} isSafeArea>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Explore</ThemedText>
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
        <FlatList
          data={stations}
          renderItem={({ item }) => (
            <View
              key={item.id}
              style={{
                ...styles.switchRow,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors[colorScheme].subtle,
              }}
            >
              <View style={{ flexShrink: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={item.attributes.vehicle_type === 3 ? styles.busMarker : styles.trainMaker}>
                  <ThemedText type="small" style={{ fontWeight: 'bold', color: 'black' }}>
                    T
                  </ThemedText>
                </View>
                <ThemedText style={{ flexShrink: 1 }}>{item.attributes.name}</ThemedText>
              </View>
              <Switch value={trackedStations.includes(item.id)} onValueChange={() => updateTracked(item)} />
            </View>
          )}
        />
      </ThemedView>
    </ThemedView>
  );
}
