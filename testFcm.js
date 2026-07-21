import messaging from './app/config/firebase/firebase.js';

messaging.send({
  token: 'token-invalido-de-teste',
  notification: { title: 'Teste', body: 'Teste' }
})
.then(() => console.log('Não deveria chegar aqui'))
.catch(err => {
  console.log('Código do erro:', err.code);
  if (err.code === 'messaging/registration-token-not-registered' ||
      err.code === 'messaging/invalid-argument') {
    console.log('✅ Autenticação com Firebase funcionando!');
  } else if (err.code === 'app/invalid-credential') {
    console.log('❌ Problema na credencial do Service Account');
  }
});