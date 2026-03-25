import { MongoClient } from 'mongodb';

const sourceUri = 'mongodb+srv://kosilecommerce_db_user:973Chc5YHtBa3F1i@kosil.fcettwg.mongodb.net/SpeeUp';
const destUri = 'mongodb+srv://speeddo337_db_user:speeddo%21%40%23123@cluster0.q1miqpb.mongodb.net/';
const dbName = 'SpeeUp';

async function copyDatabase() {
    const sourceClient = new MongoClient(sourceUri);
    const destClient = new MongoClient(destUri);

    try {
        console.log('Connecting to clusters...');
        await Promise.all([sourceClient.connect(), destClient.connect()]);
        console.log('Connected to both source and destination.');

        const sourceDb = sourceClient.db(dbName);
        const destDb = destClient.db(dbName);

        const collections = await sourceDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections in source database.`);

        for (const col of collections) {
            const colName = col.name;
            console.log(`\nProcessing collection: ${colName}`);

            // Skip system collections if any
            if (colName.startsWith('system.')) {
                console.log(`Skipping system collection: ${colName}`);
                continue;
            }

            // Drop existing collection on destination
            try {
                await destDb.collection(colName).drop();
                console.log(`Dropped existing collection '${colName}' on destination.`);
            } catch (err) {
                // Ignore if collection doesn't exist
            }

            const sourceCol = sourceDb.collection(colName);
            const destCol = destDb.collection(colName);

            const count = await sourceCol.countDocuments();
            console.log(`- Copying ${count} documents...`);

            if (count > 0) {
                const cursor = sourceCol.find();
                const batchSize = 1000;
                let batch: any[] = [];
                let processed = 0;

                while (await cursor.hasNext()) {
                    const doc = await cursor.next();
                    if (doc) {
                        batch.push(doc);

                        if (batch.length >= batchSize) {
                            await destCol.insertMany(batch);
                            processed += batch.length;
                            console.log(`  - Inserted ${processed}/${count} documents`);
                            batch = [];
                        }
                    }
                }

                if (batch.length > 0) {
                    await destCol.insertMany(batch);
                    processed += batch.length;
                    console.log(`  - Inserted ${processed}/${count} documents`);
                }
            }

            // Copy Indexes
            console.log(`- Copying indexes for '${colName}'...`);
            const indexes = await sourceCol.listIndexes().toArray();
            for (const index of indexes) {
                if (index.name === '_id_') continue; // Skip default _id index
                try {
                    // Remove version and namespace from index spec for creation
                    const { v, ns, ...indexSpec } = index;
                    await destCol.createIndex(indexSpec.key, indexSpec);
                    console.log(`  - Created index: ${index.name}`);
                } catch (idxErr) {
                    console.error(`  - Failed to create index ${index.name}:`, idxErr.message);
                }
            }
        }

        console.log('\nDatabase migration completed successfully!');

        // Final Verification
        console.log('\nVerifying document counts...');
        for (const col of collections) {
            if (col.name.startsWith('system.')) continue;
            const sCount = await sourceDb.collection(col.name).countDocuments();
            const dCount = await destDb.collection(col.name).countDocuments();
            if (sCount === dCount) {
                console.log(`✅ ${col.name}: ${sCount} documents matched.`);
            } else {
                console.log(`❌ ${col.name}: Mismatch! Source: ${sCount}, Destination: ${dCount}`);
            }
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await Promise.all([sourceClient.close(), destClient.close()]);
    }
}

copyDatabase();
