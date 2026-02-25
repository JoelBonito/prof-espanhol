const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'prof-espanhol-joel' });
console.log('App initialized');
admin.auth().listUsers(1).then(list => {
    console.log('Users found:', list.users.length);
    process.exit(0);
}).catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
});
