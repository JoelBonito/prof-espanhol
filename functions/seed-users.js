const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Initialize with default credentials
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: 'prof-espanhol-joel'
    });
}

const auth = admin.auth();
const db = getFirestore();
console.log('Project ID:', admin.app().options.projectId);

const users = [
    { name: 'Renata', email: 'renata@profespanhol.com' },
    { name: 'Matheus', email: 'matheus@profespanhol.com' },
    { name: 'Joel', email: 'joel@profespanhol.com' }
];

const DEFAULT_PASSWORD = 'admin123';

async function createUsers() {
    console.log('--- Inovando Contas de Usuarios ---');
    console.log('Users to process:', users.length);

    for (const user of users) {
        console.log(`Processing ${user.name}...`);
        try {
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(user.email);
                console.log(`User ${user.name} already exists in Auth. Updating...`);
                await auth.updateUser(userRecord.uid, {
                    password: DEFAULT_PASSWORD,
                    displayName: user.name
                });
            } catch (e) {
                console.log(`Creating user ${user.name}...`);
                userRecord = await auth.createUser({
                    email: user.email,
                    password: DEFAULT_PASSWORD,
                    displayName: user.name,
                });
                console.log(`Created new Auth user: ${userRecord.uid} (${user.name})`);
            }

            // Initialize/Update profile in Firestore
            console.log(`Setting Firestore profile for ${user.name}...`);
            await db.collection('users').doc(userRecord.uid).set({
                displayName: user.name,
                email: user.email,
                level: 'A1',
                streak: 0,
                xp: 0,
                createdAt: userRecord.metadata.creationTime ? new Date(userRecord.metadata.creationTime) : FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                learningGoals: [],
                interests: [],
                photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
            }, { merge: true });

            console.log(`✅ Firestore profile ready for ${user.name}`);

        } catch (error) {
            console.log('ERROR_START');
            console.log(error.message);
            console.log('ERROR_END');
        }
    }
    console.log('--- Processo Concluido! ---');
}

createUsers().then(() => process.exit());
