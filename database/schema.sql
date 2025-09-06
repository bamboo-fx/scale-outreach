-- Claremont Colleges Database Schema

-- Colleges table
CREATE TABLE colleges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE, -- 'HMC', 'CMC', 'POMONA', 'SCRIPPS', 'PITZER'
  website VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) NOT NULL,
  college_id INTEGER REFERENCES colleges(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL, -- 'CS-5', 'MATH-55'
  title VARCHAR(500) NOT NULL,
  description TEXT,
  credits DECIMAL(3,1),
  department_id INTEGER REFERENCES departments(id),
  college_id INTEGER REFERENCES colleges(id),
  level VARCHAR(20), -- 'introductory', 'intermediate', 'advanced', 'graduate'
  semester_offered VARCHAR(50), -- 'fall', 'spring', 'both', 'varies'
  prerequisites TEXT[],
  corequisites TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Majors/Programs table
CREATE TABLE majors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'major', 'minor', 'concentration'
  college_id INTEGER REFERENCES colleges(id),
  requirements JSONB, -- Store complex requirement structure
  total_credits INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Major requirements table (for specific course requirements)
CREATE TABLE major_requirements (
  id SERIAL PRIMARY KEY,
  major_id INTEGER REFERENCES majors(id),
  category VARCHAR(255), -- 'core', 'electives', 'capstone', etc.
  required_courses TEXT[], -- Array of course codes
  credits_required INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Course schedules table (for when courses are offered)
CREATE TABLE course_schedules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  semester VARCHAR(20), -- 'fall2024', 'spring2025'
  days VARCHAR(10), -- 'MWF', 'TTH'
  start_time TIME,
  end_time TIME,
  instructor VARCHAR(255),
  location VARCHAR(255),
  enrollment_limit INTEGER,
  enrollment_current INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_courses_department ON courses(department_id);
CREATE INDEX idx_courses_college ON courses(college_id);
CREATE INDEX idx_courses_code ON courses(course_code);
CREATE INDEX idx_departments_college ON departments(college_id);
CREATE INDEX idx_majors_college ON majors(college_id);

-- Sample data for testing
INSERT INTO colleges (name, code, website) VALUES
  ('Harvey Mudd College', 'HMC', 'https://www.hmc.edu'),
  ('Claremont McKenna College', 'CMC', 'https://www.claremontmckenna.edu'),
  ('Pomona College', 'POMONA', 'https://www.pomona.edu'),
  ('Scripps College', 'SCRIPPS', 'https://www.scrippscollege.edu'),
  ('Pitzer College', 'PITZER', 'https://www.pitzer.edu');