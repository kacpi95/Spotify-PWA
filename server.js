require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(corse());
app.use(express.json());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
