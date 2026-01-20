import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

interface Migration {
    name: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
}

class MigrationRunner {
    private migrationsPath = path.join(__dirname, '../migrations');
    private db = mongoose.connection;

    async connect(): Promise<void> {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set');
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
    }

    async disconnect(): Promise<void> {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }

    async getMigrationFiles(): Promise<string[]> {
        const files = fs.readdirSync(this.migrationsPath);
        return files
            .filter((file) => file.endsWith('.ts'))
            .sort();
    }

    async loadMigration(fileName: string): Promise<Migration> {
        const filePath = path.join(this.migrationsPath, fileName);
        const migration = require(filePath);
        return {
            name: fileName,
            up: migration.up,
            down: migration.down,
        };
    }

    async runUp(): Promise<void> {
        try {
            await this.connect();
            const files = await this.getMigrationFiles();

            for (const file of files) {
                const migration = await this.loadMigration(file);
                console.log(`Running migration: ${migration.name}`);
                await migration.up();
                console.log(`✓ Completed: ${migration.name}`);
            }

            console.log('All migrations completed successfully');
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }

    async runDown(): Promise<void> {
        try {
            await this.connect();
            const files = await this.getMigrationFiles();
            const reversedFiles = files.reverse();

            for (const file of reversedFiles) {
                const migration = await this.loadMigration(file);
                console.log(`Reverting migration: ${migration.name}`);
                await migration.down();
                console.log(`✓ Reverted: ${migration.name}`);
            }

            console.log('All migrations reverted successfully');
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        } finally {
            await this.disconnect();
        }
    }
}

const runner = new MigrationRunner();
const command = process.argv[2] || 'up';

if (command === 'up') {
    runner.runUp().catch((err) => process.exit(1));
} else if (command === 'down') {
    runner.runDown().catch((err) => process.exit(1));
} else {
    console.error('Unknown command. Use: up or down');
    process.exit(1);
}