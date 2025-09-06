const HMCScraper = require('./hmc-scraper');
const DatabaseService = require('../lib/database');

class ScraperManager {
  constructor() {
    this.scrapers = [
      new HMCScraper(),
      // Add other college scrapers here as they're implemented
      // new CMCScraper(),
      // new PomonaScraper(), 
      // new Scrippscraper(),
      // new PitzerScraper()
    ];
    this.database = new DatabaseService();
  }

  async scrapeAll() {
    console.log('Starting scraping process for all Claremont Colleges...');
    
    for (const scraper of this.scrapers) {
      try {
        console.log(`\n=== Scraping ${scraper.collegeName} ===`);
        await scraper.scrapeCourses();
        await scraper.saveToDatabase(this.database);
        
        // Add delay between colleges to be respectful
        await this.delay(2000);
        
      } catch (error) {
        console.error(`Failed to scrape ${scraper.collegeName}:`, error);
        continue; // Continue with other colleges even if one fails
      }
    }
    
    console.log('\n=== Scraping completed ===');
  }

  async scrapeSingle(collegeCode) {
    const scraper = this.scrapers.find(s => s.collegeCode === collegeCode.toUpperCase());
    
    if (!scraper) {
      throw new Error(`No scraper found for college code: ${collegeCode}`);
    }
    
    console.log(`Scraping ${scraper.collegeName}...`);
    await scraper.scrapeCourses();
    await scraper.saveToDatabase(this.database);
    
    return scraper.courses;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  listAvailableScrapers() {
    return this.scrapers.map(s => ({
      code: s.collegeCode,
      name: s.collegeName,
      url: s.baseUrl
    }));
  }
}

// CLI usage
if (require.main === module) {
  const manager = new ScraperManager();
  
  const command = process.argv[2];
  const collegeCode = process.argv[3];
  
  switch (command) {
    case 'all':
      manager.scrapeAll();
      break;
    case 'single':
      if (!collegeCode) {
        console.error('Please provide a college code (e.g., HMC, CMC, POMONA)');
        process.exit(1);
      }
      manager.scrapeSingle(collegeCode);
      break;
    case 'list':
      console.log('Available scrapers:');
      console.table(manager.listAvailableScrapers());
      break;
    default:
      console.log('Usage: node scraper-manager.js [all|single|list] [collegeCode]');
      console.log('Examples:');
      console.log('  node scraper-manager.js all');
      console.log('  node scraper-manager.js single HMC');
      console.log('  node scraper-manager.js list');
  }
}

module.exports = ScraperManager;