import { ReactNode, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { Button, ErrorMessage, FormField, Header, IconButton, Logo, Screen, Sheet, ui } from '../components/Base';
import { useAdoption } from '../../hooks/useAdoption';
import { useRecovery } from '../hooks/useRecovery';
import { fonts, theme } from '../theme';

interface AuthFrameProps { children: ReactNode; title: string; subtitle: string; }

/** Moldura de entrada e cadastro: faixa verde com a marca e painel claro com o formulário. */
function AuthFrame({ children, title, subtitle }: AuthFrameProps) {
  const router = useRouter();
  return (
    <Screen green>
      <View style={styles.topBar}>
        <IconButton filled name="arrow-back" label="Voltar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <Logo white mark size={40} />
      </View>
      <View style={styles.intro}>
        <Text style={styles.greeting}>{title}</Text>
        <Text style={styles.introText}>{subtitle}</Text>
      </View>
      <View style={styles.panel}>{children}</View>
    </Screen>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const app = useAdoption();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <AuthFrame title="Que bom ver você de novo." subtitle="Entre para favoritar, anunciar e adotar.">
      <FormField label="E-mail" placeholder="voce@email.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" value={email} onChangeText={setEmail} />
      <FormField label="Senha" placeholder="Sua senha" icon="lock-closed-outline" password autoCapitalize="none" autoComplete="current-password" textContentType="password" value={password} onChangeText={setPassword} />
      <Pressable accessibilityRole="button" onPress={() => { app.clearError(); router.push('/recover'); }} style={({ pressed }) => [styles.forgot, pressed ? styles.pressed : null]}>
        <Text style={styles.forgotText}>Esqueci a minha senha</Text>
      </Pressable>
      <ErrorMessage />
      <Button title="Entrar" busy={app.busy} onPress={async () => { if (await app.signIn(email, password)) router.replace('/feed'); }} />
      <View style={styles.switchRow}>
        <Text style={ui.caption}>Ainda não tem uma conta?</Text>
        <Pressable accessibilityRole="button" onPress={() => { app.clearError(); router.push('/register'); }} style={({ pressed }) => [styles.switchLink, pressed ? styles.pressed : null]}>
          <Text style={styles.switchText}>Cadastre-se</Text>
        </Pressable>
      </View>
    </AuthFrame>
  );
}

export function RegisterScreen() {
  const router = useRouter();
  const app = useAdoption();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [legal, setLegal] = useState(false);
  return (
    <AuthFrame title="Crie sua conta." subtitle="Leva menos de um minuto para começar.">
      <Text style={ui.caption}>Campos com * são obrigatórios.</Text>
      <FormField label="Nome completo *" icon="person-outline" value={name} onChangeText={setName} placeholder="Como podemos chamar você?" autoCapitalize="words" autoComplete="name" textContentType="name" />
      <FormField label="E-mail *" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="voce@email.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
      <FormField label="Telefone *" icon="call-outline" phone value={phone} onChangeText={setPhone} placeholder="(61) 99999-9999" />
      <FormField label="Senha *" icon="lock-closed-outline" value={password} onChangeText={setPassword} placeholder="Pelo menos 8 caracteres" password autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" />
      <FormField label="Confirmar senha *" icon="lock-closed-outline" value={confirmation} onChangeText={setConfirmation} placeholder="Repita sua senha" password autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={({ pressed }) => [styles.accept, pressed ? styles.pressed : null]}>
        <Ionicons name={accepted ? 'checkbox' : 'square-outline'} size={26} color={accepted ? theme.colors.primary : theme.colors.faint} />
        <Text style={styles.acceptText}>Li e aceito os Termos de Uso e a Política de Privacidade.</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => setLegal(true)} style={({ pressed }) => [styles.legalLink, pressed ? styles.pressed : null]}>
        <Text style={styles.switchText}>Consultar termos e privacidade</Text>
      </Pressable>
      <ErrorMessage />
      <Button title="Criar conta" busy={app.busy} onPress={async () => { if (await app.signUp({ name, email, phone, password, confirmation, accepted })) router.replace('/feed'); }} />
      <Sheet visible={legal} title="Termos e privacidade" onClose={() => setLegal(false)} footer={<Button title="Entendi" onPress={() => setLegal(false)} />}>
        <Text style={ui.body}>Protótipo acadêmico do AuDote! — UNICEPLAC. Nesta fase, os dados ficam no armazenamento local deste dispositivo. Não informe dados pessoais reais.</Text>
        <Text style={ui.body}>Adote com responsabilidade. Converse com o responsável, conheça as necessidades do animal e garanta um ambiente seguro.</Text>
        <Text style={ui.caption}>Texto provisório para demonstração. Os documentos jurídicos definitivos deverão ser aprovados antes da publicação.</Text>
      </Sheet>
    </AuthFrame>
  );
}

