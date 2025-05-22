import { FlatList, StyleSheet, View } from 'react-native';

import Compass from '@/components/Compass';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import globalStyles from '@/shared/styles';
import { getDistanceBetweenCoordinates, getDistanceBetweenCoordinatesInMiles } from '@/shared/utils';
import { requestForegroundPermissionsAsync, watchHeadingAsync } from 'expo-location';
import { useContext, useEffect, useState } from 'react';
import { LocationContext, Stop, StopsContext, TrackedStopsContext } from '../_layout';

let markerIncrementor = 0;

export default function HomeScreen() {
  const [heading, setHeading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stops, setStops] = useState<Stop[]>([]);
  const [markerNumbers, setMarkerNumbers] = useState<{ [key: string]: number }>({});
  const [trackedStops, setTrackedStops] = useContext(TrackedStopsContext);

  const allStops = useContext(StopsContext);
  const location = useContext(LocationContext);

  const getMarkerDistance = (stop: Stop) => {
    if (location) {
      const miles = getDistanceBetweenCoordinatesInMiles(
        location.coords.latitude,
        location.coords.longitude,
        stop.attributes.latitude,
        stop.attributes.longitude
      );
      return miles * 5280 <= 1000 ? (miles * 5280).toFixed(0) + ' ft' : miles.toPrecision(2) + ' mi';
    }
  };

  useEffect(() => {
    stops.forEach((stop) => {
      if (!markerNumbers[stop.id]) {
        setMarkerNumbers((prev) => ({
          ...prev,
          [stop.id]: ++markerIncrementor,
        }));
      }
    });
  }, [markerNumbers, stops]);

  useEffect(() => {
    if (location && allStops.length > 0) {
      if (trackedStops.length === 0) {
        const sortedStops = [...allStops].sort(
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
        const closest = sortedStops.slice(0, 5);
        setStops(closest);
      } else {
        setStops(allStops.filter((stop) => trackedStops.includes(stop.id)));
      }
    }
  }, [allStops, location, trackedStops]);

  useEffect(() => {
    (async () => {
      let { status } = await requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const headingSubscription = await watchHeadingAsync((headingData) => {
        setHeading(headingData.trueHeading);
      });

      // Clean up on unmount
      return () => {
        headingSubscription.remove();
      };
    })();
  }, []);

  return (
    <ThemedView style={{ flex: 1 }} isSafeArea>
      <ThemedView style={styles.content}>
        {location && heading !== null && stops?.length > 0 ? (
          <>
            <Compass heading={heading} location={location} stops={stops} markerNumbers={markerNumbers} />
            <View style={{ flex: 1, gap: 8 }}>
              <ThemedText type="defaultSemiBold">Tracked stops</ThemedText>
              <View style={styles.stopsContainer}>
                <FlatList
                  data={stops}
                  renderItem={({ item }) => (
                    <View
                      key={item.id}
                      style={{ paddingVertical: 8, flexDirection: 'row', gap: 12, alignItems: 'baseline' }}
                    >
                      <View
                        style={item.attributes.vehicle_type === 3 ? globalStyles.busMarker : globalStyles.trainMaker}
                      >
                        <ThemedText type="small" style={{ fontWeight: 'bold', color: 'black' }}>
                          {markerNumbers[item.id]}
                        </ThemedText>
                      </View>
                      <ThemedText style={{ flexShrink: 1 }}>{item.attributes.name}</ThemedText>
                      <ThemedText style={{ marginLeft: 'auto' }} type="small">
                        {getMarkerDistance(item)}
                      </ThemedText>
                    </View>
                  )}
                />
              </View>
            </View>
          </>
        ) : null}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 32,
    gap: 32,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  stopsContainer: {
    flex: 1,
  },
});
