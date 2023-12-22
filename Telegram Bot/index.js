const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { handleCommand, handleMessage, handleCallbackQuery,handleBPCommand} = require('./botHandlers');
const {insertUser} = require('./database')
const imagesHero = path.join(__dirname, 'img/heroes');

const bot = new TelegramBot(process.env.BOT_API_KEY, { polling: true });

bot.onText(/\/hwr/, (msg) => handleCommand(bot, msg));

bot.on('message', async (msg) => {

    await handleMessage(bot, msg);
  
    try {
      const chatId=msg.chat.id
      const username=msg.from.username;
      const first_name=msg.from.first_name;
      const userlang=msg.from.language_code;
      const msgText = msg.text;

      await insertUser(username, first_name, chatId, userlang, msgText)

      } catch (error) {
      console.error('insert DB error:', error);
    }
  });

bot.on('callback_query', (callbackQuery) => handleCallbackQuery(bot, callbackQuery));

bot.onText(/\/bp/, (msg) => handleBPCommand(bot, msg));