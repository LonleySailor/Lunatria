import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { userSchema } from '../src/users/users.schema';
const usersModel = mongoose.model('user', userSchema);



const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nest';

async function createAdmin() {
    try {
        await mongoose.connect(mongoUri, {});
        console.log(`Connected to MongoDB at ${mongoUri}`);

        const username = 'Placeholder';
        const email = 'placeholder@example.com';
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
