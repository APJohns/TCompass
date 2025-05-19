import { Image } from 'expo-image';
import { FlatList, StyleSheet } from 'react-native';

import Compass from '@/components/Compass';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

export interface Station {
  id: string;
  type: string;
  attributes: {
    name: string;
    latitude: number;
    longitude: number;
    distance: number;
  };
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stations, setStations] = useState<Station[]>([]);

  const getDistanceBetweenCoordinates = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const getDistanceBetweenCoordinatesInMiles = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const distanceInKm = getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2);
    return distanceInKm * 0.621371; // Convert km to miles
  };

  const getLocation = async () => {
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
  };

  const fetchStationsFromMBTA = useCallback(async (latitude: number, longitude: number): Promise<Station[]> => {
    console.log('fetching stations');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=2`);

    const allStations = (await res.json()).data as Station[];
    allStations.sort(
      (a, b) =>
        getDistanceBetweenCoordinates(latitude, longitude, a.attributes.latitude, a.attributes.longitude) -
        getDistanceBetweenCoordinates(latitude, longitude, b.attributes.latitude, b.attributes.longitude)
    );
    return allStations.slice(0, 5);
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
  }, [location, refreshStationsData]);

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        {location && heading && stations?.length > 0 && (
          <>
            <Compass heading={heading} location={location} stations={stations} />
            <FlatList
              data={stations}
              renderItem={({ item }) => (
                <>
                  <ThemedText>{item.attributes.name}</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {getDistanceBetweenCoordinatesInMiles(
                      location.coords.latitude,
                      location.coords.longitude,
                      item.attributes.latitude,
                      item.attributes.longitude
                    ).toPrecision(2)}{' '}
                    miles
                  </ThemedText>
                </>
              )}
            />
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
