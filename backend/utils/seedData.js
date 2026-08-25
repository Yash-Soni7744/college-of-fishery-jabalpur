const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const Program = require('../models/Program');
const NewsEvent = require('../models/NewsEvent');
const Faculty = require('../models/Faculty');
const Research = require('../models/Research');
const Infrastructure = require('../models/Infrastructure');
const Collaboration = require('../models/Collaboration');
const Content = require('../models/Content');
const StudentCorner = require('../models/StudentCorner');

// Import seed functions
const { seedStudentCorner } = require('./seedStudentCorner');
const { seedCollaborations } = require('./seedCollaborations');
const seedContact = require('./seedContact');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      Program.deleteMany({}),
      NewsEvent.deleteMany({}),
      Faculty.deleteMany({}),
      Research.deleteMany({}),
      Infrastructure.deleteMany({}),
      Collaboration.deleteMany({}),
      Content.deleteMany({}),
      StudentCorner.deleteMany({})
    ]);

    // Create admin user
    console.log('Creating admin user...');
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@fisherycollegejabalpur.edu.in',
      password: 'admin123', // Will be hashed by the pre-save middleware
      role: 'admin'
    });
    console.log('Admin user created:', admin.username);

    // Seed Programs
    console.log('Seeding programs...');
    const programs = await Program.insertMany([
      {
        title: 'Bachelor of Fishery Science (B.F.Sc)',
        slug: 'bachelor-fishery-science',
        description: 'A comprehensive 4-year undergraduate program covering all aspects of fishery science including aquaculture, fish biology, fishery management, and processing technology.',
        duration: '4 Years',
        eligibility: '10+2 with PCB/PCM with minimum 50% marks',
        curriculum: [
          {
            semester: 'Semester 1',
            subjects: ['General Biology', 'Chemistry', 'Mathematics', 'English', 'Computer Applications']
          },
          {
            semester: 'Semester 2',
            subjects: ['Fish Biology', 'Water Chemistry', 'Statistics', 'Economics', 'Environmental Science']
          }
        ],
        fees: {
          annual: 50000
        },
        intake: 60,
        department: 'Fishery Science',
        level: 'undergraduate',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Master of Fishery Science (M.F.Sc)',
        slug: 'master-fishery-science',
        description: 'Advanced 2-year postgraduate program with specializations in Aquaculture, Fish Processing Technology, and Fishery Resource Management.',
        duration: '2 Years',
        eligibility: 'B.F.Sc or equivalent degree with minimum 60% marks',
        curriculum: [
          {
            semester: 'Semester 1',
            subjects: ['Advanced Aquaculture', 'Research Methodology', 'Biostatistics', 'Fish Nutrition']
          }
        ],
        fees: {
          annual: 60000
        },
        intake: 30,
        department: 'Fishery Science',
        level: 'postgraduate',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Diploma in Aquaculture Technology',
        slug: 'diploma-aquaculture-technology',
        description: 'Practical-oriented 1-year diploma program focusing on modern aquaculture techniques, pond management, and fish farming practices.',
        duration: '1 Year',
        eligibility: '10+2 in any stream with minimum 45% marks',
        fees: {
          annual: 25000
        },
        intake: 40,
        department: 'Aquaculture',
        level: 'diploma',
        isActive: true,
        createdBy: admin._id
      },
      {
        title: 'Certificate in Fish Processing & Value Addition',
        slug: 'certificate-fish-processing',
        description: 'Short-term 6-month certificate program covering fish processing, preservation techniques, and value addition methods.',
        duration: '6 Months',
        eligibility: '10th Pass with basic knowledge of science',
        fees: {
          annual: 15000
        },
        intake: 25,
        department: 'Fish Processing',
        level: 'certificate',
        isActive: true,
        createdBy: admin._id
      }
    ]);
    console.log(`${programs.length} programs seeded`);

    // Seed Faculty
    console.log('Seeding faculty...');
    const faculty = await Faculty.insertMany([
      {
        name: 'Dr. Rajesh Kumar Sharma',
        designation: 'Dean & Professor',
        department: 'fishery science',
        qualification: 'Ph.D. in Aquaculture Science',
        specialization: 'Aquaculture Systems and Fish Nutrition',
        experience: 25,
        email: 'dean@fisherycollegejabalpur.edu.in',
        phone: '+91 761 2345678',
        bio: 'Dr. Sharma has over 25 years of experience in fishery education and research. He has published over 100 research papers and has been instrumental in developing innovative aquaculture techniques.',
        researchInterests: ['Sustainable Aquaculture', 'Fish Nutrition', 'Water Quality Management'],
        publications: [
          {
            title: 'Sustainable Aquaculture Practices in India',
            journal: 'Journal of Aquaculture Research',
            year: 2023,
            url: 'https://example.com/publication1'
          }
        ],
        awards: [
          {
            title: 'Best Researcher Award',
            year: 2022,
            organization: 'Indian Fishery Society'
          }
        ],
        isActive: true,
        joinDate: new Date('2010-01-15'),
        createdBy: admin._id
      },
      {
        name: 'Dr. Priya Verma',
        designation: 'Professor',
        department: 'Fish Processing Technology',
        qualification: 'Ph.D. in Food Technology',
        specialization: 'Fish Processing and Value Addition',
        experience: 18,
        email: 'priya.verma@fisherycollegejabalpur.edu.in',
        phone: '+91 761 2345679',
        bio: 'Dr. Verma specializes in fish processing technology and has developed several innovative processing techniques for value addition.',
        researchInterests: ['Fish Processing', 'Food Safety', 'Value Addition'],
        isActive: true,
        joinDate: new Date('2015-07-20'),
        createdBy: admin._id
      },
      {
        name: 'Dr. Anil Kumar Jain',
        designation: 'Associate Professor',
        department: 'Aquaculture',
        qualification: 'Ph.D. in Aquaculture',
        specialization: 'Freshwater Aquaculture and Breeding',
        experience: 15,
        email: 'anil.jain@fisherycollegejabalpur.edu.in',
        phone: '+91 761 2345680',
        bio: 'Dr. Jain is an expert in freshwater aquaculture and has worked extensively on fish breeding programs.',
        researchInterests: ['Fish Breeding', 'Genetics', 'Pond Management'],
        isActive: true,
        joinDate: new Date('2018-03-10'),
        createdBy: admin._id
      }
    ]);
    console.log(`${faculty.length} faculty members seeded`);

    // Seed News & Events
    console.log('Seeding news and events...');
    const newsEventsData = [
      {
        title: 'New Aquaculture Research Facility Inaugurated',
        content: 'The college inaugurated a state-of-the-art aquaculture research facility equipped with modern technology for advanced research in fish farming and breeding techniques.',
        excerpt: 'State-of-the-art aquaculture research facility inaugurated to enhance research capabilities and provide better practical training to students.',
        type: 'news',
        category: 'research',
        isPublished: true,
        isFeatured: true,
        views: 245,
        tags: ['research', 'facility', 'aquaculture'],
        createdBy: admin._id
      },
      {
        title: 'International Conference on Sustainable Aquaculture',
        content: 'The college is organizing an international conference on sustainable aquaculture practices from March 15-17, 2024. Experts from around the world will participate.',
        excerpt: 'International conference bringing together experts to discuss sustainable aquaculture practices and future directions.',
        type: 'event',
        category: 'academic',
        eventDate: new Date('2024-03-15'),
        venue: 'College Auditorium',
        organizer: 'Fishery College Jabalpur',
        isPublished: true,
        isFeatured: true,
        views: 189,
        tags: ['conference', 'international', 'sustainability'],
        createdBy: admin._id
      },
      {
        title: 'Student Wins National Award for Innovation',
        content: 'Final year student Rahul Patel has won the National Innovation Award for developing an eco-friendly fish feed using local agricultural waste.',
        excerpt: 'Final year student receives prestigious national award for innovative eco-friendly fish feed development.',
        type: 'news',
        category: 'academic',
        isPublished: true,
        views: 156,
        tags: ['student', 'award', 'innovation'],
        createdBy: admin._id
      },
      {
        title: 'Workshop on Modern Fish Processing Techniques',
        content: 'A hands-on workshop on modern fish processing and preservation techniques will be conducted for students and industry professionals.',
        excerpt: 'Hands-on workshop covering latest fish processing and preservation techniques for students and professionals.',
        type: 'workshop',
        category: 'extension',
        eventDate: new Date('2024-02-20'),
        venue: 'Processing Laboratory',
        organizer: 'Department of Fish Processing',
        isPublished: true,
        views: 98,
        tags: ['workshop', 'processing', 'training'],
        createdBy: admin._id
      }
    ];

    const newsEvents = [];
    for (const itemData of newsEventsData) {
      const item = new NewsEvent(itemData);
      await item.save();
      newsEvents.push(item);
    }
    console.log(`${newsEvents.length} news/events seeded`);

    // Seed Research Projects
    console.log('Seeding research projects...');
    const research = await Research.insertMany([
      {
        title: 'Development of Sustainable Feed for Freshwater Fish',
        description: 'This project focuses on developing cost-effective and environmentally sustainable fish feed using local agricultural waste and by-products.',
        section: 'ongoing-projects',
        projectType: 'DST',
        type: 'project',
        status: 'ongoing',
        principalInvestigator: 'Dr. Rajesh Kumar Sharma',
        coInvestigators: ['Dr. Priya Verma', 'Dr. Anil Kumar Jain'],
        fundingAgency: 'Department of Science & Technology, Government of India',
        budget: 1500000,
        duration: {
          startDate: new Date('2023-04-01'),
          endDate: new Date('2026-03-31')
        },
        department: 'fishery science',
        objectives: [
          'Develop sustainable fish feed formulations',
          'Evaluate nutritional quality and growth performance',
          'Assess environmental impact and cost-effectiveness'
        ],
        methodology: 'Laboratory analysis, feeding trials, statistical evaluation',
        expectedOutcomes: [
          'Novel sustainable feed formulations',
          'Improved growth rates in fish',
          'Reduced environmental impact'
        ],
        tags: ['sustainability', 'nutrition', 'environment'],
        isPublished: true,
        createdBy: admin._id
      },
      {
        title: 'Water Quality Management in Aquaculture Systems',
        description: 'Research on optimal water quality parameters and management strategies for different aquaculture systems in the central India region.',
        section: 'ongoing-projects',
        projectType: 'ICAR',
        type: 'project',
        status: 'ongoing',
        principalInvestigator: 'Dr. Anil Kumar Jain',
        coInvestigators: ['Dr. Rajesh Kumar Sharma'],
        fundingAgency: 'Indian Council of Agricultural Research',
        budget: 800000,
        duration: {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2025-12-31')
        },
        department: 'Aquaculture',
        objectives: [
          'Study water quality parameters',
          'Develop management protocols',
          'Evaluate impact on fish health'
        ],
        tags: ['water quality', 'management', 'aquaculture'],
        isPublished: true,
        createdBy: admin._id
      }
    ]);
    console.log(`${research.length} research projects seeded`);

    // Seed Infrastructure
    console.log('Seeding infrastructure...');
    const infrastructure = await Infrastructure.insertMany([
      {
        name: 'Aquaculture Research Laboratory',
        type: 'laboratory',
        description: 'Modern laboratory equipped with advanced instruments for water quality analysis, fish health monitoring, and feed analysis.',
        capacity: '50 students',
        area: '200 sq meters',
        location: 'Academic Block A, Ground Floor',
        facilities: [
          'Water quality testing equipment',
          'Microscopes and imaging systems',
          'Feed analysis instruments',
          'Fish health monitoring tools'
        ],
        equipment: [
          {
            name: 'DO Meter',
            quantity: 5,
            specifications: 'Digital dissolved oxygen meter with temperature compensation'
          },
          {
            name: 'pH Meter',
            quantity: 8,
            specifications: 'Digital pH meter with automatic calibration'
          }
        ],
        yearEstablished: 2020,
        incharge: 'Dr. Anil Kumar Jain',
        contactInfo: {
          phone: '+91 761 2345681',
          email: 'lab@fisherycollegejabalpur.edu.in'
        },
        operatingHours: '9:00 AM - 5:00 PM (Monday to Saturday)',
        isActive: true,
        createdBy: admin._id
      },
      {
        name: 'Fish Hatchery Unit',
        type: 'hatchery',
        description: 'Commercial scale fish hatchery for breeding and production of fish seed for research and commercial purposes.',
        capacity: '1 million fry per cycle',
        area: '500 sq meters',
        location: 'Behind Academic Block',
        facilities: [
          'Breeding pools',
          'Nursery tanks',
          'Water circulation system',
          'Temperature control system'
        ],
        yearEstablished: 2012,
        incharge: 'Mr. Suresh Kumar',
        operatingHours: '24/7 monitoring',
        isActive: true,
        createdBy: admin._id
      },
      {
        name: 'Central Library',
        type: 'library',
        description: 'Well-equipped library with extensive collection of books, journals, and digital resources related to fishery science.',
        capacity: '100 readers',
        area: '300 sq meters',
        location: 'Academic Block B, First Floor',
        facilities: [
          'Book collection (5000+ titles)',
          'Digital library access',
          'Reading halls',
          'Computer terminals'
        ],
        yearEstablished: 1999,
        incharge: 'Mrs. Sunita Sharma',
        operatingHours: '8:00 AM - 8:00 PM (Monday to Saturday)',
        isActive: true,
        createdBy: admin._id
      }
    ]);
    console.log(`${infrastructure.length} infrastructure items seeded`);


    // Seed Content
    console.log('Seeding content...');
    const content = await Content.insertMany([
      {
        key: 'dean_message',
        title: 'Dean\'s Message',
        content: 'Welcome to Fishery College Jabalpur, where excellence meets innovation in the field of fishery science and aquaculture. As the Dean of this prestigious institution, I am proud to lead a community of dedicated faculty, passionate students, and committed staff who work tirelessly to advance the frontiers of knowledge in fishery science...',
        type: 'html',
        section: 'about',
        subsection: 'dean-message',
        isPublished: true,
        order: 1,
        lastModifiedBy: admin._id
      },
      {
        key: 'vision_statement',
        title: 'Vision Statement',
        content: 'To be a globally recognized center of Excellence in Fishery education, research, and extension, contributing to sustainable aquaculture development and food security.',
        type: 'text',
        section: 'about',
        subsection: 'vision',
        isPublished: true,
        order: 1,
        lastModifiedBy: admin._id
      },
      {
        key: 'mission_statement',
        title: 'Mission Statement',
        content: 'To provide quality education, conduct innovative research, and extend knowledge to stakeholders for the advancement of fishery science and sustainable aquaculture practices.',
        type: 'text',
        section: 'about',
        subsection: 'mission',
        isPublished: true,
        order: 2,
        lastModifiedBy: admin._id
      },
      {
        key: 'admission_guidelines',
        title: 'Admission Guidelines',
        content: 'Admission to various programs at Fishery College Jabalpur is based on merit and entrance examinations. Candidates must meet the eligibility criteria specific to each program...',
        type: 'html',
        section: 'students',
        subsection: 'admission',
        isPublished: true,
        order: 1,
        lastModifiedBy: admin._id
      }
    ]);
    console.log(`${content.length} content items seeded`);

    // Seed Student Corner data
    await seedStudentCorner();

    // Seed Collaborations data
    await seedCollaborations();

    // Seed Contact data
    await seedContact();

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAdmin Login Credentials:');
    console.log('Username: admin');
    console.log('Email: admin@fisherycollegejabalpur.edu.in');
    console.log('Password: admin123');
    console.log('\nYou can now start the application and login to the admin panel.');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
const runSeed = async () => {
  await connectDB();
  await seedData();
};

// Check if this file is being run directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedData, connectDB };




