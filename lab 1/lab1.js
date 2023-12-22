const readline = require('readline');
const https = require('https');
const { exec } = require('child_process');
const os = require('os');

class WikipediaSearch {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  run() {
    this.rl.question('enter request: ', (query) => {
      const searchEngine = new SearchEngine(this.rl);
      searchEngine.search(query);
    });
  }
}

class SearchEngine {
  constructor(rl) {
    this.rl = rl;
  }

  search(query) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const searchResults = result.query.search;

          if (searchResults.length === 0) {
            console.log('no wiki pages:');
          } else {
            console.log('found wiki pages:');
            searchResults.forEach((item, index) => {
              console.log(`${index + 1}. ${item.title}`);
            });

            this.rl.question('select page number:', (articleIndex) => {
              const selectedArticle = searchResults[articleIndex - 1];

              if (selectedArticle) {
                const articleOpener = new Opener();
                articleOpener.open(selectedArticle.title);
              } else {
                console.log('incorrect page number');
              }

              this.rl.close();
            });
          }
        } catch (error) {
          console.error('error response wiki:', error);
        }
      });
    }).on('error', (error) => {
      console.error('error request wiki:', error);
    });
  }
}

class Opener {
  open(articleTitle) {
    const articleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`;
    console.log(`open: ${articleTitle}`);

    const openCommand = os.platform() === 'win32' ? `start ${articleUrl}` : `open "${articleUrl}"`;

    exec(openCommand, (error) => {
      if (error) {
        console.error('error opening page:', error);
      }
    });
  }
}

const wikiSearch = new WikipediaSearch();
wikiSearch.run();