<<<<<<< HEAD
# AuDote!

Transforme uma espera em um lar.

Protótipo acadêmico mobile de adoção responsável — UNICEPLAC, Distrito Federal.

## Estado da entrega

**Fase 1 — Fundação.** Todas as telas solicitadas são navegáveis com dados locais. Nenhum Supabase Auth, envio de e-mail, upload remoto ou proteção por RLS está ativo. Os fluxos demonstrativos são identificados na interface. Não use dados pessoais reais.

Não é uma aplicação pronta para produção: autenticação e autorização locais servem apenas para demonstrar comportamentos. A privacidade real e as regras de negócio no banco dependem das Fases 2–4.

## Rodar a partir do GitHub

1. Instale Node.js LTS e npm na máquina de desenvolvimento (não há servidor Node no aplicativo).
2. Clone o repositório e execute `npm install`.
3. Caso o instalador do OnSpace ainda não tenha registrado as dependências detectadas no pacote exportado, execute `npx expo install @react-native-async-storage/async-storage expo-image-picker @supabase/supabase-js`.
4. Execute `npx expo start`.
5. Abra no Expo Go para Android/iOS ou use `npx expo start --web` para a versão web.
6. Validação estática: `npx tsc --noEmit`.

É necessário acesso à internet para carregar as fotos de demonstração e as logos fornecidas. Os assets são centralizados em `src/theme/index.ts` e usam `expo-image`. As imagens originais estão referenciadas por URL; o empacotamento offline é uma pendência da revisão.

Os comandos de compilação, testes e preview em dispositivos físicos não foram executados por esta entrega; valide no ambiente de desenvolvimento da equipe.

## Identidade visual (reformulação do front-end)

Paleta verde-folha com acentos em mel e coral (favoritos), tipografia Fraunces (títulos) + Inter (interface), cantos arredondados, sombras suaves e barra de navegação inferior nas telas principais. Tokens em `src/theme/index.ts`; componentes compartilhados em `src/components` (`Base`, `BottomNav`, `FavoriteButton`, `PetCard`). Nenhum serviço, hook, rota ou dado foi alterado. Adicionada a dependência `@expo-google-fonts/fraunces` (a fonte Inter já constava no projeto).

## Dependências e justificativa

- Expo Router: navegação única adotada pelo template; arquivos de rota apenas encaminham para `src/screens`.
- `expo-image`: imagens compatíveis com Expo e cache; exigido pelo ambiente.
- `@expo/vector-icons`: ícones minimalistas, sem assets artificiais.
- `react-native-safe-area-context` e `expo-status-bar`: respeitam áreas seguras e barras do sistema.
- `@react-native-async-storage/async-storage`: persistência dos dados de demonstração no dispositivo e futuro armazenamento de sessão. Não armazena senhas.
- `expo-image-picker`: seleção nativa/web de fotos para os formulários e avatar. Na Fase 1 retorna arquivos locais, não faz upload.
- `@supabase/supabase-js`: fronteira tipada para o cliente compatível com Supabase nas próximas fases; não é usado pelos serviços locais.

Nenhuma biblioteca de navegação paralela, UI, fontes ou backend próprio foi adicionada. O ambiente OnSpace detecta dependências pelos imports; o manifesto protegido não foi modificado manualmente.

## Variáveis de ambiente

A Fase 1 roda **sem credenciais**. `.env.example` contém os nomes reservados para as próximas fases:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Copie para `.env` somente ao conectar a integração real. Use exclusivamente URL e chave pública anon. Nunca use `service_role`, segredos ou senhas no código cliente. `src/lib/supabase.ts` retorna cliente nulo quando as variáveis não estão presentes. Preencher as variáveis não muda automaticamente o modo de demonstração.

Este projeto OnSpace foi criado com **OnSpace Cloud**, compatível com a API Supabase. O backend deste workspace não pode ser trocado por uma instância Supabase externa dentro do OnSpace. Essa configuração deve ser confirmada antes da Fase 2. O código exportado mantém a fronteira de cliente isolada.

## Arquitetura

```text
app/                      Rotas Expo Router (exports default exigidos pelo Router)
contexts/                 Provider de estado global
hooks/                    Consumidor do contexto
constants/                Compatibilidade dos tokens com o template
src/screens/              Telas, sem chamadas diretas de dados
src/components/           Componentes reutilizáveis
src/navigation/           Único Stack Navigator
src/services/             Serviços locais e processamento dos dados
src/hooks/                Lógica de busca, filtros, fotos e formulários
src/lib/supabase.ts        Cliente futuro, isolado dos serviços locais
src/types/                Entidades e contratos tipados
src/theme/                Cores, espaçamento, tipografia e assets
src/utils/                Validações
```

Fluxo: **Serviços → Provider/Hooks → Componentes → Rotas**. Favoritos, anúncios, perfil e interesses usam a mesma fonte compartilhada, sem precisar atualizar a tela. Os métodos assíncronos de `adoptionService` são a fronteira a ser mantida ao trocar a implementação por Supabase; `filterPets` é processamento puro de apresentação.

## Demonstração local

