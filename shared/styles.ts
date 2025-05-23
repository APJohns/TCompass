import { StyleSheet } from 'react-native';

const marker = StyleSheet.create({
  marker: {
    height: 25,
    borderRadius: '50%',
    borderColor: 'black',
    borderWidth: 2,
    aspectRatio: '1/1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StyleSheet.create({
  busMarker: {
    ...marker.marker,
    backgroundColor: '#f2ad25',
  },
  trainMaker: {
    ...marker.marker,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 32,
  },
  switches: {
    flex: 1,
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
