const { GoogleGenerativeAI } = require('@google/generative-ai');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const FeeRecord = require('../models/FeeRecord');
const Class = require('../models/Class');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildSystemPrompt = async (user) => {
  let context = '';
  let roleInstructions = '';

  try {
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id })
        .populate('userId', 'name email')
        .populate('enrolledClasses', 'name subject schedule hall monthlyFee');

      const fees = await FeeRecord.find({ studentId: student?._id })
        .populate('classId', 'name subject');

      const unpaidFees = fees.filter(f =>
        f.status === 'unpaid' || f.status === 'overdue'
      );

      context = `
STUDENT CONTEXT:
Name: ${student?.userId?.name}
Admission Number: ${student?.admissionNumber}
Grade: ${student?.grade}
Stream: ${student?.stream}
School: ${student?.school}
Medium: ${student?.medium}
Status: ${student?.status}

ENROLLED CLASSES:
${student?.enrolledClasses?.map(c =>
  `- ${c.name} (${c.subject}) | ${c.schedule?.dayOfWeek} ${c.schedule?.startTime} | ${c.hall} | Rs.${c.monthlyFee}/month`
).join('\n') || 'No classes enrolled'}

FEE STATUS:
Total unpaid: Rs.${unpaidFees.reduce((s, f) => s + f.amount, 0)}
Unpaid records: ${unpaidFees.map(f =>
  `${f.classId?.name} - ${f.month} - Rs.${f.amount}`
).join(', ') || 'None'}
      `;

      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a STUDENT. Be friendly, encouraging and helpful.
You can help with:
- Questions about their enrolled classes, schedule, fees, attendance
- Subject explanations for A/L subjects (Physics, Chemistry, Maths, Biology etc.)
- Study tips and learning strategies
- Past paper guidance
- General institute FAQs
Always respond in a warm, encouraging tone suitable for A/L students.
Keep responses concise and clear.`;

    } else if (user.role === 'parent') {
      const parent = await Parent.findOne({ userId: user._id })
        .populate({
          path: 'students',
          populate: [
            { path: 'userId', select: 'name email' },
            { path: 'enrolledClasses', select: 'name subject schedule monthlyFee' }
          ]
        });

      context = `
PARENT CONTEXT:
Name: ${user.name}
Children: ${parent?.students?.map(s => s.userId?.name).join(', ')}

CHILDREN DETAILS:
${parent?.students?.map(s => `
- ${s.userId?.name} (${s.admissionNumber}) | Grade: ${s.grade} | Stream: ${s.stream}
  Classes: ${s.enrolledClasses?.map(c => c.name).join(', ') || 'None'}
`).join('\n')}
      `;

      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a PARENT. Be professional, reassuring and informative.
You can help with:
- Questions about their child's classes, schedule, fees
- General institute information and policies
- How to use the parent portal
- Fee payment procedures
- Attendance concerns
Always be respectful and professional.`;

    } else if (user.role === 'teacher') {
      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a TEACHER. Be professional and helpful.
You can help with:
- How to use the teacher portal
- Marking attendance procedures
- Class management questions
- Institute policies and procedures`;

    } else if (user.role === 'admin') {
      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to the ADMIN. Be concise and technical.
You can help with:
- System usage questions
- Student management procedures
- Fee and payment queries
- Attendance management
- General institute operations`;

    } else {
      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a visitor. Be welcoming and informative.
You can help with:
- Information about XenEdu institute
- Registration process
- Available subjects and classes
- Fee structure
- How to apply`;
    }
  } catch (err) {
    console.log('Context fetch error:', err.message);
  }

  return `${roleInstructions}\n\nREAL-TIME DATA:\n${context}\n\nIMPORTANT: Always respond in English unless the user writes in Sinhala or Tamil. Keep responses helpful and concise.`;
};

const cleanHistory = (conversationHistory, limit = 10) => {
  const mapped = conversationHistory
    .slice(-limit)
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  const firstUserIndex = mapped.findIndex(m => m.role === 'user');
  if (firstUserIndex === -1) return [];
  return mapped.slice(firstUserIndex);
};

// @POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const systemPrompt = await buildSystemPrompt(req.user);

    // ← Changed from gemini-2.5-flash to gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const history = cleanHistory(conversationHistory, 10);
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(message);
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ message: 'AI service error: ' + error.message });
  }
};

// @POST /api/ai/learn
const learn = async (req, res) => {
  try {
    const { message, subject, conversationHistory = [] } = req.body;

    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name');

    const systemPrompt = `You are an expert A/L tutor in Sri Lanka named Zenya.
You are helping ${student?.userId?.name || 'a student'} with ${subject || 'their A/L studies'}.
Grade: ${student?.grade || 'Grade 12'} | Stream: ${student?.stream || 'General'} | Medium: ${student?.medium || 'Sinhala'}

Your teaching style:
- Break down complex concepts into simple steps
- Use Sri Lankan A/L curriculum examples
- Provide worked examples for problems
- Give memory tips and tricks
- Encourage the student
- For Sinhala medium students, you may mix Sinhala terms when helpful
- Reference past paper patterns when relevant

Subjects you excel at: Physics, Combined Mathematics, Chemistry, Biology,
Economics, Accounting, Business Studies, History, Geography, ICT, English, Sinhala

Always be encouraging and patient. Make learning enjoyable!`;

    // ← Changed from gemini-2.5-flash to gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const history = cleanHistory(conversationHistory, 20);
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(message);

    res.status(200).json({ reply: result.response.text() });
  } catch (error) {
    console.error('AI learn error:', error.message);
    res.status(500).json({ message: 'AI service error: ' + error.message });
  }
};

module.exports = { chat, learn };