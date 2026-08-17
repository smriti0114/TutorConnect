import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Activity } from '../models/Activity.js';

dotenv.config();

const gamesToDeactivate = [
  'Chess',
  'Sudoku',
  'Rubik’s Cube',
  'Rubik\'s Cube', // Support both apostrophe types
  'Scrabble',
  'Carrom',
  'Board Games',
  'Puzzle Solving',
  'Memory Games'
];

async function run() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tutorconnect';
  
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Database connected successfully.');

  let deactivatedCount = 0;
  const deactivatedNames = [];

  for (const name of gamesToDeactivate) {
    const act = await Activity.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (act) {
      if (act.active) {
        act.active = false;
        await act.save();
        deactivatedCount++;
        deactivatedNames.push(act.name);
      }
    }
  }

  // Count remaining active activities
  const activeCount = await Activity.countDocuments({ active: true });

  console.log(`\n==============================================`);
  console.log(`Deactivation complete:`);
  console.log(`Deactivated: ${deactivatedCount} activities.`);
  console.log(`Deactivated Names:`, deactivatedNames);
  console.log(`Active Activities Remaining: ${activeCount}`);
  console.log(`Historical bookings & payments preserved (documents unmodified).`);
  console.log(`==============================================`);

  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

run().catch(err => {
  console.error('Deactivation failed:', err);
  process.exit(1);
});
