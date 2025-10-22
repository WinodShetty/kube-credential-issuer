import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import * as dotenv from 'dotenv'; // ✅ Correct import for dotenv in CommonJS/TypeScript

dotenv.config(); // ✅ Load variables from .env

const app = express();
const port = process.env.PORT || 4000;
const workerId = process.env.WORKER_ID || 'worker-unknown';
const dataPath = path.join(__dirname, '../data/credentials.json'); // ✅ Path to data file

app.use(cors()); // ✅ Enable CORS
app.use(express.json()); // ✅ Parse JSON body

// ✅ Ensure credentials file exists
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

app.post('/issue', (req, res) => {
  const newCredential = req.body;

  if (!newCredential || typeof newCredential !== 'object') {
    return res.status(400).json({ error: 'Invalid credential data.' });
  }

  const credentials = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // ✅ Check for duplicate using full JSON match
  const alreadyExists = credentials.some((cred: any) =>
    JSON.stringify(cred) === JSON.stringify(newCredential)
  );

  if (alreadyExists) {
    return res.status(200).json({
      message: 'Credential already issued',
      issuedBy: workerId
    });
  }

  credentials.push(newCredential);
  fs.writeFileSync(dataPath, JSON.stringify(credentials, null, 2));

  return res.status(201).json({
    message: `Credential issued by ${workerId}`
  });
});

app.listen(port, () => {
  console.log(`🚀 Issuance service running on http://localhost:${port}`);
});
