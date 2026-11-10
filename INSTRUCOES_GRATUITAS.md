# Odontoai 1.2 — desenvolvimento gratuito até a publicação

## O que foi preparado
- Projeto Android para API 36, com APK de teste e **AAB assinado** gerados pelo GitHub Actions quando estiverem configurados.
- Back-end Node/SQLite original, com controle dos agendamentos e exclusão pelos pacientes.
- Materiais da página do aplicativo (em `play_store/`).
- O repositório NÃO inclui senhas, chaves de assinatura nem hospedagem.

## 1. Teste grátis no GitHub Actions
1. Crie uma conta GitHub gratuita e um **repositório privado** chamado `odontai`.
2. Envie o conteúdo **desta pasta** para a raiz do repositório. A pasta `.github/workflows` precisa estar na raiz.
3. Na guia **Actions**, escolha **Odontoai Android - APK e AAB** > **Run workflow**.
4. Depois da execução, abra a execução e faça download do artefato `Odontoai-APK-teste`.
5. Esse APK pode ser instalado no seu Android para testar o WebView, mas **sem um domínio HTTPS configurado abrirá uma tela explicativa, não o agendamento**.
6. Os minutos do GitHub Actions têm limites conforme o plano da conta. Não precisa contratar serviço para começar se o uso ficar dentro da franquia.

## 2. Servidor online (sem pagamento no desenvolvimento)
O backend precisa de Node.js 22.5+, HTTPS, banco em disco **persistente** e backups. Hospedagem grátis que apaga disco ou hiberna pode ser útil para demonstração, mas **não serve para armazenar agendamentos reais**. Uma alternativa sem contratar hospedagem é testar o servidor em seu próprio computador, embora isso não ofereça disponibilidade pública segura. Não receber dados de pacientes reais até validar operação, LGPD e backups.

## 3. Coloque a URL no APK (quando tiver servidor funcionando)
No GitHub, entre em **Settings > Secrets and variables > Actions > Variables**, crie:
- `ODONTOAI_APP_URL` = URL HTTPS pública completa (ex.: `https://seudominio.com`).

Execute novamente o workflow. O APK de teste carregará esse endereço. A URL é embutida no build e precisa estar ativa.

## 4. Gerar AAB para a Play Store somente quando estiver pronto
No próprio computador com Java / Android Studio, gere uma chave **privada de upload**:

```
keytool -genkeypair -v -keystore odontai-upload.jks -alias odontai-upload -keyalg RSA -keysize 3072 -validity 10000
```

Guarde esse arquivo e as senhas fora do GitHub e faça cópias de segurança. Para o build na nuvem, converta o arquivo para base64 **localmente** e configure os Secrets em **Settings > Secrets and variables > Actions > Secrets**:
- `ODONTOAI_KEYSTORE_BASE64` = conteúdo base64 do arquivo `.jks`
- `ODONTOAI_KEYSTORE_PASSWORD` = senha do arquivo
- `ODONTOAI_KEY_ALIAS` = `odontai-upload` (ou o alias utilizado)
- `ODONTOAI_KEY_PASSWORD` = senha da chave

No Windows (PowerShell), para obter o texto base64:
```
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\CAMINHO\odontai-upload.jks')) | Set-Clipboard
```

Com os 4 Secrets + `ODONTOAI_APP_URL`, o workflow disponibiliza `Odontoai-AAB-assinado`. Não envie senhas ou keystore nesta conversa. O upload para Google Play será uma etapa separada.

## 5. Checklist antes da Play Store
- [ ] Hospedagem HTTPS de produção funcional, persistente e com backup testado
- [ ] Teste completo em celular real com Android recente e aparelho mais antigo compatível
- [ ] Rever logins, autenticação, tratamento dos dados e LGPD (não usar pacientes reais até revisar)
- [ ] Política de privacidade pública com **controlador real identificado**: o HTML atual possui aviso para preencher
- [ ] Página pública de pedido de exclusão de dados, quando aplicável
- [ ] Conferir descrições e imagens da loja versus o app real
- [ ] Preencher seção Segurança dos dados, Declaração de apps de saúde, classificação e público-alvo
- [ ] Usar nome, marca, pacote (`com.odontai.agenda`) e assinatura definitivos antes da 1ª publicação
- [ ] Criar conta Play Console e pagar taxa oficial somente no momento de publicar
- [ ] Cumprir testes fechados se a sua conta pessoal estiver sujeita a essa exigência

## Limitações honestas
O projeto continua sendo **para uma clínica** com serviços, horários e preços definidos no servidor. Não é um SaaS multi-clínicas. O AAB não foi compilado neste ambiente, pois não há Android SDK/Gradle disponível. A geração pelo workflow foi preparada, mas requer execução e validação reais. O app não funciona para pacientes enquanto a URL permanecer fictícia.

Requisitos: https://support.google.com/googleplay/android-developer/answer/11926878 e https://support.google.com/googleplay/android-developer/answer/14738291


## Nome do aplicativo
O nome exibido ao instalar e na loja é **Odontoai**. O identificador técnico Android `com.odontai.agenda`, o nome do banco e a chave de armazenamento local foram mantidos para preservar compatibilidade; o identificador Android não é visível como nome comercial e não deve ser alterado depois da publicação.
