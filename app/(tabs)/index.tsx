import { Image } from 'expo-image';
import { FlatList, StyleSheet, useColorScheme, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

interface Station {
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

  const colorScheme = useColorScheme() ?? 'light';

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

  const getHeadingBetweenCoordinates = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = Math.atan2(y, x);
    const brngInDegrees = (brng * 180) / Math.PI; // Convert to degrees
    return (brngInDegrees + 360) % 360; // Normalize to 0-360
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

  const fetchStationsFromMBTA = async (latitude: number, longitude: number) => {
    console.log('fetching stations');
    // TODO: Reduce radius to 1 mile (0.02)
    const res = await fetch(
      `https://api-v3.mbta.com/stops?filter[location_type]=2&filter[latitude]=${latitude}&filter[longitude]=${longitude}&filter[radius]=0.1&sort=distance&page[limit]=5`
    );
    return await res.json();
  };

  const refreshStationsData = useCallback(async (latitude: number, longitude: number) => {
    const data = await fetchStationsFromMBTA(latitude, longitude);
    AsyncStorage.setItem(
      'closestStations',
      JSON.stringify({
        data: data.data,
        timestamp: new Date().getTime(),
      })
    );
    setStations(data.data);
  }, []);

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

  const compassBorderColor = { light: '#A1CEDC', dark: '#1D3D47' };

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
        <ThemedText type="subtitle">Your location</ThemedText>
        <ThemedText>{location?.coords.latitude}</ThemedText>
        <ThemedText>{location?.coords.longitude}</ThemedText>
        <ThemedText>{heading}</ThemedText>
        <ThemedText type="subtitle">Closest stations</ThemedText>
        {location && stations?.length > 0 && (
          <>
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
            <View
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                aspectRatio: '1/1',
                borderWidth: 2,
                borderColor: compassBorderColor[colorScheme],
                borderRadius: '50%',
                paddingHorizontal: 16,
                paddingVertical: 8,
                transform: [{ rotate: `-${heading}deg` }],
              }}
            >
              <ThemedText>N</ThemedText>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignSelf: 'stretch',
                }}
              >
                <ThemedText>W</ThemedText>
                <ThemedText>E</ThemedText>
              </View>
              <ThemedText>S</ThemedText>
              {stations.map((station, index) => (
                <View
                  key={station.id}
                  style={{
                    position: 'absolute',
                    inset: 64 - index * 16,
                    alignItems: 'center',
                    transform: [
                      {
                        rotate: `-${getHeadingBetweenCoordinates(
                          location?.coords.latitude,
                          location?.coords.longitude,
                          station?.attributes.latitude,
                          station?.attributes.longitude
                        )}deg`,
                      },
                    ],
                  }}
                >
                  <View
                    style={{
                      padding: 4,
                      borderRadius: '50%',
                      backgroundColor: 'orange',
                      aspectRatio: '1/1',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ThemedText>{index + 1}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
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
