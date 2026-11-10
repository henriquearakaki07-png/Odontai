# ODONTOAI — PACOTE DE PUBLICAÇÃO (10/11/2026)

## Entregue
- `backend/`: aplicativo web com agendamento, área do dentista e política de privacidade; Node.js >=22.5 + SQLite.
- `android/`: projeto Android Studio (WebView proprietário) com `targetSdk=36`, pronto **para configuração e compilação**, NÃO um AAB já compilado.
- `play_store/`: ícone 512x512, banner 1024x500, capturas da interface (o painel usa dados FICTÍCIOS de demonstração).
- `teste_api.py`: teste automatizado do funcionamento básico do servidor.

## Passos indispensáveis antes de publicar
1. **Hospedagem**: publique a pasta `backend/` num servidor com Node.js 22.5+, HTTPS, arquivo SQLite em armazenamento persistente e backups. Defina `DENTIST_PASSWORD`, `SECRET` e opcionalmente `DB_FILE`. Não publique chaves ou senhas no repositório. O app não funciona em rede sem servidor.
2. **Clínica**: ajuste a tabela `PROC` e os horários `HOURS` no **servidor e no HTML** (existem em ambos), confirmando valores reais, dias abertos e regras de atendimento. O sistema atual atende uma clínica com agenda única, NÃO múltiplas clínicas independentes.
3. **Política de privacidade**: identifique o controlador dos dados e a clínica, revise a base legal, tratamento, retenção, suporte e atendimento das solicitações de exclusão. Publique a versão final em `https://seu-dominio/privacidade`. O texto incluído ainda requer validação jurídica/operacional; não declare conformidade sem verificação.
4. **Android**: abra `android/` no Android Studio; altere `app/src/main/res/values/strings.xml`, substituindo `https://SEU-DOMINIO-AQUI.example` pelo endereço HTTPS real (sem caminho final). Ajuste o `applicationId` se a identificação `com.odontai.agenda` não estiver disponível ou não for sua.
5. **Teste** em celulares reais: agendar, negar horário duplicado, cancelar, login do dentista, internet offline, persistência após reiniciar backend, tela responsiva, acessibilidade, exclusão e solicitações LGPD.
6. **Assinatura/AAB**: Android Studio > Build > Generate Signed Bundle / APK > Android App Bundle; crie ou selecione sua chave de assinatura e configure Play App Signing. Guarde a keystore e credenciais.
7. **Play Console**: crie app, envie AAB, preencha nome/descrições/ícone/banner/capturas, classificação, público, declaração de dados e URL de privacidade; se a conta pessoal for nova (após 13/11/2023), poderá ser exigido teste fechado com 12 testadores por 14 dias consecutivos antes de solicitar produção.

## Não incluído / não validado
- Não há arquivo `.aab` ou `.apk` porque o ambiente de preparação não tem Android SDK/Gradle instalado e o domínio HTTPS/assinatura não foram fornecidos.
- Não foi realizada compilação nem testes em aparelhos Android; aprovação do Google não é garantida.
- Hospedagem, domínio, conta Play Console, identidade jurídica do controlador de dados e keystore dependem do proprietário.
- O sistema usa autenticação administrativa única, configurações fixas de uma clínica e não tem gestão robusta de usuários, exportação ou exclusão automática de todos os dados; faça revisão de segurança e privacidade para operação real.

## Comandos de teste do backend
```
cd backend
export DENTIST_PASSWORD='uma-senha-forte'
export SECRET='segredo-grande-aleatorio'
export DB_FILE='./odontai.db'
npm start
```
Acesse `http://localhost:3000` durante o desenvolvimento. HTTPS é obrigatório em produção.

## Fonte de políticas
- API 36 para novos apps após 31/08/2026: https://support.google.com/googleplay/android-developer/answer/11926878?hl=pt-br
- Teste fechado contas pessoais novas: https://support.google.com/googleplay/android-developer/answer/14151465?hl=pt-br
- Políticas gerais: https://support.google.com/googleplay/android-developer/answer/18265346
