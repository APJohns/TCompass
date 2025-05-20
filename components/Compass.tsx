import { Station } from '@/app/_layout';
import { Colors } from '@/constants/Colors';
import globalStyles from '@/shared/styles';
import { getDistanceBetweenCoordinatesInMiles, getHeadingBetweenCoordinates } from '@/shared/utils';
import { LocationObject } from 'expo-location';
import { DimensionValue, StyleSheet, useColorScheme, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props {
  heading: number;
  location: LocationObject;
  stations: Station[];
  markerNumbers: { [key: string]: number };
}

export default function Compass({ heading, location, stations, markerNumbers }: Props) {
  const colorScheme = useColorScheme() ?? 'light';

  const getRadius = (station: Station) => {
    const edge = 0.094697; // 500 ft in miles
    const distance = getDistanceBetweenCoordinatesInMiles(
      location.coords.latitude,
      location.coords.longitude,
      station.attributes.latitude,
      station.attributes.longitude
    );
    return ((distance < edge ? ((edge - distance) / edge) * 50 : 0) + '%') as DimensionValue;
  };

  return (
    <View>
      <View
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          aspectRatio: '1/1',
          borderWidth: 2,
          borderStyle: 'dotted',
          borderColor: Colors[colorScheme].text,
          borderRadius: '50%',
          paddingHorizontal: 16,
          paddingVertical: 8,
          transform: [{ rotate: `-${heading}deg` }],
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: -28,
            borderColor: 'transparent',
            borderBottomColor: 'red',
            borderWidth: 12,
            borderLeftWidth: 8,
            borderRightWidth: 8,
          }}
        />
        <ThemedText style={styles.cardinalLetter}>N</ThemedText>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignSelf: 'stretch',
            alignItems: 'center',
          }}
        >
          <ThemedText style={styles.cardinalLetter}>W</ThemedText>
          <ThemedText style={styles.cardinalLetter}>E</ThemedText>
        </View>
        <ThemedText style={styles.cardinalLetter}>S</ThemedText>
        {stations.map((station) => (
          <View
            key={station.id}
            style={{
              position: 'absolute',
              inset: getRadius(station),
              alignItems: 'center',
              transform: [
                {
                  rotate: `${getHeadingBetweenCoordinates(
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
              <ThemedText type="small" style={{ fontWeight: 'bold', color: 'black' }}>
                {markerNumbers[station.id]}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Decor */}
      <ThemedText
        type="small"
        style={{
          position: 'absolute',
          top: -12,
          left: '25%',
          color: '#aaa',
        }}
      >
        500&apos;
      </ThemedText>
      <View
        style={{
          position: 'absolute',
          inset: '25%',
          borderRadius: '50%',
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <ThemedText type="small" style={{ color: '#aaa' }}>
          250&apos;
        </ThemedText>
      </View>
      <View
        style={{
          position: 'absolute',
          top: '49%',
          left: '49%',
          width: '2%',
          height: '2%',
          backgroundColor: Colors[colorScheme].tint,
          borderRadius: '50%',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardinalLetter: {
    fontSize: 24,
  },
});
