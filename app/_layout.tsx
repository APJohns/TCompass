import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationObject, requestForegroundPermissionsAsync, watchPositionAsync } from 'expo-location';
import { createContext, useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface Stop {
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
    stops: boolean;
  };
}

const defaultSettings: Settings = {
  locationTypes: {
    buses: false,
    stops: true,
  },
};

export const LocationContext = createContext<LocationObject | null>(null);

export const SettingsContext = createContext<[Settings, React.Dispatch<React.SetStateAction<Settings>> | null]>([
  defaultSettings,
  null,
]);
export const StopsContext = createContext<Stop[]>([]);

export const TrackedStopsContext = createContext<[string[], React.Dispatch<React.SetStateAction<string[]>> | null]>([
  [],
  null,
]);

export default function RootLayout() {
  // AsyncStorage.clear();
  const colorScheme = useColorScheme();

  const [location, setLocation] = useState<LocationObject | null>(null);

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [allStops, setAllStops] = useState<Stop[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [trackedStops, setTrackedStops] = useState<string[]>([]);

  const fetchBusStopsFromMBTA = useCallback(async (): Promise<Stop[]> => {
    console.log('fetching bus stops');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=0&filter[route_type]=3`);
    return (await res.json()).data as Stop[];
  }, []);

  const fetchStopsFromMBTA = useCallback(async (): Promise<Stop[]> => {
    console.log('fetching train stops');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=1,2`);
    return (await res.json()).data as Stop[];
  }, []);

  const refreshStopsData = useCallback(async () => {
    const dataPromises = [];
    dataPromises.push(fetchStopsFromMBTA());
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
      setAllStops(mergedData);
    });
  }, [fetchBusStopsFromMBTA, fetchStopsFromMBTA]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        refreshStopsData();
        return;
      }
      const storedStops = await AsyncStorage.getItem('stops');
      if (storedStops) {
        const parsedStops = JSON.parse(storedStops);
        // Use cache if it is less than 1 day old
        if (parsedStops.timestamp + 1000 * 60 * 60 * 24 > new Date().getTime()) {
          console.log('Using cached data');
          setAllStops(parsedStops.data);
        } else {
          refreshStopsData();
        }
      } else {
        refreshStopsData();
      }
    })();
  }, [refreshStopsData]);

  useEffect(() => {
    let types = [];
    if (settings.locationTypes.stops) types.push(null, 1, 2);
    if (settings.locationTypes.buses) types.push(3);
    setStops(allStops.filter((stop) => types.includes(stop.attributes.vehicle_type)));
  }, [allStops, settings]);

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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LocationContext value={location}>
        <SettingsContext value={[settings, setSettings]}>
          <StopsContext value={stops}>
            <TrackedStopsContext value={[trackedStops, setTrackedStops]}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </TrackedStopsContext>
          </StopsContext>
        </SettingsContext>
      </LocationContext>
    </ThemeProvider>
  );
}
