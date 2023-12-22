const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { handleCommand, handleMessage, handleCallbackQuery} = require('./botHandlers');
const imagesHero = path.join(__dirname, 'img/heroes');

const bot = new TelegramBot(process.env.BOT_API_KEY, { polling: true });

bot.onText(/\/hwr/, (msg) => handleCommand(bot, msg));
bot.on('message', (msg) => handleMessage(bot, msg));
bot.on('callback_query', (callbackQuery) => handleCallbackQuery(bot, callbackQuery));