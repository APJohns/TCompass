import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useEffect, useState } from 'react';

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

export const SettingsContext = createContext<[Settings, React.Dispatch<React.SetStateAction<Settings>> | null]>([
  defaultSettings,
  null,
]);
export const AllStationsContext = createContext<Station[]>([]);

export const TrackedStationsContext = createContext<[string[], React.Dispatch<React.SetStateAction<string[]>> | null]>([
  [],
  null,
]);

export default function RootLayout() {
  AsyncStorage.clear();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [stations, setStations] = useState<Station[]>([]);
  const [trackedStations, setTrackedStations] = useState<string[]>([]);

  const fetchBusStopsFromMBTA = useCallback(async (): Promise<Station[]> => {
    console.log('fetching bus stops');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=0&filter[route_type]=3`);
    return (await res.json()).data as Station[];
  }, []);

  const fetchStationsFromMBTA = useCallback(async (): Promise<Station[]> => {
    console.log('fetching stations');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=1,2`);
    return (await res.json()).data as Station[];
  }, []);

  const refreshStationsData = useCallback(async () => {
    const dataPromises = [];
    if (settings.locationTypes.stations) dataPromises.push(fetchStationsFromMBTA());
    if (settings.locationTypes.buses) dataPromises.push(fetchBusStopsFromMBTA());

    Promise.all(dataPromises).then((data) => {
      const mergedData = data.flat();
      mergedData.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
      AsyncStorage.setItem(
        'stations',
        JSON.stringify({
          data: mergedData,
          timestamp: new Date().getTime(),
        })
      );
      setStations(mergedData);
    });
  }, [fetchBusStopsFromMBTA, fetchStationsFromMBTA, settings]);

  useEffect(() => {
    (async () => {
      const storedStations = await AsyncStorage.getItem('stations');
      if (storedStations) {
        const parsedStations = JSON.parse(storedStations);
        // Use cache if it is less than 1 day old
        if (parsedStations.timestamp + 1000 * 60 * 60 * 24 > new Date().getTime()) {
          console.log('Using cached stations');
          setStations(parsedStations.data);
        } else {
          refreshStationsData();
        }
      } else {
        refreshStationsData();
      }
    })();
  }, [refreshStationsData]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SettingsContext value={[settings, setSettings]}>
        <AllStationsContext value={stations}>
          <TrackedStationsContext value={[trackedStations, setTrackedStations]}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </TrackedStationsContext>
        </AllStationsContext>
      </SettingsContext>
    </ThemeProvider>
  );
}
