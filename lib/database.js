const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  }

  async searchCourses({ major = null, college = null, level = null, keywords = null, limit = 50 }) {
    let query = this.supabase
      .from('courses')
      .select(`
        *,
        departments(name, code),
        colleges(name, code)
      `);

    if (college) {
      query = query.eq('colleges.code', college.toUpperCase());
    }

    if (level) {
      query = query.eq('level', level);
    }

    if (keywords) {
      query = query.or(`title.ilike.%${keywords}%, description.ilike.%${keywords}%`);
    }

    query = query.limit(limit);

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  async getMajorRequirements(majorName, collegeCode) {
    const { data, error } = await this.supabase
      .from('majors')
      .select(`
        *,
        major_requirements(*),
        colleges(name, code)
      `)
      .ilike('name', `%${majorName}%`)
      .eq('colleges.code', collegeCode.toUpperCase());

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data[0] || null;
  }

  async getCoursesByCode(courseCodes) {
    const { data, error } = await this.supabase
      .from('courses')
      .select(`
        *,
        departments(name, code),
        colleges(name, code)
      `)
      .in('course_code', courseCodes);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  async getCoursesInDepartment(departmentCode, collegeCode) {
    const { data, error } = await this.supabase
      .from('courses')
      .select(`
        *,
        departments!inner(name, code),
        colleges!inner(name, code)
      `)
      .eq('departments.code', departmentCode.toUpperCase())
      .eq('colleges.code', collegeCode.toUpperCase());

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  async getAllColleges() {
    const { data, error } = await this.supabase
      .from('colleges')
      .select('*');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  async getCoursePrerequisites(courseCode) {
    const { data, error } = await this.supabase
      .from('courses')
      .select('prerequisites, corequisites, course_code, title')
      .eq('course_code', courseCode);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data[0] || null;
  }
}

module.exports = DatabaseService;