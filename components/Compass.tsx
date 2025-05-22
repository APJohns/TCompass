import { Stop } from '@/app/_layout';
import { Colors } from '@/constants/Colors';
import globalStyles from '@/shared/styles';
import { getDistanceBetweenCoordinatesInMiles, getHeadingBetweenCoordinates } from '@/shared/utils';
import { LocationObject } from 'expo-location';
import { useEffect, useState } from 'react';
import { DimensionValue, StyleSheet, useColorScheme, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props {
  heading: number;
  location: LocationObject;
  stops: Stop[];
  markerNumbers: { [key: string]: number };
}

export default function Compass({ heading, location, stops, markerNumbers }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const radius = 0.094697; // 500 ft in miles

  const [pointSize, setPointSize] = useState(3);

  const toPercent = (distance: number) => {
    return (distance / radius) * 50;
  };

  const getRadius = (stop: Stop) => {
    const distance = getDistanceBetweenCoordinatesInMiles(
      location.coords.latitude,
      location.coords.longitude,
      stop.attributes.latitude,
      stop.attributes.longitude
    );
    return (toPercent(Math.max(radius - distance, radius * -0.2)) + '%') as DimensionValue;
  };

  useEffect(() => {
    const percent = toPercent((location.coords.accuracy || 0) / 1609);
    setPointSize(percent < 6 ? 3 : percent);
  }, [location.coords.accuracy]);

  return (
    <View
      style={{
        margin: '2%',
      }}
    >
      {/* Decor */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          justifyContent: 'center',
        }}
      >
        <ThemedText
          type="small"
          style={{
            padding: 8,
            color: '#aaa',
          }}
        >
          500&apos;
        </ThemedText>
      </View>
      <View
        style={{
          position: 'absolute',
          inset: '25%',
          borderRadius: '50%',
          borderWidth: 1,
          borderColor: '#ddd',
          justifyContent: 'center',
        }}
      >
        <ThemedText type="small" style={{ color: '#aaa', padding: 8 }}>
          250&apos;
        </ThemedText>
      </View>
      {/* Accuracy Ring */}
      <View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          overflow: 'hidden',
          borderRadius: '50%',
          borderWidth: 2,
          borderColor: 'white',
          boxSizing: 'content-box',
          width: (pointSize + '%') as DimensionValue,
          height: (pointSize + '%') as DimensionValue,
          transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
          backgroundColor: Colors[colorScheme].tint,
          opacity: toPercent((location.coords.accuracy || 0) / 1609) < 6 ? 1 : 0.25,
        }}
      />

      {/* Compass */}
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
        {stops.map((stop) => (
          <View
            key={stop.id}
            style={{
              position: 'absolute',
              inset: getRadius(stop),
              alignItems: 'center',
              transform: [
                {
                  rotate: `${getHeadingBetweenCoordinates(
                    location?.coords.latitude,
                    location?.coords.longitude,
                    stop?.attributes.latitude,
                    stop?.attributes.longitude
                  )}deg`,
                },
              ],
            }}
          >
            <View style={stop.attributes.vehicle_type === 3 ? globalStyles.busMarker : globalStyles.trainMaker}>
              <ThemedText
                type="small"
                style={{
                  fontWeight: 'bold',
                  color: 'black',
                  transform: [
                    {
                      rotate:
                        heading -
                        getHeadingBetweenCoordinates(
                          location?.coords.latitude,
                          location?.coords.longitude,
                          stop?.attributes.latitude,
                          stop?.attributes.longitude
                        ) +
                        'deg',
                    },
                  ],
                }}
              >
                {markerNumbers[stop.id]}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardinalLetter: {
    fontSize: 24,
  },
});
