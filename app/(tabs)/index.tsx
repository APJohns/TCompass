import { StyleSheet, View } from 'react-native';

import Compass from '@/components/Compass';
import MarkerList from '@/components/MarkerList';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getDistanceBetweenCoordinates } from '@/shared/utils';
import { requestForegroundPermissionsAsync, watchHeadingAsync } from 'expo-location';
import { useContext, useEffect, useRef, useState } from 'react';
import { LocationContext, Stop, StopsContext, TrackedStopsContext } from '../_layout';

export default function HomeScreen() {
  const markerIncrementor = useRef(1);

  const [heading, setHeading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stops, setStops] = useState<Stop[]>([]);
  const [markerNumbers, setMarkerNumbers] = useState<{ [key: string]: number }>({});
  const [trackedStops, setTrackedStops] = useContext(TrackedStopsContext);

  const allStops = useContext(StopsContext);
  const location = useContext(LocationContext);

  useEffect(() => {
    stops.forEach((stop) => {
      if (!markerNumbers[stop.id]) {
        setMarkerNumbers((prev) => ({
          ...prev,
          [stop.id]: markerIncrementor.current++,
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
                <MarkerList stops={stops} markerNumbers={markerNumbers} />
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
