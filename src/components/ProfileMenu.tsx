import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, ListRow, Sheet, ui } from './Base';
import { useAdoption } from '../../hooks/useAdoption';
import { theme } from '../theme';

interface ProfileMenuProps { visible: boolean; onClose: () => void; }

export function ProfileMenu({ visible, onClose }: ProfileMenuProps) {
  const router = useRouter();
  const { data } = useAdoption();
  const navigate = (path: '/profile' | '/favorites' | '/my-pets' | '/login') => { onClose(); router.push(path); };
  return (
    <Sheet
      visible={visible}
      title={data.signedIn ? data.profile?.display_name ?? 'Seu perfil' : 'Seu espaço no AuDote'}
      onClose={onClose}
      footer={!data.signedIn ? <Button title="Entrar" onPress={() => navigate('/login')} /> : undefined}
    >
      {!data.signedIn ? <Text style={ui.body}>Entre para salvar favoritos, publicar animais e acompanhar seus interesses.</Text> : null}
      <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' }}>
        <ListRow icon="person-outline" title="Editar perfil" onPress={() => navigate('/profile')} />
        <ListRow icon="settings-outline" title="Configurações" onPress={() => navigate('/profile')} />
        <ListRow icon="heart-outline" title="Favoritos" onPress={() => navigate('/favorites')} />
        <ListRow icon="paw-outline" title="Meus animais" onPress={() => navigate('/my-pets')} />
      </View>
    </Sheet>
  );
}