- Na entrada, use **Conhecer os animais** para navegar sem sessão.
- **MOCK LOGIN**: qualquer e-mail válido e senha com pelo menos 8 caracteres abrem uma sessão demonstrativa. Não há credencial real ou conta predefinida.
- Cadastro valida nome, e-mail, telefone BR, senha, confirmação e aceite. Não envia e-mail e não guarda a senha.
- Recuperação exibe três etapas. Nenhum código é enviado; seis números quaisquer testam a etapa, com expiração local de cinco minutos. A senha não é realmente alterada.
- Login social está fora do MVP; os botões apenas informam **Em breve**, sem integração.
- Há 12 animais ilustrativos: quatro cães, quatro gatos, quatro aves, regiões do DF, um adotado e um indisponível. As fotos de banco de imagens são ilustrativas, não anúncios reais.
- Busca por nome e filtros por espécie, idade, sexo, porte, região e características funcionam sobre a lista local.
- Favoritos ficam vinculados ao identificador da sessão demonstrativa.
- Menu: Editar perfil e Configurações abrem a mesma tela. Favoritos e Meus animais são acessíveis por esse menu.
- Fotos escolhidas são URIs locais. Arquivos podem deixar de existir após reinstalação, limpeza de cache ou mudança de dispositivo. Upload persistente será conectado nas próximas fases.
- Publicação e edição usam `PetForm`; status pode ser alterado em **Meus animais → Editar / alterar status**.
- Interesse requer sessão e animal disponível. Os animais do seed não têm telefone inventado: o fluxo informa que não há contato configurado. Um anúncio criado localmente revela seu contato após interesse de outra sessão demonstrativa, permitindo abrir o link `wa.me`.
- Dados são persistidos com a chave `audote-foundation-v1`. Para reiniciar a demonstração, limpe os dados do app ou o armazenamento do site. Não há sincronização entre dispositivos.
- O endereço privado pertence somente ao perfil. Ele não é colocado no objeto Pet nem no perfil público do responsável. Isso ainda não substitui RLS no banco.

## Recuperação de senha real (pendência Fase 2)

Na integração Auth, ajustar o template de recuperação do provedor para mostrar `{{ .Token }}` no e-mail, em vez de depender exclusivamente de `{{ .ConfirmationURL }}`; configurar o tamanho OTP em seis dígitos e a expiração em 300 segundos. Validar o código com o tipo de recuperação e só então atualizar a senha da sessão recuperada. A verificação, expiração e reenvio deverão ser garantidos pelo servidor; a contagem na interface é apenas informativa. Confirmação de alteração de e-mail também será habilitada no provedor.

## Checklist desta fase

- [x] Tema baseado nos tokens e referências fornecidas.
- [x] Pré-login, login, cadastro e recuperação em três etapas navegáveis.
- [x] Feed, filtros, detalhe e favoritos com fonte compartilhada local.
- [x] Perfil com modais, avatar local e menu unificado.
- [x] Cadastro, edição e alteração de status de animais locais.
- [x] Estados de carregamento, vazio e mensagens de erro em português.
- [x] Safe areas, tratamento de teclado e contêiner centralizado de até 480px.
- [ ] Testes reais em 360px, Android, iOS e Expo Web.
- [ ] Supabase Auth, confirmação de e-mail, OTP e Storage real.
- [ ] PostgreSQL, constraints, view pública, RLS e buckets.
- [ ] `supabase/migrations/001_init.sql` com esquema e seed — entrega da Fase 5, após integração e revisão das políticas.
- [ ] Checklist de aceite integrado e revisão final do README.

## Próximas fases (aguardar autorização)

2. Autenticação e perfil: sessão, OTP, confirmação de e-mail e upload de avatar.
3. Animais: serviços Supabase para feed, filtros, detalhe e favoritos.
4. Publicação/edição, interesses, contato e regras RLS completas.
5. Revisão final, migração SQL, documentação e checklist de aceite.

**Execução pausada ao final da Fase 1. Só avançar quando o usuário escrever `continuar`.**
=======
# <img src="./docs/AuDote!_Logo.png" width="50" height="50" align="absmiddle" /> AuDote!

**Slogan:** Transforme uma espera em um lar.

## 📖 Justificativa do Projeto
O processo de adoção de animais frequentemente sofre com a falta de centralização de informações e dificuldades de comunicação entre abrigos/protetores e possíveis adotantes. O **AuDote!** nasce para resolver esse problema, oferecendo uma plataforma multiplataforma para Android e iOS que conecta de forma prática, rápida e segura pessoas interessadas em adotar com animais que precisam de um lar. Através de um ambiente amigável e com filtros específicos de porte, idade, localização, buscamos reduzir o tempo de espera dos animais nos abrigos e incentivar a adoção responsável.

## 👥 Integrantes da Equipe
* **Luann Thayller Aguiar de Sousa** (0023194) - Gerente de Projeto, Dev Front-End, UI/UX
* **Luisa Damaceno Aragão** (0016112) - Analista de Requisitos
* **Weney Anjos da Silva** (0023218) - Dev Back-End, Data Engineer
* **Gabryel Henrique Pereira de Souza** (0022470)
* **Érica Beatriz de Araújo Lopes** (0022515) - Analista de Requisitos, UI/UX
* **Gabriel Nonato da Silva** (0020241) - Dev Back-End, UI/UX
* **Ana Luiza Jesus da Silva** (0022735) - Analista de Requisitos

## 🎥 Vídeo Pitch
[Link para o Vídeo Pitch no YouTube](https://youtu.be/GmXs8nrd750)

## 📄 Documentação
* O [Documento de Visão](./docs/AuDote!_visao.pdf) completo encontra-se na pasta `/docs`.
* A [Logo Oficial](./docs/AuDote!_Logo.png) (e sua versão em vetor `.svg`) também se encontra na mesma pasta.
>>>>>>> origin/main
