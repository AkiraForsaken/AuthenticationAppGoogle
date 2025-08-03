import User from "../models/User.js";
import 'dotenv/config';
import connectDB from "../config/db.js";

async function createFirstAdmin(){
    await connectDB();
    const email = 'akiraseiji123@gmail.com';
    const name = 'Akira Seiji';
    const picture = '';

    const existing = await User.findOne({ email });
    if (existing){
        console.log('Admin already exists:', existing);
        process.exit(0);
    }

    const admin = await User.create({
        email,
        name,
        picture,
        role: 'admin',
        status: 'active',
    });
    console.log('First admin created:', admin);
    process.exit(0); // exit success
}

await createFirstAdmin();
