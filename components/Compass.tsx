import { Station } from '@/app/(tabs)';
import globalStyles from '@/assets/styles';
import { LocationObject } from 'expo-location';
import { Platform, useColorScheme, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props {
  heading: number;
  location: LocationObject;
  stations: Station[];
}

export default function Compass({ heading, location, stations }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const compassBorderColor = { light: '#A1CEDC', dark: '#1D3D47' };

  const getHeadingBetweenCoordinates = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = lon2 - lon1;
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = Math.atan2(y, x);
    const brngInDegrees = (brng * 180) / Math.PI; // Convert to degrees
    return (brngInDegrees + 360) % 360; // Normalize to 0-360
  };

  return (
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
            inset: 116 - index * 28,
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
          <View style={globalStyles.marker}>
            <ThemedText type="small" style={{ fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' }}>
              {index + 1}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}
