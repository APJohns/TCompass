import { LocationContext, Stop } from '@/app/_layout';
import globalStyles from '@/shared/styles';
import { getDistanceBetweenCoordinatesInMiles } from '@/shared/utils';
import { memo, useContext } from 'react';
import { FlatList, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props {
  stops: Stop[];
  markerNumbers: { [key: string]: number };
}

const MarkerList = memo(({ stops, markerNumbers }: Props) => {
  const location = useContext(LocationContext);

  const getMarkerDistance = (stop: Stop) => {
    if (location) {
      const miles = getDistanceBetweenCoordinatesInMiles(
        location.coords.latitude,
        location.coords.longitude,
        stop.attributes.latitude,
        stop.attributes.longitude
      );
      return miles * 5280 <= 1000 ? (miles * 5280).toFixed(0) + ' ft' : miles.toPrecision(2) + ' mi';
    }
  };

  return (
    <FlatList
      data={stops}
      renderItem={({ item }) => (
        <View style={{ paddingVertical: 8, flexDirection: 'row', gap: 12, alignItems: 'baseline' }}>
          <View style={item.attributes.vehicle_type === 3 ? globalStyles.busMarker : globalStyles.trainMaker}>
            <ThemedText type="small" style={{ fontWeight: 'bold', color: 'black' }}>
              {markerNumbers[item.id]}
            </ThemedText>
          </View>
          <ThemedText style={{ flexShrink: 1 }}>{item.attributes.name}</ThemedText>
          <ThemedText style={{ marginLeft: 'auto' }} type="small">
            {getMarkerDistance(item)}
          </ThemedText>
        </View>
      )}
    />
  );
});

MarkerList.displayName = 'MakerList';
export default MarkerList;
