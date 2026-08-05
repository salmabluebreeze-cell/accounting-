#!/usr/bin/env node

import { program } from 'commander';
import Parser from 'rss-parser';
import prompts from 'prompts';
import pc from 'picocolors';

const TOPICS = {
  world: 'WORLD',
  nation: 'NATION',
  business: 'BUSINESS',
  technology: 'TECHNOLOGY',
  entertainment: 'ENTERTAINMENT',
  sports: 'SPORTS',
  science: 'SCIENCE',
  health: 'HEALTH'
};

program
  .name('google-news')
  .description('A Node.js CLI tool to read the latest Google News')
  .version('1.0.0')
  .option('-s, --search <query>', 'search for news articles')
  .option('-c, --category <category>', 'browse by category (world, technology, business, science, sports, health, entertainment)')
  .option('-l, --limit <number>', 'limit the number of articles displayed', (val) => parseInt(val, 10))
  .option('-i, --interactive', 'run in interactive mode');

program.parse(process.argv);
const options = program.opts();

const limit = options.limit || 10;
const isInteractive = options.interactive || (Object.keys(options).filter(k => options[k] !== undefined).length === 0);

function getFeedUrl(category, search) {
  if (search) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(search)}&hl=en-US&gl=US&ceid=US:en`;
  }
  if (category) {
    const topicKey = category.toLowerCase();
    const topic = TOPICS[topicKey];
    if (topic) {
      return `https://news.google.com/rss/headlines/section/topic/${topic}?hl=en-US&gl=US&ceid=US:en`;
    } else {
      console.warn(pc.yellow(`\nUnknown category "${category}". Defaulting to Top Headlines.\n`));
    }
  }
  return 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch (e) {
    return dateStr;
  }
}

function printBanner() {
  console.clear();
  console.log(pc.bold(pc.cyan('=======================================')));
  console.log(pc.bold(pc.cyan('      📰  GOOGLE NEWS TERMINAL  📰      ')));
  console.log(pc.bold(pc.cyan('=======================================\n')));
}

async function displayNews(url, limitNum, titlePrefix = 'Top Headlines') {
  const parser = new Parser();
  console.log(pc.dim(`\nFetching articles for ${titlePrefix}...`));
  try {
    const feed = await parser.parseURL(url);
    printBanner();
    console.log(pc.bold(pc.green(`✨ ${feed.title || titlePrefix} (Showing top ${Math.min(feed.items.length, limitNum)})`)));
    console.log(pc.dim('--------------------------------------------------------------------------------'));

    const items = feed.items.slice(0, limitNum);
    if (items.length === 0) {
      console.log(pc.yellow('No articles found.'));
      return;
    }

    items.forEach((item, index) => {
      const title = item.title;
      const dashIdx = title.lastIndexOf(' - ');
      let cleanTitle = title;
      let source = item.creator || 'Google News';
      if (dashIdx !== -1) {
        cleanTitle = title.substring(0, dashIdx);
        source = title.substring(dashIdx + 3);
      }

      console.log(`${pc.bold(pc.cyan(index + 1 + '.'))} ${pc.bold(cleanTitle)}`);
      console.log(`   ${pc.dim('Source:')} ${pc.magenta(source)}  |  ${pc.dim('Published:')} ${pc.yellow(formatDate(item.pubDate))}`);
      console.log(`   ${pc.dim('Link:')} ${pc.blue(pc.underline(item.link))}`);
      console.log(pc.dim('--------------------------------------------------------------------------------'));
    });
  } catch (err) {
    console.error(pc.red(`\nError fetching news: ${err.message}`));
  }
}

async function askToContinue() {
  console.log();
  const response = await prompts({
    type: 'confirm',
    name: 'continue',
    message: 'Return to main menu?',
    initial: true
  });
  if (response.continue) {
    await runInteractive();
  } else {
    console.log(pc.green('\nGoodbye!\n'));
    process.exit(0);
  }
}

async function runInteractive() {
  printBanner();
  
  const response = await prompts({
    type: 'select',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      { title: '🔥 Top Headlines', value: 'headlines' },
      { title: '🔍 Search News', value: 'search' },
      { title: '📂 Browse by Category', value: 'category' },
      { title: '❌ Exit', value: 'exit' }
    ]
  });

  if (response.action === 'exit' || !response.action) {
    console.log(pc.green('\nGoodbye!\n'));
    process.exit(0);
  }

  if (response.action === 'headlines') {
    const url = getFeedUrl();
    await displayNews(url, limit, 'Top Headlines');
    await askToContinue();
  } else if (response.action === 'search') {
    const searchRes = await prompts({
      type: 'text',
      name: 'query',
      message: 'Enter search query:'
    });
    if (searchRes.query) {
      const url = getFeedUrl(null, searchRes.query);
      await displayNews(url, limit, `Search: "${searchRes.query}"`);
    } else {
      console.log(pc.yellow('Search query cannot be empty.'));
    }
    await askToContinue();
  } else if (response.action === 'category') {
    const catRes = await prompts({
      type: 'select',
      name: 'category',
      message: 'Select a category:',
      choices: Object.keys(TOPICS).map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        value: key
      }))
    });
    if (catRes.category) {
      const url = getFeedUrl(catRes.category);
      await displayNews(url, limit, `Category: ${catRes.category.toUpperCase()}`);
    }
    await askToContinue();
  }
}

// Main execution flow
if (isInteractive) {
  runInteractive();
} else {
  const url = getFeedUrl(options.category, options.search);
  const titlePrefix = options.search 
    ? `Search: "${options.search}"` 
    : (options.category ? `Category: ${options.category.toUpperCase()}` : 'Top Headlines');
  displayNews(url, limit, titlePrefix);
}
