const fs = require('fs');
const readline = require('readline');

async function processFile(filePath) {
    const startProcessingTime = Date.now();

    const cities = {};
    const duplicates = {};

    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity,
    });

    let isXml = false;
    if (filePath.toLowerCase().endsWith('.xml')) {
        isXml = true;
    }

    let currentRecord = {};

    for await (const line of rl) {
        if (isXml) {
            const matches = line.match(/<item city="(.+)" street="(.+)" house="(.+)" floor="(.+)" \/>/);
            if (matches) {
                const [, city, street, house, floor] = matches;
                const key = `${city}_${floor}`;
                duplicates[key] = duplicates[key] ? duplicates[key] + 1 : 1;

                cities[city] = cities[city] ? cities[city] + 1 : 1;
            }
        } else {
            const record = line.split(';').map(value => value.trim());
            const [city, , , floor] = record;

            const key = `${city}_${floor}`;
            duplicates[key] = duplicates[key] ? duplicates[key] + 1 : 1;

            cities[city] = cities[city] ? cities[city] + 1 : 1;
        }
    }

    rl.close();

    const endProcessingTime = Date.now();
    const processingTime = endProcessingTime - startProcessingTime;

    console.log('dublicates;:');
    for (const key in duplicates) {
        if (duplicates[key] > 1) {
            console.log(`${key}: ${duplicates[key]} d`);
        }
    }

    console.log('\nsum 1+2+3+4+5 ');
    for (const city in cities) {
        console.log(`${city}: ${cities[city]} 1-5`);
    }

    console.log(`\ntime: ${processingTime} мс`);

    return processingTime;
}

async function startApp() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    while (true) {
        console.log('input or exit');
        const filePath = await new Promise(resolve => rl.question('> ', resolve));

        if (filePath.toLowerCase() === 'exit') {
            rl.close();
            break;
        }

        if (!fs.existsSync(filePath)) {
            console.log('file not found');
            continue;
        }

        const processingTime = await processFile(filePath);


        rl.resume();
    }
}

startApp();