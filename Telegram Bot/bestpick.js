const fs = require('fs');

const versusData = JSON.parse(fs.readFileSync('versus.json', 'utf8'));

function calculateHeroScores(heroNames) {
    const heroScores = {};

    for (const heroData of versusData) {
        const enemyHeroName = heroData.heroName;
        const counters = heroData.counters;

        let totalCounterScore = 0;

        for (const counter of counters) {
            if (heroNames.includes(counter.enemyHeroName)) {
                totalCounterScore += parseFloat(counter.winRate);
            }
        }

        heroScores[enemyHeroName] = totalCounterScore;
    }
    console.log(heroScores)
    return heroScores;
}

