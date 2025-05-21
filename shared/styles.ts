import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  marker: {
    height: 25,
    borderRadius: '50%',
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    aspectRatio: '1/1',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 16,
    gap: 24,
  },
  switchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
