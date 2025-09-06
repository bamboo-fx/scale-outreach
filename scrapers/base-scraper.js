const axios = require('axios');
const cheerio = require('cheerio');

class BaseScraper {
  constructor(collegeCode, collegeName, baseUrl) {
    this.collegeCode = collegeCode;
    this.collegeName = collegeName;
    this.baseUrl = baseUrl;
    this.courses = [];
  }

  async fetchPage(url) {
    try {
      console.log(`Fetching: ${url}`);
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
      throw error;
    }
  }

  parseCourseCode(text) {
    const match = text.match(/([A-Z]+)[\s-]?(\d+[A-Z]*)/);
    return match ? `${match[1]}-${match[2]}` : null;
  }

  parseCredits(text) {
    const match = text.match(/(\d+(?:\.\d+)?)\s*credit/i);
    return match ? parseFloat(match[1]) : null;
  }

  extractPrerequisites(text) {
    if (!text) return [];
    
    const prereqPatterns = [
      /prerequisite[s]?[:\s]+([^.]+)/i,
      /prereq[s]?[:\s]+([^.]+)/i
    ];

    for (const pattern of prereqPatterns) {
      const match = text.match(pattern);
      if (match) {
        const prereqText = match[1];
        const courses = prereqText.match(/[A-Z]+[\s-]?\d+[A-Z]*/g);
        return courses ? courses.map(c => this.parseCourseCode(c)).filter(Boolean) : [];
      }
    }
    
    return [];
  }

  determineLevel(courseCode, description) {
    const number = parseInt(courseCode.split('-')[1]);
    
    if (number < 100) return 'introductory';
    if (number < 200) return 'intermediate';
    if (number < 300) return 'advanced';
    return 'graduate';
  }

  cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  async scrapeCourses() {
    throw new Error('scrapeCourses method must be implemented by subclass');
  }

  async saveToDatabase(databaseService) {
    console.log(`Saving ${this.courses.length} courses from ${this.collegeName}...`);
    
    for (const course of this.courses) {
      try {
        await databaseService.insertCourse(course);
      } catch (error) {
        console.error(`Error saving course ${course.course_code}:`, error.message);
      }
    }
    
    console.log(`Completed saving courses from ${this.collegeName}`);
  }
}

module.exports = BaseScraper;