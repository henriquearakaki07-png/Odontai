# Odontoai — continuação da preparação para publicação

## Novidades desta versão
- Paciente pode apagar definitivamente seus próprios registros de agendamento usando a chave armazenada no dispositivo.
- Validação estrita de datas no servidor (por exemplo, 30 de fevereiro é rejeitado).
- Cabeçalhos básicos de segurança e ausência de cache para dados das consultas.
- Dockerfile e `.env.example` para facilitar a implantação.

## Colocar no ar
1. Escolha um domínio HTTPS e uma hospedagem com Node.js 22 e **volume persistente** montado em `/data`.
2. Configure `DENTIST_PASSWORD`, `SECRET` (32+ caracteres aleatórios), `DB_FILE=/data/odontai.db` e `PORT` conforme o provedor. Nunca coloque as senhas no app Android nem no Git.
3. Faça deploy do diretório `backend/` e confirme que `https://seu-dominio/` abre e `/privacidade` está disponível.
4. Faça backups automáticos do volume. Teste recuperação de backup antes de aceitar pacientes reais.
5. Revise política de privacidade, identidade da clínica, preços, horários, consentimento e termos antes da publicação.
6. Substitua a URL provisória no arquivo `android/app/src/main/res/values/strings.xml` pelo domínio real.
7. No Android Studio, abra `android/`, sincronize Gradle, faça testes em aparelho e use **Build > Generate Signed Bundle / APK > Android App Bundle**. Configure e preserve sua chave de assinatura com segurança.
8. Envie o AAB à Play Console, complete a ficha, Segurança dos dados, política, classificação indicativa e trilha de testes exigida para sua conta.

## Limitações ainda existentes
- Este é um app de uma única clínica; não há cadastro de diferentes clínicas nem acesso separado por organização.
- O agendamento é identificado no próprio aparelho via chave; perder os dados do navegador impede que o paciente recupere esse acesso sozinho.
- Os valores do painel são *valores previstos*, não recebimentos contábeis.
- Não houve compilação Android, assinatura AAB, teste em dispositivo, configuração de domínio ou hospedagem nesta entrega.
- A exclusão do registro é irreversível e libera o horário; revisão de requisitos legais de retenção é responsabilidade da operação clínica.
- É obrigatório concluir revisão de segurança, LGPD e políticas Google Play antes de usar com pacientes reais.
