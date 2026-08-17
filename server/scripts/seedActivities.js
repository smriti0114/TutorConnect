import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Activity } from '../models/Activity.js';

dotenv.config();

const newActivities = [
  // GAMES & STRATEGY
  { name: 'Chess', description: 'Master the classic game of strategy, improving critical thinking, foresight, and tactical planning skills.', pricePerClass: 35 },
  { name: 'Sudoku', description: 'Enhance logical problem-solving and numerical reasoning through grids of varying difficulties.', pricePerClass: 25 },
  { name: 'Rubik’s Cube', description: 'Learn algorithms and spatial visualization techniques to solve the cube rapidly.', pricePerClass: 25 },
  { name: 'Scrabble', description: 'Build vocabulary, word formulation speed, and spelling coordination in an interactive format.', pricePerClass: 30 },
  { name: 'Carrom', description: 'A traditional tabletop game that builds focus, hand-eye coordination, and angles precision.', pricePerClass: 20 },
  { name: 'Board Games', description: 'Group board games session building cooperation, decision-making, and friendly play.', pricePerClass: 25 },
  { name: 'Puzzle Solving', description: 'Engaging spatial and structural puzzles designed to expand cognitive acuity.', pricePerClass: 25 },
  { name: 'Memory Games', description: 'Interactive exercises and card games aimed at improving recall speed and concentration.', pricePerClass: 25 },

  // CREATIVE SKILLS
  { name: 'Creative Writing', description: 'Develop storytelling structures, grammar, composition styles, and unique self-expression.', pricePerClass: 35 },
  { name: 'Storytelling', description: 'Build projection, narrative structures, and character voices to deliver engaging stories.', pricePerClass: 30 },
  { name: 'Calligraphy', description: 'Master the art of beautiful script using modern brush pens and traditional ink styling.', pricePerClass: 30 },
  { name: 'Origami', description: 'Engage spatial reasoning and fine motor skills through intricate paper folding arts.', pricePerClass: 25 },
  { name: 'Drawing & Sketching', description: 'Fundamental pencil rendering, contours, shading, and cartoon sketching basics.', pricePerClass: 30 },
  { name: 'Painting', description: 'Explore watercolors, acrylics, color mixing principles, and brushwork styling.', pricePerClass: 35 },
  { name: 'Art & Craft', description: 'Hands-on projects utilizing everyday materials to construct original art pieces.', pricePerClass: 25 },
  { name: 'DIY Crafts', description: 'Simple do-it-yourself structural crafts and design projects for young creators.', pricePerClass: 25 },

  // COMMUNICATION & PERSONALITY
  { name: 'Public Speaking', description: 'Overcome stage fear, improve vocal modulation, and deliver speech presentations with confidence.', pricePerClass: 45 },
  { name: 'Debate', description: 'Structure logical rebuttals, research topics, and speak persuasively on key societal subjects.', pricePerClass: 40 },
  { name: 'Communication Skills', description: 'Develop active listening, conversational confidence, and clear structural speaking.', pricePerClass: 35 },
  { name: 'Personality Development', description: 'Build self-assurance, positive body language, etiquette, and social interactions.', pricePerClass: 35 },
  { name: 'Leadership Skills', description: 'Engaging team exercises teaching delegation, planning, and group goal setting.', pricePerClass: 40 },
  { name: 'Presentation Skills', description: 'Learn to design engaging slides and present findings clearly and confidently.', pricePerClass: 35 },
  { name: 'Confidence Building', description: 'Exercises designed to build self-worth, positive self-talk, and social comfort.', pricePerClass: 30 },

  // ACADEMIC & COGNITIVE SKILLS
  { name: 'Mental Math', description: 'Perform calculations rapidly without pencil/paper, boosting focus and number comfort.', pricePerClass: 35 },
  { name: 'Abacus', description: 'Use the traditional abacus visualizer to perform large calculations rapidly in mind.', pricePerClass: 35 },
  { name: 'Logical Reasoning', description: 'Puzzles and word problems designed to build logical deduction and analytical thinking.', pricePerClass: 30 },
  { name: 'Critical Thinking', description: 'Evaluate arguments, solve paradoxes, and analyze information objectively.', pricePerClass: 35 },
  { name: 'Problem Solving', description: 'Structured methods to identify, unpack, and solve multi-step problems.', pricePerClass: 30 },
  { name: 'Science Experiments', description: 'Safe, hands-on kitchen experiments explaining physics and chemistry principles.', pricePerClass: 40 },
  { name: 'General Knowledge', description: 'Learn global geography, history, and current affairs in an engaging format.', pricePerClass: 30 },
  { name: 'Quiz & Trivia', description: 'Fun trivia game sheets covering science, nature, history, and pop culture.', pricePerClass: 25 },

  // TECHNOLOGY SKILLS
  { name: 'Coding for Kids', description: 'Introduction to core computer programming logic using visual block layouts.', pricePerClass: 40 },
  { name: 'Scratch Programming', description: 'Create original animations and interactive 2D games using MIT Scratch.', pricePerClass: 45 },
  { name: 'Robotics', description: 'Introduction to virtual robot components, motor movements, and sensor configurations.', pricePerClass: 50 },
  { name: 'Game Development', description: 'Build basic platformers and maze games using visual engines and Javascript.', pricePerClass: 50 },
  { name: 'Web Development', description: 'Learn the structural building blocks of the web: HTML, CSS, and basic Javascript.', pricePerClass: 50 },
  { name: 'AI for Kids', description: 'Fun exploration of machine learning datasets, model training, and AI basics.', pricePerClass: 45 },
  { name: 'Digital Creativity', description: 'Introduction to digital design tools, vector illustration, and canvas formatting.', pricePerClass: 35 }
];

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tutorconnect';
  
  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Database connected successfully.');

  let addedCount = 0;
  let skippedCount = 0;

  for (const act of newActivities) {
    const exists = await Activity.findOne({ name: { $regex: new RegExp(`^${act.name}$`, 'i') } });
    if (!exists) {
      const newAct = new Activity({
        name: act.name,
        description: act.description,
        pricePerClass: act.pricePerClass,
        active: true
      });
      await newAct.save();
      addedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`\n==============================================`);
  console.log(`Seeding complete:`);
  console.log(`Added: ${addedCount} new activities.`);
  console.log(`Skipped (already exists): ${skippedCount} activities.`);
  console.log(`==============================================`);

  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
