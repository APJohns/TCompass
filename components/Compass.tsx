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
}

export default function Compass({ heading, location, stations }: Props) {
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
        }}
      >
        <ThemedText style={styles.cardinalLetter}>W</ThemedText>
        <ThemedText style={styles.cardinalLetter}>E</ThemedText>
      </View>
      <ThemedText style={styles.cardinalLetter}>S</ThemedText>
      {stations.map((station, index) => (
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
              {index + 1}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardinalLetter: {
    fontSize: 24,
  },
});
