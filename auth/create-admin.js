require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { MONGO_URI } = process.env;

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  const username = 'marius';
  const plainPassword = 'admin123'; // modifică aici dacă vrei alta

  const exists = await User.findOne({ username });
  if (exists) {
    console.log('⚠️  User already exists.');
    return process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const user = new User({ username, password: hashedPassword, role: 'admin' });
  await user.save();

  console.log(`✅ Admin user "${username}" created with password: ${plainPassword}`);
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
