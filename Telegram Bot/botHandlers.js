const axios = require('axios');
const fs = require('fs');
const path = require('path');
const imagesHero = path.join(__dirname, 'img/heroes');
let hwrCommandCalled = false;
let BPCommandCalled=false;
let selectedHeroes = []
const{calculateHeroScores}=require('./bestpick')



async function startCommand(bot, msg) {
    const chatId = msg.chat.id;

    startMessage='Привет, я бот по Dota 2. Что я умею? ' + '\n' 
    + '/hwr - вывести долю побед героя' + '\n'
     + '/bp - вывести лучший выбор героя';

    bot.sendMessage(chatId, startMessage);
}


async function handleCommand(bot, msg) {
    const chatId = msg.chat.id;

    bot.sendChatAction(chatId, 'typing');
    bot.sendMessage(chatId, 'Начните вводить имя героя:', {
        reply_markup: {
            force_reply: true, 
            selective: true,
        },
    });

    hwrCommandCalled = true; 
}

async function handleMessage(bot, msg) {
    const chatId = msg.chat.id;
    
    if (hwrCommandCalled) {
    try {
        const response = await axios.get(`https://api.opendota.com/api/heroStats`);
        const heroStats = response.data;

        const userInput = msg.text.toLowerCase();

        const filteredHeroes = heroStats.filter(hero => hero.localized_name.toLowerCase().startsWith(userInput));

        const keyboardOptions = filteredHeroes.map(hero => [{ text: hero.localized_name, callback_data: hero.id.toString() }]);

        bot.sendMessage(chatId, 'Выберите героя', { reply_markup: { inline_keyboard: keyboardOptions } });
    } catch (error) {
        console.error('request error', error);
        bot.sendMessage(chatId, 'request error');
    }
}   
    
    if (BPCommandCalled) {
        try{
            const response = await axios.get(`https://api.opendota.com/api/heroStats`);
        const heroStats = response.data;

        const userInput = msg.text.toLowerCase();

        const filteredHeroes = heroStats.filter(hero => hero.localized_name.toLowerCase().startsWith(userInput));

        const keyboardOptions = filteredHeroes.map(hero => [{ text: hero.localized_name, callback_data: hero.id.toString() }]);

        bot.sendMessage(chatId, 'Выберите героя', { reply_markup: { inline_keyboard: keyboardOptions } });
        } catch (error) {
            console.error('request error', error);
            bot.sendMessage(chatId, 'request error');
        } 
}

}

async function handleCallbackQuery(bot, callbackQuery) {

    const chatId = callbackQuery.message.chat.id;
    const heroId = callbackQuery.data;

    if(hwrCommandCalled){
    try {
        const response = await axios.get(`https://api.opendota.com/api/heroStats`);
        const heroStats = response.data;

        const hero = heroStats.find(hero => hero.id == heroId);

        if (hero) {
            const totalPicks = hero['1_pick'] + hero['2_pick'] + hero['3_pick'] + hero['4_pick'] + hero['5_pick'] +
                hero['6_pick'] + hero['7_pick'] + hero['8_pick'];

            const totalWins = hero['1_win'] + hero['2_win'] + hero['3_win'] + hero['4_win'] + hero['5_win'] +
                hero['6_win'] + hero['7_win'] + hero['8_win'];

            const winrate = (totalWins / totalPicks) * 100;

            const imagePath = path.join(imagesHero, `${hero.localized_name}.webp`);

            if (fs.existsSync(imagePath)) {
                const htmlMessage = `<b>Герой:</b> ${hero.localized_name}\n<b>Винрейт:</b> ${winrate.toFixed(2)}%`;

                bot.sendPhoto(chatId, imagePath, { caption: htmlMessage, parse_mode: 'HTML' });
            } else {
                bot.sendMessage(chatId, 'Изображение героя не найдено.');
            }
        } else {
            bot.sendMessage(chatId, `Герой с ID ${heroId} не найден.`);
        }
    } catch (error) {
        console.error('request err', error);
        bot.sendMessage(chatId, 'request err');
    }
    hwrCommandCalled = false;
    }


    if (BPCommandCalled) {
        try {
            const response = await axios.get(`https://api.opendota.com/api/heroes`);
            const heroesData = response.data;

            const selectedHero = heroesData.find(hero => hero.id == heroId);

            if (selectedHero) {
                const heroName = selectedHero.localized_name;
                selectedHeroes.push(heroName);

                if (selectedHeroes.length < 5) {
                    await bot.sendMessage(chatId, 'Выберите следующего героя');
                } else {

                    const heroScores = await calculateHeroScores(selectedHeroes);   
                    const heroScoresArray = Object.entries(heroScores);
                    heroScoresArray.sort((a, b) => a[1] - b[1]);
                    const sortedHeroScores = Object.fromEntries(heroScoresArray);
                    const sortedResultMessage = `Топ героев против вражеского пика:\n${Object.keys(sortedHeroScores).map((hero, index) => `${index + 1}. ${hero}`).join('\n')}`;

                    await bot.sendMessage(chatId, sortedResultMessage);

                    BPCommandCalled = false;
                    selectedHeroes = [];
                }
            } else {
                bot.sendMessage(chatId, `Герой с ID ${heroId} не найден.`);
            }
        } catch (error) {
            console.error('request error', error);
            bot.sendMessage(chatId, 'request error');
        }
    }
}

async function handleBPCommand(bot, msg) {
    const chatId = msg.chat.id;

    bot.sendChatAction(chatId, 'typing');
    bot.sendMessage(chatId, 'Начните вводить имена героев по одному:', {
        reply_markup: {
            force_reply: true, 
            selective: true,
        },
    });

    BPCommandCalled = true; 
}

module.exports = { handleCommand, handleMessage, handleCallbackQuery,handleBPCommand,startCommand};