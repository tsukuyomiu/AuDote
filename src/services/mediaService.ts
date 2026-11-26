import * as ImagePicker from 'expo-image-picker';
export async function selectPhotos(multiple = false): Promise<string[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Permita o acesso às fotos nas configurações do dispositivo.');
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: multiple, quality: 0.8, selectionLimit: multiple ? 5 : 1 });
  return result.canceled ? [] : result.assets.map(asset => asset.uri);
}
