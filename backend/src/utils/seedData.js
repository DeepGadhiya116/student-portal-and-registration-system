import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Announcement } from '../models/Announcement.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Database already contains records. Skipping seed step.');
      return;
    }

    console.log('🌱 Empty database detected. Seeding sample courses, users, and announcements...');

    // 1. Seed Courses
    const sampleCourses = [
      {
        courseCode: 'CS301',
        title: 'Advanced Algorithms & Complexity',
        department: 'Computer Science and Engineering',
        credits: 4,
        instructor: 'Prof. Alan Turing',
        capacity: 45,
        schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
        description: 'Design and analysis of efficient algorithms, graph algorithms, dynamic programming, NP-completeness, and approximation algorithms.',
        semester: 5,
      },
      {
        courseCode: 'CS305',
        title: 'Database Management Systems & NoSQL',
        department: 'Computer Science and Engineering',
        credits: 4,
        instructor: 'Prof. Edgar Codd',
        capacity: 50,
        schedule: 'Tue, Thu 02:00 PM - 03:30 PM',
        description: 'Relational data model, relational algebra, SQL querying, indexing, transaction management, ACID properties, and document-oriented MongoDB design.',
        semester: 5,
      },
      {
        courseCode: 'CS310',
        title: 'Full Stack Web Architecture & React',
        department: 'Computer Science and Engineering',
        credits: 3,
        instructor: 'Prof. Tim Berners',
        capacity: 40,
        schedule: 'Mon, Wed 01:00 PM - 02:30 PM',
        description: 'Modern single-page applications, responsive interfaces with Tailwind CSS, Node.js API development, RESTful design, and JWT security.',
        semester: 5,
      },
      {
        courseCode: 'IT201',
        title: 'Cloud Infrastructure & DevOps Automation',
        department: 'Information Technology',
        credits: 3,
        instructor: 'Prof. Grace Hopper',
        capacity: 35,
        schedule: 'Fri 09:00 AM - 12:00 PM',
        description: 'Containerization, CI/CD pipelines, virtualization, serverless computing, and microservice orchestration.',
        semester: 3,
      },
      {
        courseCode: 'AI101',
        title: 'Introduction to Artificial Intelligence',
        department: 'Computer Science and Engineering',
        credits: 4,
        instructor: 'Prof. Geoffrey Hinton',
        capacity: 60,
        schedule: 'Tue, Thu 10:00 AM - 11:30 AM',
        description: 'Search algorithms, heuristic evaluation, machine learning fundamentals, feed-forward neural networks, and computer vision basics.',
        semester: 5,
      },
      {
        courseCode: 'CYB301',
        title: 'Network Security & Cryptography',
        department: 'Information Technology',
        credits: 3,
        instructor: 'Prof. Whitfield Diffie',
        capacity: 30,
        schedule: 'Mon, Thu 04:00 PM - 05:30 PM',
        description: 'Symmetric and asymmetric encryption, digital signatures, SSL/TLS protocol, firewalls, and application vulnerability scanning.',
        semester: 5,
      },
      {
        courseCode: 'EE210',
        title: 'Digital Logic & Microprocessor Architecture',
        department: 'Electrical & Electronics',
        credits: 4,
        instructor: 'Prof. Claude Shannon',
        capacity: 40,
        schedule: 'Wed, Fri 02:00 PM - 03:30 PM',
        description: 'Boolean algebra, combinational and sequential circuit design, assembly programming, and micro-controller interfacing.',
        semester: 3,
      },
    ];

    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ Seeded ${createdCourses.length} courses.`);

    // 2. Seed Admin User
    const adminUser = new User({
      name: 'Dr. Eleanor Vance (Dean of Academics)',
      email: 'admin@university.edu',
      password: 'Password123',
      role: 'admin',
      department: 'University Administration',
      status: 'Active',
      phone: '+1 (555) 019-2834',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=EleanorVance',
    });
    await adminUser.save();

    // 3. Seed Students
    const student1 = new User({
      name: 'Alex Rivers',
      email: 'alex.rivers@university.edu',
      password: 'Password123',
      role: 'student',
      studentId: 'STU-2024-001',
      department: 'Computer Science and Engineering',
      year: 3,
      semester: 5,
      cgpa: 3.85,
      creditsEarned: 11,
      status: 'Active',
      phone: '+1 (555) 234-5678',
      address: '422 University Oaks Blvd, Apt 4B',
      emergencyContact: 'Karen Rivers (Parent) - +1 (555) 987-6543',
      bio: 'Junior CSE student specializing in distributed systems and cloud native web platforms.',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexRivers',
      enrolledCourses: [createdCourses[0]._id, createdCourses[1]._id, createdCourses[2]._id],
    });
    await student1.save();

    // Update enrolled count for those courses
    await Course.findByIdAndUpdate(createdCourses[0]._id, { $push: { enrolledStudents: student1._id } });
    await Course.findByIdAndUpdate(createdCourses[1]._id, { $push: { enrolledStudents: student1._id } });
    await Course.findByIdAndUpdate(createdCourses[2]._id, { $push: { enrolledStudents: student1._id } });

    const student2 = new User({
      name: 'Sarah Chen',
      email: 'sarah.chen@university.edu',
      password: 'Password123',
      role: 'student',
      studentId: 'STU-2024-002',
      department: 'Information Technology',
      year: 2,
      semester: 3,
      cgpa: 3.92,
      creditsEarned: 7,
      status: 'Active',
      phone: '+1 (555) 345-6789',
      address: '108 College Park Drive',
      emergencyContact: 'David Chen - +1 (555) 876-5432',
      bio: 'Passionate about cyber security defense systems and cloud devops pipelines.',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=SarahChen',
      enrolledCourses: [createdCourses[3]._id, createdCourses[5]._id],
    });
    await student2.save();
    await Course.findByIdAndUpdate(createdCourses[3]._id, { $push: { enrolledStudents: student2._id } });
    await Course.findByIdAndUpdate(createdCourses[5]._id, { $push: { enrolledStudents: student2._id } });

    const student3 = new User({
      name: 'Marcus Johnson',
      email: 'marcus.johnson@university.edu',
      password: 'Password123',
      role: 'student',
      studentId: 'STU-2025-003',
      department: 'Electrical & Electronics',
      year: 1,
      semester: 2,
      cgpa: 3.65,
      creditsEarned: 4,
      status: 'Active',
      phone: '+1 (555) 456-7890',
      address: 'South Campus Quad Hall #312',
      emergencyContact: 'Linda Johnson - +1 (555) 765-4321',
      bio: 'Robotics enthusiast and hardware programming explorer.',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MarcusJohnson',
      enrolledCourses: [createdCourses[6]._id],
    });
    await student3.save();
    await Course.findByIdAndUpdate(createdCourses[6]._id, { $push: { enrolledStudents: student3._id } });

    console.log('✅ Seeded admin user and 3 demo students.');

    // 4. Seed Announcements
    const sampleAnnouncements = [
      {
        title: 'Fall 2026 Academic Course Registration Window Now Open',
        content: 'Online course enrollment for the upcoming semester is now officially active. All students are advised to review prerequisite requirements and confirm their credit limits before the add/drop deadline on October 15th.',
        category: 'Academic',
        priority: 'High',
        pinned: true,
        author: 'Office of the Registrar',
        targetDepartment: 'All',
      },
      {
        title: 'Mid-Term Examination Schedule & Hall Allocations Published',
        content: 'The mid-term examination timetable is available under the examination tab. Please verify your course codes and seated exam blocks. Bring your verified student ID card to all exam venues.',
        category: 'Examination',
        priority: 'High',
        pinned: true,
        author: 'Controller of Examinations',
        targetDepartment: 'All',
      },
      {
        title: 'Annual University Hackathon & Tech Innovation Summit 2026',
        content: 'Join over 500 collegiate developers, designers, and innovators for a 36-hour sprint. Cash prizes, industry mentorship, and recruitment opportunities available. Register via student council by Friday.',
        category: 'Event',
        priority: 'Medium',
        pinned: false,
        author: 'Department of Computing',
        targetDepartment: 'Computer Science and Engineering',
      },
      {
        title: 'Health & Wellness Center: Free Seasonal Vaccination Drive',
        content: 'The Student Health Center will be administering seasonal vaccines and health checkups free of charge this Tuesday and Wednesday between 9:00 AM and 4:00 PM at Student Center Hall B.',
        category: 'Urgent',
        priority: 'Medium',
        pinned: false,
        author: 'University Health Services',
        targetDepartment: 'All',
      },
      {
        title: 'Main Campus Library 24/7 Extended Study Hours',
        content: 'To support exam preparation, the central research library and group study breakout pods will remain open 24 hours daily through the finals period. High-speed Wi-Fi and café services are active.',
        category: 'General',
        priority: 'Low',
        pinned: false,
        author: 'University Library Committee',
        targetDepartment: 'All',
      },
    ];

    await Announcement.insertMany(sampleAnnouncements);
    console.log('✅ Seeded 5 official campus announcements.');
    console.log('🚀 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};
