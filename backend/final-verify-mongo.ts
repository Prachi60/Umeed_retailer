import { MongoClient } from 'mongodb';

const destUri = 'mongodb+srv://speeddo337_db_user:speeddo%21%40%23123@cluster0.q1miqpb.mongodb.net/';
const dbName = 'SpeeUp';

async function finalVerify() {
    console.log('Final verification on destination...');
    const destClient = new MongoClient(destUri);
    try {
        await destClient.connect();
        const db = destClient.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log(`Destination database '${dbName}' has ${collections.length} collections.`);
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count} documents`);
        }
    } catch (error) {
        console.error('Final verification failed:', error);
    } finally {
        await destClient.close();
    }
}

finalVerify();
