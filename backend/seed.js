const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Note = require('./models/Note');
const Document = require('./models/Document');
const Event = require('./models/Event');
const Memory = require('./models/Memory');
const Institution = require('./models/Institution');
const Classroom = require('./models/Classroom');
const Assessment = require('./models/Assessment');

const MONGO_URI = process.env.MONGODB_URI;

async function seedData() {
  if (!MONGO_URI) {
    console.error('❌ MONGODB_URI is not configured in backend/.env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully.');

  // 1. Seed or Upsert Demo Institution
  console.log('Seeding Institution: INST-DEMO...');
  let inst = await Institution.findOne({ code: 'INST-DEMO' });
  const campusDepartments = [
    'Computer Science & AI',
    'Data Science & Analytics',
    'Electrical & Robotics Engineering',
    'Applied Mathematics & Cryptography',
    'Software Architecture',
  ];

  if (!inst) {
    inst = await Institution.create({
      name: 'Synexora Institute of Technology & AI',
      code: 'INST-DEMO',
      domain: 'synexora.edu',
      bannerTheme: 'indigo',
      plan: 'enterprise',
      maxSeats: 500,
      usedSeats: 12,
      departments: campusDepartments,
      status: 'active',
      contactEmail: 'admin@synexora.edu',
      phone: '+1 (555) 234-5678',
      address: '100 University Avenue, Silicon Valley Tech Park, CA',
    });
    console.log('   Created Institution INST-DEMO');
  } else {
    inst.name = 'Synexora Institute of Technology & AI';
    inst.domain = 'synexora.edu';
    inst.departments = campusDepartments;
    inst.plan = 'enterprise';
    inst.maxSeats = 500;
    inst.status = 'active';
    await inst.save();
    console.log('   Updated Institution INST-DEMO');
  }

  // 2. Demo Core Users List
  const demoUsers = [
    {
      email: 'admin@synexora.com',
      name: 'Dr. Alexander Vance',
      password: 'admin123',
      role: 'super_admin',
      department: 'Platform Engineering',
      major: 'Master Platform Operations',
      university: 'Synexora Global Platform',
      institutionCode: '',
    },
    {
      email: 'admin@synexora.edu',
      name: 'Dean Eleanor Thorne',
      password: 'admin123',
      role: 'institution_admin',
      department: 'Computer Science & AI',
      major: 'Artificial Intelligence & Systems',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    // Campus Faculty Teachers
    {
      email: 'teacher@synexora.edu',
      name: 'Prof. Marcus Sterling',
      password: 'teacher123',
      role: 'institution_teacher',
      department: 'Computer Science & AI',
      designation: 'Professor & HOD',
      facultyIdNumber: 'FAC-CS-101',
      major: 'Distributed Systems & AI',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    {
      email: 'sarah.mitchell@synexora.edu',
      name: 'Dr. Sarah Mitchell',
      password: 'teacher123',
      role: 'institution_teacher',
      department: 'Computer Science & AI',
      designation: 'Associate Professor',
      facultyIdNumber: 'FAC-AI-204',
      major: 'Machine Learning & Neural Nets',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    {
      email: 'elena.rostova@synexora.edu',
      name: 'Dr. Elena Rostova',
      password: 'teacher123',
      role: 'institution_teacher',
      department: 'Data Science & Analytics',
      designation: 'Assistant Professor',
      facultyIdNumber: 'FAC-DS-308',
      major: 'Big Data & Knowledge Graphs',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    {
      email: 'vikram.anand@synexora.edu',
      name: 'Prof. Vikram Anand',
      password: 'teacher123',
      role: 'institution_teacher',
      department: 'Electrical & Robotics Engineering',
      designation: 'Lecturer / Instructor',
      facultyIdNumber: 'FAC-EE-412',
      major: 'Autonomous Robotics',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    // Campus Enrolled Students
    {
      email: 'student@synexora.edu',
      name: 'Aria Chen',
      password: 'student123',
      role: 'institution_student',
      department: 'Computer Science & AI',
      studentIdNumber: 'CS-2026-088',
      batchYear: '2024-2028',
      major: 'Computer Science & AI',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    {
      email: 'liam.oc@synexora.edu',
      name: "Liam O'Connor",
      password: 'student123',
      role: 'institution_student',
      department: 'Data Science & Analytics',
      studentIdNumber: 'DS-2026-042',
      batchYear: '2024-2028',
      major: 'Data Science & Analytics',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    {
      email: 'sophia.rivera@synexora.edu',
      name: 'Sophia Rivera',
      password: 'student123',
      role: 'institution_student',
      department: 'Computer Science & AI',
      studentIdNumber: 'CS-2026-119',
      batchYear: '2023-2027',
      major: 'Computer Science & AI',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    {
      email: 'rohan.mehta@synexora.edu',
      name: 'Rohan Mehta',
      password: 'student123',
      role: 'institution_student',
      department: 'Electrical & Robotics Engineering',
      studentIdNumber: 'EE-2026-056',
      batchYear: '2024-2028',
      major: 'Robotics & Control Systems',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    {
      email: 'maya.patel@synexora.edu',
      name: 'Maya Patel',
      password: 'student123',
      role: 'institution_student',
      department: 'Applied Mathematics & Cryptography',
      studentIdNumber: 'MATH-2026-015',
      batchYear: '2025-2029',
      major: 'Applied Mathematics',
      university: 'Synexora Institute of Technology',
      institutionId: inst._id,
      institutionCode: 'INST-DEMO',
    },
    // Personal Self-Paced Learner
    {
      email: 'learner@example.com',
      name: 'Julian Hayes',
      password: 'student123',
      role: 'personal_student',
      department: 'Independent Studies',
      major: 'Machine Learning & Mathematics',
      university: 'Self-Paced Track',
      institutionCode: '',
    },
  ];

  console.log('Seeding Demo Users and associated realistic records...');
  // Clean up old demo classrooms
  await Classroom.deleteMany({
    $or: [
      { institutionId: inst._id },
      { institutionCode: 'INST-DEMO' },
      { code: { $in: ['CS301-ML', 'CS204-DS', 'DS210-BD', 'EE412-RO'] } },
    ],
  });

  for (const userData of demoUsers) {
    let user = await User.findOne({ email: userData.email });
    if (!user) {
      user = new User(userData);
      await user.save();
      console.log(`   Created User: ${user.name} (${user.email}) - ${user.role}`);
    } else {
      user.name = userData.name;
      user.password = userData.password;
      user.role = userData.role;
      user.accountStatus = 'active';
      user.department = userData.department;
      user.major = userData.major;
      user.university = userData.university;
      user.institutionCode = userData.institutionCode;
      if (userData.institutionId) user.institutionId = userData.institutionId;
      if (userData.studentIdNumber) user.studentIdNumber = userData.studentIdNumber;
      if (userData.facultyIdNumber) user.facultyIdNumber = userData.facultyIdNumber;
      if (userData.designation) user.designation = userData.designation;
      if (userData.batchYear) user.batchYear = userData.batchYear;
      await user.save();
      console.log(`   Updated User: ${user.name} (${user.email}) - ${user.role}`);
    }

    // Link adminUser in Institution
    if (user.role === 'institution_admin') {
      inst.adminUser = user._id;
      await inst.save();
    }

    // Clear old sample records
    await Task.deleteMany({ user: user._id });
    await Note.deleteMany({ user: user._id });
    await Document.deleteMany({ user: user._id });
    await Event.deleteMany({ user: user._id });
    await Memory.deleteMany({ user: user._id });
    await Assessment.deleteMany({ user: user._id });

    // Seed Role-Specific Data
    if (user.role === 'super_admin') {
      await Task.create([
        {
          user: user._id,
          title: 'Audit semester enrollment quotas across campuses',
          course: 'Platform Governance',
          priority: 'high',
          dueDate: '2026-10-01',
          completed: false,
        },
        {
          user: user._id,
          title: 'Review automated model fallback latencies',
          course: 'Infrastructure',
          priority: 'medium',
          dueDate: '2026-10-05',
          completed: true,
        },
      ]);

      await Note.create([
        {
          user: user._id,
          title: 'Synexora Multi-Campus Architecture & Security Protocols',
          tag: 'Architecture',
          content: '### Platform Security & Role Isolation\n- **Super Admin:** Master platform metrics, tenant provisioning, system telemetry.\n- **Campus Admin:** Departmental courses, faculty governance, classroom management.\n- **Institute Teacher:** Assignment authoring, automated rubrics, live classroom discussions.\n- **Campus Student:** Coursework, assignments, active recall study repository.\n- **Personal Learner:** Independent curriculum, self-paced diagnostic evaluations.',
        },
      ]);
    }

    if (user.role === 'institution_admin') {
      await Task.create([
        {
          user: user._id,
          title: 'Review Fall 2026 Faculty Teaching Load & Classrooms',
          course: 'Faculty Governance',
          priority: 'high',
          dueDate: '2026-10-02',
          completed: false,
        },
        {
          user: user._id,
          title: 'Approve new AI Lab workstations budget',
          course: 'Campus Operations',
          priority: 'medium',
          dueDate: '2026-10-06',
          completed: false,
        },
        {
          user: user._id,
          title: 'Verify semester seat quota utilization & student roster',
          course: 'Academic Administration',
          priority: 'low',
          dueDate: '2026-09-28',
          completed: true,
        },
      ]);

      await Note.create([
        {
          user: user._id,
          title: 'Department AI Curriculum Roadmap 2026-2027',
          tag: 'Faculty Roadmap',
          content: '### Core Milestones for Synexora Campus\n1. Provision all teaching staff with AI Socratic evaluation assistants.\n2. Enable real-time classroom telemetry and participation tracking.\n3. Integrate automated diagnostic assessments for active-recall reinforcement.',
        },
      ]);

      await Document.create([
        {
          user: user._id,
          name: 'Campus_Faculty_Governance_Charter_2026.pdf',
          category: 'Administration',
          size: '1.1 MB',
          fileType: 'pdf',
          summary: 'Official faculty governance standards, tenure guidelines, and teaching criteria.',
        },
      ]);

      await Event.create([
        {
          user: user._id,
          title: 'Campus Faculty & Academic Senate General Assembly',
          date: '2026-10-05',
          time: '10:00 AM',
          type: 'lecture',
          course: 'Administration',
        },
      ]);

      // Seed Assessments for Admin
      await Assessment.deleteMany({ user: user._id });
      await Assessment.create([
        {
          user: user._id,
          title: 'CS301 Midterm: Backpropagation & Optimization',
          course: 'CS301: Deep Learning',
          date: '2026-09-20',
          score: '94%',
          status: 'completed',
        },
        {
          user: user._id,
          title: 'CS204 Diagnostic: Graph Algorithms & Red-Black Trees',
          course: 'CS204: Data Structures',
          date: '2026-09-24',
          score: '88%',
          status: 'completed',
        },
        {
          user: user._id,
          title: 'DS210 Vector Search & Embeddings Milestone',
          course: 'DS210: Big Data',
          date: '2026-10-08',
          score: 'Pending',
          status: 'upcoming',
        },
      ]);
      console.log('   Created Assessments for Campus Admin');
    }

    if (user.role === 'institution_teacher') {
      // Clear previous classrooms created by this teacher
      await Classroom.deleteMany({ creator: user._id });

      // Create distinctive classroom created by THIS teacher
      if (user.email === 'teacher@synexora.edu') {
        await Classroom.create({
          title: 'CS301: Deep Learning & Neural Architectures',
          section: 'Section A1',
          subject: 'Computer Science & AI',
          room: 'Turing Hall 102',
          code: 'CS301-ML',
          bannerTheme: 'emerald',
          institutionId: inst._id,
          institutionCode: 'INST-DEMO',
          creator: user._id,
          teachers: [user._id],
          announcements: [
            {
              authorId: user._id,
              authorName: user.name,
              authorEmail: user.email,
              content: 'Welcome to CS301! Lecture slides and initial problem set on Backpropagation calculus are now live.',
            },
          ],
          classwork: [
            {
              title: 'Assignment 1: Neural Network Backprop from Scratch in Python',
              description: 'Implement forward and backward pass for a 3-layer MLP without high-level autograd frameworks.',
              points: 100,
              topic: 'Neural Networks',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              creatorId: user._id,
            },
          ],
        });
      } else if (user.email === 'sarah.mitchell@synexora.edu') {
        await Classroom.create({
          title: 'CS204: Data Structures & Algorithmic Analysis',
          section: 'Section B2',
          subject: 'Computer Science',
          room: 'Lovelace Hall 204',
          code: 'CS204-DS',
          bannerTheme: 'indigo',
          institutionId: inst._id,
          institutionCode: 'INST-DEMO',
          creator: user._id,
          teachers: [user._id],
          announcements: [
            {
              authorId: user._id,
              authorName: user.name,
              authorEmail: user.email,
              content: 'Reminder: Graph traversal algorithms (BFS, DFS, Dijkstra) will be tested in our lab milestone next week.',
            },
          ],
        });
      } else if (user.email === 'elena.rostova@synexora.edu') {
        await Classroom.create({
          title: 'DS210: Big Data Analytics & Vector Embeddings',
          section: 'Section C1',
          subject: 'Data Science & Analytics',
          room: 'Shannon Complex 305',
          code: 'DS210-BD',
          bannerTheme: 'purple',
          institutionId: inst._id,
          institutionCode: 'INST-DEMO',
          creator: user._id,
          teachers: [user._id],
          announcements: [
            {
              authorId: user._id,
              authorName: user.name,
              authorEmail: user.email,
              content: 'Hands-on lab on Approximate Nearest Neighbor Search using HNSW and Faiss.',
            },
          ],
        });
      } else if (user.email === 'vikram.anand@synexora.edu') {
        await Classroom.create({
          title: 'EE412: Autonomous Robotics & Control Systems',
          section: 'Section R1',
          subject: 'Robotics Engineering',
          room: 'Tesla Lab 412',
          code: 'EE412-RO',
          bannerTheme: 'amber',
          institutionId: inst._id,
          institutionCode: 'INST-DEMO',
          creator: user._id,
          teachers: [user._id],
          announcements: [
            {
              authorId: user._id,
              authorName: user.name,
              authorEmail: user.email,
              content: 'PID controller calibration lab notes and ROS2 workspace templates uploaded.',
            },
          ],
        });
      }

      await Task.create([
        {
          user: user._id,
          title: 'Grade CS301 Backprop Lab Submissions',
          course: 'CS301: Deep Learning',
          priority: 'high',
          dueDate: '2026-10-04',
          completed: false,
        },
        {
          user: user._id,
          title: 'Prepare Red-Black Tree Visual Demonstration',
          course: 'CS204: Data Structures',
          priority: 'medium',
          dueDate: '2026-10-09',
          completed: false,
        },
      ]);

      await Note.create([
        {
          user: user._id,
          title: 'Faculty Lecture Notes: Gradient Optimization & Loss Surfaces',
          tag: 'CS301: Deep Learning',
          content: '### Key Concepts\n- Empirical Risk Minimization vs Structural Risk.\n- Saddle points in high-dimensional non-convex loss surfaces.\n- Hessian matrix eigenvalues indicating local curvature.',
        },
      ]);
    }

    if (user.role === 'institution_student') {
      const classrooms = await Classroom.find({});
      for (const cl of classrooms) {
        if (!cl.students.includes(user._id)) {
          cl.students.push(user._id);
          await cl.save();
        }
      }

      await Task.create([
        {
          user: user._id,
          title: 'Implement Backprop & Loss Function in NumPy',
          course: 'CS301: Deep Learning',
          priority: 'high',
          dueDate: '2026-10-04',
          completed: false,
        },
        {
          user: user._id,
          title: 'Solve Red-Black Tree Balancing Problem Set',
          course: 'CS204: Data Structures',
          priority: 'medium',
          dueDate: '2026-10-09',
          completed: false,
        },
      ]);

      await Note.create([
        {
          user: user._id,
          title: 'Neural Network Optimization & SGD with Momentum',
          tag: 'CS301: Deep Learning',
          content: '### Key Formulas for Gradient Descent\n- **Standard SGD:** $\\theta_{t+1} = \\theta_t - \\eta \\nabla L(\\theta_t)$\n- **Momentum:** $v_{t+1} = \\beta v_t + (1-\\beta) \\nabla L(\\theta_t)$',
        },
      ]);

      await Memory.create([
        {
          user: user._id,
          concept: 'Backpropagation Chain Rule',
          definition: 'A method used in artificial neural networks to calculate a gradient that is needed in the calculation of the weights to be used in the network.',
          course: 'CS301: Deep Learning',
          source: 'learning-ai',
        },
      ]);
    }

    if (user.role === 'personal_student') {
      await Task.create([
        {
          user: user._id,
          title: 'Complete Socratic AI Prompt Engineering Workshop',
          course: 'Machine Learning',
          priority: 'high',
          dueDate: '2026-10-02',
          completed: false,
        },
      ]);
    }
  }

  // Update total used seats on institution
  const totalStudentsCount = await User.countDocuments({
    institutionId: inst._id,
    role: 'institution_student',
  });
  inst.usedSeats = totalStudentsCount;
  await inst.save();

  console.log(`✅ Realistic sample data seeded successfully for all roles! Institution used seats: ${inst.usedSeats}`);
  await mongoose.disconnect();
  process.exit(0);
}

seedData().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
