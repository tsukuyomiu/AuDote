import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { Button, EmptyState, Header, LoadingState, Screen } from '../components/Base';
import { PetForm } from '../components/PetForm';
import { usePetForm } from '../hooks/usePetForm';

export function PublishScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const form = usePetForm(id);
  const router = useRouter();
  const { showAlert } = useAlert();
  return (
    <Screen>
      <Header title={id ? 'Editar animal' : 'Cadastrar animal'} />
      {form.loading ? (
        <LoadingState />
      ) : !form.data.signedIn ? (
        <EmptyState icon="log-in-outline" title="Uma história começa com você" message="Entre para cadastrar e cuidar dos seus anúncios." action={<Button title="Entrar" onPress={() => router.push('/login')} />} />
      ) : id && (!form.pet || form.pet.owner_id !== form.data.profile?.id) ? (
        <EmptyState icon="lock-closed-outline" title="Anúncio não disponível" message="Você só pode editar os seus próprios animais." />
      ) : (
        <PetForm
          form={form}
          editing={Boolean(id)}
          onCancel={() => (router.canGoBack() ? router.back() : router.replace('/feed'))}
          onSubmit={async () => {
            if (await form.save()) {
              showAlert(id ? 'Alterações salvas' : 'Animal publicado', 'O anúncio foi salvo localmente nesta demonstração.');
              router.replace('/my-pets');
            }
          }}
        />
      )}
    </Screen>
  );
}
