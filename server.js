// Phoenix : IMF Gadget API Development Challenge

require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const gadgetRoutes = require('./routes/gadgets');


const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/gadgets', gadgetRoutes);


const SERVER_PORT = process.env.SERVER_PORT || 3000;
sequelize.sync().then(() => {
  app.listen(SERVER_PORT, () => console.log(`Server running on port ${SERVER_PORT}`));
}).catch(err => console.log(err));
