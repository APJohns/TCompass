import { FlatList, Switch, TextInput, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import styles from '@/shared/styles';
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
              <ThemedText style={{ flexShrink: 1 }}>{item.attributes.name}</ThemedText>
              <Switch value={trackedStations.includes(item.id)} onValueChange={() => updateTracked(item)} />
            </View>
          )}
        />
      </ThemedView>
    </ThemedView>
  );
}
