import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { userModel } from '../src/users/users.schema';
const usersModel = mongoose.model('user', userModel);

const MONGO_PORT = process.env.MONGO_PORT || '27018';
const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_DB = 'nest';

const mongoUri = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;

async function createAdmin() {
    try {
        await mongoose.connect(mongoUri, {});
        console.log(`Connected to MongoDB at ${mongoUri}`);

        const username = 'Hitler';
        const email = 'akacprzak@protonmail.com';
        const userType = 'admin';
        const allowedServices: string[] = [];
        const userPassword = 'placeholder'; // Replace before running!

        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(userPassword, saltOrRounds);

        const newAdmin = new usersModel({
            username,
            email,
            userType,
            allowedServices,
            password: hashedPassword,
            createdAt: new Date(),
        });

        await newAdmin.save();
        console.log('Admin user created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdmin();
