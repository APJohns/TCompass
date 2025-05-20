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

export const AllStationsContext = createContext<Station[]>([]);

export const TrackedStationsContext = createContext<[string[], React.Dispatch<React.SetStateAction<string[]>> | null]>([
  [],
  null,
]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [trackedStations, setTrackedStations] = useState<string[]>([]);

  const fetchStationsFromMBTA = useCallback(async (): Promise<Station[]> => {
    console.log('fetching stations');
    const res = await fetch(`https://api-v3.mbta.com/stops?filter[location_type]=2`);
    return (await res.json()).data as Station[];
  }, []);

  const refreshStationsData = useCallback(async () => {
    const data = await fetchStationsFromMBTA();
    AsyncStorage.setItem(
      'stations',
      JSON.stringify({
        data,
        timestamp: new Date().getTime(),
      })
    );
    setStations(data);
  }, [fetchStationsFromMBTA]);

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
      <AllStationsContext value={stations}>
        <TrackedStationsContext value={[trackedStations, setTrackedStations]}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </TrackedStationsContext>
      </AllStationsContext>
    </ThemeProvider>
  );
}
