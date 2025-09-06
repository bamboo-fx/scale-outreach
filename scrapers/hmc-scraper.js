const BaseScraper = require('./base-scraper');

class HMCScraper extends BaseScraper {
  constructor() {
    super('HMC', 'Harvey Mudd College', 'https://www.hmc.edu/academics/course-descriptions/');
  }

  async scrapeCourses() {
    try {
      const $ = await this.fetchPage(this.baseUrl);
      
      // Harvey Mudd typically lists courses by department
      // This is a template - you'd need to adjust based on actual HTML structure
      
      $('.course-listing').each((index, element) => {
        const $course = $(element);
        
        const titleText = $course.find('.course-title').text();
        const courseCode = this.parseCourseCode(titleText);
        
        if (!courseCode) return;
        
        const title = titleText.replace(/^[A-Z]+[\s-]?\d+[A-Z]*/, '').trim();
        const description = this.cleanText($course.find('.course-description').text());
        const credits = this.parseCredits($course.find('.credits').text()) || 3.0;
        
        const course = {
          course_code: courseCode,
          title: title,
          description: description,
          credits: credits,
          college_code: this.collegeCode,
          department_code: courseCode.split('-')[0],
          level: this.determineLevel(courseCode, description),
          prerequisites: this.extractPrerequisites(description),
          semester_offered: 'both' // Default, would need specific parsing
        };
        
        this.courses.push(course);
      });
      
      console.log(`Scraped ${this.courses.length} courses from Harvey Mudd College`);
      return this.courses;
      
    } catch (error) {
      console.error('Error scraping Harvey Mudd courses:', error);
      throw error;
    }
  }
}

module.exports = HMCScraper;