export function RecoveryScreen() {
  const router = useRouter();
  const flow = useRecovery();
  const { showAlert } = useAlert();
  const inputs = useRef<Array<TextInput | null>>([]);
  const [focusedCode, setFocusedCode] = useState(-1);
  const titles = ['Qual é o seu e-mail?', 'Digite o código', 'Crie uma nova senha'];
  const descriptions = ['Coloque seu e-mail para continuar a demonstração de recuperação.', 'Digite seis números para testar esta etapa. Nenhum código foi enviado por e-mail.', 'Coloque sua nova senha e confirme para concluir a demonstração.'];
  return (
    <Screen>
      <Header />
      <View style={styles.recovery}>
        <View style={styles.steps} accessibilityLabel={`Etapa ${flow.step + 1} de 3`}>
          {[0, 1, 2].map(step => <View key={step} style={[styles.step, step <= flow.step ? styles.stepDone : null]} />)}
        </View>
        <View style={styles.recoveryHead}>
          <Text style={ui.title}>{titles[flow.step]}</Text>
          <Text style={ui.body}>{descriptions[flow.step]}</Text>
        </View>
        {flow.step === 0 ? (
          <FormField label="E-mail" icon="mail-outline" placeholder="voce@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" value={flow.email} onChangeText={flow.setEmail} />
        ) : flow.step === 1 ? (
          <>
            <Text style={styles.codeLabel}>Código de 6 dígitos</Text>
            <View style={styles.codeRow}>
              {Array.from({ length: 6 }, (_, index) => (
                <TextInput
                  key={index}
                  ref={ref => { inputs.current[index] = ref; }}
                  accessibilityLabel={`Dígito ${index + 1} do código`}
                  style={[styles.codeInput, focusedCode === index ? styles.codeFocused : null, flow.code[index] ? styles.codeFilled : null]}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? 6 : 1}
                  value={flow.code[index] ?? ''}
                  onFocus={() => setFocusedCode(index)}
                  onBlur={() => setFocusedCode(-1)}
                  onChangeText={value => {
                    const digits = value.replace(/\D/g, '');
                    if (digits.length > 1) { flow.setCode(digits.slice(0, 6)); inputs.current[Math.min(5, digits.length)]?.focus(); }
                    else { const next = flow.code.split(''); next[index] = digits; flow.setCode(next.join('')); if (digits && index < 5) inputs.current[index + 1]?.focus(); }
                  }}
                  onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === 'Backspace' && !flow.code[index] && index > 0) inputs.current[index - 1]?.focus(); }}
                />
              ))}
            </View>
            <View style={styles.timer}>
              <Ionicons name="time-outline" size={16} color={flow.expired ? theme.colors.danger : theme.colors.subtle} />
              <Text style={styles.center}>Código expira em {Math.floor(flow.remaining / 60)}:{String(flow.remaining % 60).padStart(2, '0')}</Text>
            </View>
            {flow.expired ? <Text style={styles.expired}>O código expirou. Reenvie para continuar.</Text> : null}
          </>
        ) : (
          <>
            <FormField label="Nova senha" icon="lock-closed-outline" password autoComplete="new-password" textContentType="newPassword" value={flow.password} onChangeText={flow.setPassword} />
            <FormField label="Confirmar senha" icon="lock-closed-outline" password autoComplete="new-password" textContentType="newPassword" value={flow.confirmation} onChangeText={flow.setConfirmation} />
          </>
        )}
        <ErrorMessage />
        <Button
          title={['Enviar código', 'Verificar código', 'Redefinir senha'][flow.step]}
          busy={flow.busy}
          onPress={async () => {
            if (flow.step === 0) await flow.send();
            else if (flow.step === 1) await flow.verify();
            else if (await flow.resetPassword(flow.password, flow.confirmation)) {
              showAlert('Demonstração concluída', 'A senha não foi alterada em um servidor. O fluxo real será conectado na Fase 2.');
              router.replace('/login');
            }
          }}
        />
        {flow.step === 1 ? <Button secondary title="Reenviar código" busy={flow.busy} onPress={() => void flow.send()} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  intro: { paddingHorizontal: theme.spacing.xs, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.lg, gap: theme.spacing.sm },
  greeting: { fontSize: 36, lineHeight: 42, fontFamily: fonts.displayBold, color: theme.colors.white, letterSpacing: -0.8 },
  introText: { fontSize: theme.font.body, fontFamily: fonts.regular, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  panel: { backgroundColor: theme.colors.background, marginHorizontal: -theme.spacing.md, marginBottom: -theme.spacing.xl, padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl, borderTopLeftRadius: theme.radius.sheet + 8, borderTopRightRadius: theme.radius.sheet + 8, gap: theme.spacing.md, minHeight: 520 },
  forgot: { minHeight: 36, alignItems: 'flex-end', justifyContent: 'center', marginTop: -theme.spacing.sm },
  forgotText: { color: theme.colors.primary, fontSize: theme.font.small, fontFamily: fonts.bold },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  switchLink: { minHeight: 44, justifyContent: 'center' },
  switchText: { color: theme.colors.primary, fontSize: theme.font.small, fontFamily: fonts.bold },
  legalLink: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  center: { textAlign: 'center', color: theme.colors.subtle, fontSize: theme.font.small, fontFamily: fonts.regular, lineHeight: 20 },
  accept: { flexDirection: 'row', gap: theme.spacing.sm + 2, minHeight: 48, alignItems: 'center' },
  acceptText: { flex: 1, fontSize: theme.font.small, fontFamily: fonts.regular, color: theme.colors.text, lineHeight: 20 },
  recovery: { gap: theme.spacing.lg, paddingTop: theme.spacing.md },
  steps: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, height: 5, borderRadius: 3, backgroundColor: theme.colors.border },
  stepDone: { backgroundColor: theme.colors.primary },
  recoveryHead: { gap: theme.spacing.sm },
  codeLabel: { fontSize: theme.font.small, fontFamily: fonts.semibold, color: theme.colors.text },
  codeRow: { flexDirection: 'row', gap: theme.spacing.sm },
  codeInput: { flex: 1, minWidth: 0, height: 58, textAlign: 'center', borderRadius: theme.radius.field, backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, fontSize: theme.font.section, fontFamily: fonts.display, color: theme.colors.text },
  codeFocused: { borderColor: theme.colors.primary },
  codeFilled: { backgroundColor: theme.colors.primarySoft },
  timer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  expired: { color: theme.colors.danger, fontSize: theme.font.small, fontFamily: fonts.semibold, textAlign: 'center' },
  pressed: { opacity: 0.6 },
});
