import { ScrollView, StyleSheet, View } from 'react-native';

import Compass from '@/components/Compass';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import globalStyles from '@/shared/styles';
import { getDistanceBetweenCoordinates, getDistanceBetweenCoordinatesInMiles } from '@/shared/utils';
import * as Location from 'expo-location';
import { useContext, useEffect, useState } from 'react';
import { AllStationsContext, Station, TrackedStationsContext } from '../_layout';

let markerIncrementor = 0;

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stations, setStations] = useState<Station[]>([]);
  const [closestStations, setClosestStations] = useState<Station[]>([]);
  const [markerNumbers, setMarkerNumbers] = useState<{ [key: string]: number }>({});
  // const markerNumbers = useRef(new Map<string, number>());

  const allStations = useContext(AllStationsContext);
  const [trackedStations, setTrackedStations] = useContext(TrackedStationsContext);

  /* const fetchStationsFromMBTA = useCallback(async (latitude: number, longitude: number): Promise<Station[]> => {
    console.log('fetching stations');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=2`);
    return (await res.json()).data as Station[];
  }, []);

  const refreshStationsData = useCallback(
    async (latitude: number, longitude: number) => {
      const data = await fetchStationsFromMBTA(latitude, longitude);
      AsyncStorage.setItem(
        'closestStations',
        JSON.stringify({
          data,
          timestamp: new Date().getTime(),
        })
      );
      setStations(data);
    },
    [fetchStationsFromMBTA]
  );

  useEffect(() => {
    (async () => {
      if (location) {
        const { latitude, longitude } = location.coords;
        const storedStations = await AsyncStorage.getItem('closestStations');
        if (storedStations) {
          const parsedStations = JSON.parse(storedStations);
          // Use cache if it is less than 1 day old
          if (parsedStations.timestamp + 1000 * 60 * 60 * 24 > new Date().getTime()) {
            console.log('Using cached stations');
            setStations(parsedStations.data);
          } else {
            refreshStationsData(latitude, longitude);
          }
        } else {
          refreshStationsData(latitude, longitude);
        }
      }
    })();
  }, [location, refreshStationsData]); */

  useEffect(() => {
    stations.forEach((station) => {
      if (!markerNumbers[station.id]) {
        setMarkerNumbers((prev) => ({
          ...prev,
          [station.id]: ++markerIncrementor,
        }));
      }
    });
  }, [markerNumbers, stations]);

  useEffect(() => {
    if (location && allStations.length > 0) {
      if (trackedStations.length === 0) {
        const sortedStations = [...allStations].sort(
          (a, b) =>
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
        const closest = sortedStations.slice(0, 5);
        setStations(closest);
      } else {
        setStations(allStations.filter((station) => trackedStations.includes(station.id)));
      }
    }
  }, [allStations, location, trackedStations]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const locationSubscription = await Location.watchPositionAsync({}, (locationData) => {
        setLocation(locationData);
      });

      const headingSubscription = await Location.watchHeadingAsync((headingData) => {
        setHeading(headingData.trueHeading);
      });

      // Clean up on unmount
      return () => {
        headingSubscription.remove();
        locationSubscription.remove();
      };
    })();
  }, []);

  return (
    <ThemedView style={{ flex: 1 }} isSafeArea>
      <ScrollView>
        <ThemedView style={styles.content}>
          {location && heading && stations?.length > 0 && (
            <>
              <Compass heading={heading} location={location} stations={stations} markerNumbers={markerNumbers} />
              <ThemedView style={styles.stationsContainer}>
                {stations.map((station, index) => (
                  <View key={station.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'baseline' }}>
                    <View style={globalStyles.marker}>
                      <ThemedText type="small" style={{ fontWeight: 'bold', color: 'black' }}>
                        {markerNumbers[station.id]}
                      </ThemedText>
                    </View>
                    <ThemedText style={{ flexShrink: 1 }}>{station.attributes.name}</ThemedText>
                    <ThemedText style={{ marginLeft: 'auto' }} type="small">
                      {getDistanceBetweenCoordinatesInMiles(
                        location.coords.latitude,
                        location.coords.longitude,
                        station.attributes.latitude,
                        station.attributes.longitude
                      ).toPrecision(2)}{' '}
                      miles
                    </ThemedText>
                  </View>
                ))}
              </ThemedView>
            </>
          )}
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
  stationsContainer: {
    gap: 16,
  },
});
