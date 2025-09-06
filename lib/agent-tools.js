const DatabaseService = require('./database');

class AgentTools {
  constructor() {
    this.database = new DatabaseService();
  }

  getToolDefinitions() {
    return [
      {
        type: "function",
        function: {
          name: "search_courses",
          description: "Search for courses across Claremont Colleges based on criteria",
          parameters: {
            type: "object",
            properties: {
              major: {
                type: "string",
                description: "Major or field of study (e.g., 'Computer Science', 'Mathematics')"
              },
              college: {
                type: "string",
                description: "College code (HMC, CMC, POMONA, SCRIPPS, PITZER)"
              },
              level: {
                type: "string",
                enum: ["introductory", "intermediate", "advanced", "graduate"],
                description: "Course difficulty level"
              },
              keywords: {
                type: "string",
                description: "Keywords to search in course titles and descriptions"
              },
              limit: {
                type: "integer",
                default: 20,
                description: "Maximum number of courses to return"
              }
            },
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_major_requirements",
          description: "Get graduation requirements for a specific major at a college",
          parameters: {
            type: "object",
            properties: {
              major_name: {
                type: "string",
                description: "Name of the major (e.g., 'Computer Science', 'Economics')"
              },
              college_code: {
                type: "string",
                description: "College code (HMC, CMC, POMONA, SCRIPPS, PITZER)"
              }
            },
            required: ["major_name", "college_code"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "check_prerequisites",
          description: "Check prerequisites for a specific course",
          parameters: {
            type: "object",
            properties: {
              course_code: {
                type: "string",
                description: "Course code (e.g., 'CS-5', 'MATH-55')"
              },
              completed_courses: {
                type: "array",
                items: { type: "string" },
                description: "List of course codes the student has completed"
              }
            },
            required: ["course_code"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_courses_in_department",
          description: "Get all courses in a specific department at a college",
          parameters: {
            type: "object",
            properties: {
              department_code: {
                type: "string",
                description: "Department code (e.g., 'CS', 'MATH', 'ECON')"
              },
              college_code: {
                type: "string",
                description: "College code (HMC, CMC, POMONA, SCRIPPS, PITZER)"
              }
            },
            required: ["department_code", "college_code"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "build_semester_schedule",
          description: "Generate a suggested semester schedule based on courses and constraints",
          parameters: {
            type: "object",
            properties: {
              course_codes: {
                type: "array",
                items: { type: "string" },
                description: "List of course codes to include in schedule"
              },
              max_credits: {
                type: "integer",
                default: 18,
                description: "Maximum credit hours per semester"
              },
              semester: {
                type: "string",
                description: "Target semester (e.g., 'fall2024', 'spring2025')"
              }
            },
            required: ["course_codes"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "validate_graduation_path",
          description: "Validate if a planned course sequence meets graduation requirements",
          parameters: {
            type: "object",
            properties: {
              major_name: {
                type: "string",
                description: "Name of the major"
              },
              college_code: {
                type: "string",
                description: "College code"
              },
              planned_courses: {
                type: "array",
                items: { type: "string" },
                description: "List of all planned course codes"
              }
            },
            required: ["major_name", "college_code", "planned_courses"]
          }
        }
      }
    ];
  }

  async searchCourses(params) {
    try {
      const courses = await this.database.searchCourses(params);
      return {
        success: true,
        courses: courses,
        count: courses.length,
        message: `Found ${courses.length} courses matching your criteria`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to search courses"
      };
    }
  }

  async getMajorRequirements(params) {
    try {
      const major = await this.database.getMajorRequirements(params.major_name, params.college_code);
      
      if (!major) {
        return {
          success: false,
          message: `Major '${params.major_name}' not found at ${params.college_code}`
        };
      }

      return {
        success: true,
        major: major,
        message: `Found requirements for ${major.name} at ${major.colleges.name}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to get major requirements"
      };
    }
  }

  async checkPrerequisites(params) {
    try {
      const course = await this.database.getCoursePrerequisites(params.course_code);
      
      if (!course) {
        return {
          success: false,
          message: `Course '${params.course_code}' not found`
        };
      }

      const completedCourses = params.completed_courses || [];
      const missingPrereqs = course.prerequisites.filter(prereq => 
        !completedCourses.includes(prereq)
      );

      return {
        success: true,
        course: course,
        prerequisites: course.prerequisites,
        completed_prerequisites: completedCourses.filter(c => course.prerequisites.includes(c)),
        missing_prerequisites: missingPrereqs,
        can_enroll: missingPrereqs.length === 0,
        message: missingPrereqs.length === 0 
          ? `You can enroll in ${course.course_code}`
          : `You need to complete: ${missingPrereqs.join(', ')} before taking ${course.course_code}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to check prerequisites"
      };
    }
  }

  async getCoursesInDepartment(params) {
    try {
      const courses = await this.database.getCoursesInDepartment(params.department_code, params.college_code);
      
      return {
        success: true,
        courses: courses,
        count: courses.length,
        message: `Found ${courses.length} courses in ${params.department_code} department at ${params.college_code}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to get department courses"
      };
    }
  }

  async buildSemesterSchedule(params) {
    try {
      const courses = await this.database.getCoursesByCode(params.course_codes);
      const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
      const maxCredits = params.max_credits || 18;

      if (totalCredits > maxCredits) {
        return {
          success: false,
          message: `Schedule exceeds credit limit: ${totalCredits} > ${maxCredits} credits`
        };
      }

      // Simple schedule building logic - could be enhanced with time conflict checking
      const schedule = {
        semester: params.semester || 'Current',
        courses: courses,
        total_credits: totalCredits,
        remaining_capacity: maxCredits - totalCredits
      };

      return {
        success: true,
        schedule: schedule,
        message: `Built schedule with ${courses.length} courses (${totalCredits} credits)`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to build semester schedule"
      };
    }
  }

  async validateGraduationPath(params) {
    try {
      const major = await this.database.getMajorRequirements(params.major_name, params.college_code);
      const courses = await this.database.getCoursesByCode(params.planned_courses);

      if (!major) {
        return {
          success: false,
          message: `Major '${params.major_name}' not found at ${params.college_code}`
        };
      }

      const totalCredits = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
      const requiredCredits = major.total_credits || 120;

      return {
        success: true,
        validation: {
          major: major.name,
          planned_courses: courses.length,
          total_planned_credits: totalCredits,
          required_credits: requiredCredits,
          credits_remaining: Math.max(0, requiredCredits - totalCredits),
          meets_requirements: totalCredits >= requiredCredits
        },
        message: totalCredits >= requiredCredits 
          ? "Your planned courses meet graduation requirements"
          : `You need ${requiredCredits - totalCredits} more credits to graduate`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to validate graduation path"
      };
    }
  }

  async executeTool(functionName, args) {
    const methodName = functionName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    if (typeof this[methodName] !== 'function') {
      throw new Error(`Tool function '${functionName}' not implemented`);
    }

    return await this[methodName](args);
  }
}

module.exports = AgentTools;