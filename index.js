const express = require('express');
const app = express();
const port = 3000;

const collection_users = {};
const EXPIRE_MS = 5 * 60 * 1000;

app.use(express.json());

app.post('/api/tracker', (req, res) => {
  const body = req.body;
  const allowedKeys = ['username', 'placeid', 'jobid', 'gamename'];

  const extraKeys = Object.keys(body).filter(k => !allowedKeys.includes(k));
  if (extraKeys.length > 0) {
    return res.status(400).json({ message: 'error', code: 1 });
  }

  for (const key of allowedKeys) {
    if (!body[key]) {
      return res.status(400).json({ message: 'error', code: key });
    }
  }

  if (collection_users[body.username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  collection_users[body.username] = {
    placeid: body.placeid,
    jobid: body.jobid,
    gamename: body.gamename,
    timestamp: Date.now()
  };
  console.log(`Added user ${body.username}`);
  res.json({ message: 'success', data: body });
});

app.get('/api/tracker/active', (req, res) => {
  const now = Date.now();
  const activeUsers = {};

  for (const username in collection_users) {
    const user = collection_users[username];
    if (now - user.timestamp <= EXPIRE_MS) {
      activeUsers[username] = user;
    }
  }

  res.json({
    total: Object.keys(activeUsers).length,
    users: activeUsers
  });
});

setInterval(() => {
  const now = Date.now();
  for (const username in collection_users) {
    if (now - collection_users[username].timestamp > EXPIRE_MS) {
      console.log(`Deleting user ${username} due to expiration`);
      delete collection_users[username];
    }
  }
}, 60 * 1000); 

app.listen(port, () => {
  console.log(`✅ Server เริ่มแล้วที่ http://localhost:${port}`);
});
