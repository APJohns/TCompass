import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationObject, requestForegroundPermissionsAsync, watchPositionAsync } from 'expo-location';
import { createContext, useCallback, useEffect, useState } from 'react';

export interface Station {
  id: string;
  type: string;
  attributes: {
    name: string;
    latitude: number;
    longitude: number;
    distance: number;
    vehicle_type: number | null;
  };
}

interface Settings {
  locationTypes: {
    buses: boolean;
    stations: boolean;
  };
}

const defaultSettings: Settings = {
  locationTypes: {
    buses: false,
    stations: true,
  },
};

export const LocationContext = createContext<LocationObject | null>(null);

export const SettingsContext = createContext<[Settings, React.Dispatch<React.SetStateAction<Settings>> | null]>([
  defaultSettings,
  null,
]);
export const StationsContext = createContext<Station[]>([]);

export const TrackedStationsContext = createContext<[string[], React.Dispatch<React.SetStateAction<string[]>> | null]>([
  [],
  null,
]);

export default function RootLayout() {
  // AsyncStorage.clear();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [location, setLocation] = useState<LocationObject | null>(null);

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [trackedStations, setTrackedStations] = useState<string[]>([]);

  const fetchBusStopsFromMBTA = useCallback(async (): Promise<Station[]> => {
    console.log('fetching bus stops');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=0&filter[route_type]=3`);
    return (await res.json()).data as Station[];
  }, []);

  const fetchStationsFromMBTA = useCallback(async (): Promise<Station[]> => {
    console.log('fetching train stops');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=1,2`);
    return (await res.json()).data as Station[];
  }, []);

  const refreshStationsData = useCallback(async () => {
    const dataPromises = [];
    dataPromises.push(fetchStationsFromMBTA());
    dataPromises.push(fetchBusStopsFromMBTA());

    Promise.all(dataPromises).then((data) => {
      const mergedData = data.flat();
      mergedData.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
      AsyncStorage.setItem(
        'stops',
        JSON.stringify({
          data: mergedData,
          timestamp: new Date().getTime(),
        })
      );
      setAllStations(mergedData);
    });
  }, [fetchBusStopsFromMBTA, fetchStationsFromMBTA]);

  useEffect(() => {
    (async () => {
      const storedStations = await AsyncStorage.getItem('stops');
      if (storedStations) {
        const parsedStations = JSON.parse(storedStations);
        // Use cache if it is less than 1 day old
        if (parsedStations.timestamp + 1000 * 60 * 60 * 24 > new Date().getTime()) {
          console.log('Using cached data');
          setAllStations(parsedStations.data);
        } else {
          refreshStationsData();
        }
      } else {
        refreshStationsData();
      }
    })();
  }, [refreshStationsData]);

  useEffect(() => {
    let types = [];
    if (settings.locationTypes.stations) types.push(null, 1, 2);
    if (settings.locationTypes.buses) types.push(3);
    setStations(allStations.filter((station) => types.includes(station.attributes.vehicle_type)));
  }, [allStations, settings]);

  useEffect(() => {
    (async () => {
      let { status } = await requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const locationSubscription = await watchPositionAsync({}, (locationData) => {
        setLocation(locationData);
      });

      // Clean up on unmount
      return () => {
        locationSubscription.remove();
      };
    })();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LocationContext value={location}>
        <SettingsContext value={[settings, setSettings]}>
          <StationsContext value={stations}>
            <TrackedStationsContext value={[trackedStations, setTrackedStations]}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </TrackedStationsContext>
          </StationsContext>
        </SettingsContext>
      </LocationContext>
    </ThemeProvider>
  );
}
