/**
 * Built-in form templates.
 * Each template is a plain JS object that matches the FormBuilderContext `form` shape.
 * When a template is selected, it is written to sessionStorage and read by FormBuilder on mount.
 */

const sid = (n) => `tpl-section-${n}`;
const qid = (n) => `tpl-question-${n}`;

const TEMPLATES = [
  /* ─────────────────────────────────────────────────────── */
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Collect name, email, and a message from visitors.',
    icon: '📬',
    color: '#4F46E5',
    category: 'Business',
    form: {
      title: 'Contact Us',
      description: 'Fill in the form below and we\'ll get back to you as soon as possible.',
      headerImage: null,
      settings: { theme: { primaryColor: '#4F46E5', fontFamily: 'Inter, sans-serif' } },
      sections: [{ id: sid(1), title: '', description: '', order: 0 }],
      questions: [
        { id: qid(1), type: 'short_answer', title: 'Full Name', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(2), type: 'short_answer', title: 'Email Address', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(3), type: 'short_answer', title: 'Subject', description: '', required: false, options: [], sectionId: sid(1), logic: [] },
        { id: qid(4), type: 'paragraph', title: 'Message', description: 'Please describe how we can help you.', required: true, options: [], sectionId: sid(1), logic: [] },
      ],
    },
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id: 'feedback',
    name: 'Customer Feedback',
    description: 'Measure satisfaction and collect actionable feedback.',
    icon: '⭐',
    color: '#F59E0B',
    category: 'Business',
    form: {
      title: 'Customer Feedback Survey',
      description: 'Your feedback helps us improve. This survey takes less than 2 minutes.',
      headerImage: null,
      settings: {
        confirmationMessage: 'Thank you for your feedback! We truly appreciate it.',
        theme: { primaryColor: '#F59E0B', fontFamily: 'Inter, sans-serif' },
      },
      sections: [{ id: sid(1), title: '', description: '', order: 0 }],
      questions: [
        { id: qid(1), type: 'linear_scale', title: 'How satisfied are you with our service?', description: '1 = Very Dissatisfied, 5 = Very Satisfied', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(2), type: 'multiple_choice', title: 'Which aspect did you like most?', description: '', required: false, options: ['Customer support', 'Product quality', 'Delivery speed', 'Pricing', 'Other'], sectionId: sid(1), logic: [] },
        { id: qid(3), type: 'multiple_choice', title: 'How likely are you to recommend us?', description: '', required: true, options: ['Definitely would', 'Probably would', 'Not sure', 'Probably not', 'Definitely not'], sectionId: sid(1), logic: [] },
        { id: qid(4), type: 'paragraph', title: 'Any additional comments or suggestions?', description: '', required: false, options: [], sectionId: sid(1), logic: [] },
      ],
    },
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id: 'event',
    name: 'Event Registration',
    description: 'Register attendees for a conference, workshop, or meetup.',
    icon: '🎟️',
    color: '#10B981',
    category: 'Events',
    form: {
      title: 'Event Registration',
      description: 'Register your spot for our upcoming event. Spaces are limited!',
      headerImage: null,
      settings: {
        collectEmail: true,
        confirmationMessage: 'You\'re registered! Check your email for confirmation details.',
        theme: { primaryColor: '#10B981', fontFamily: 'Inter, sans-serif' },
      },
      sections: [
        { id: sid(1), title: 'Personal Details', description: '', order: 0 },
        { id: sid(2), title: 'Event Preferences', description: '', order: 1 },
      ],
      questions: [
        { id: qid(1), type: 'short_answer', title: 'First Name', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(2), type: 'short_answer', title: 'Last Name', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(3), type: 'short_answer', title: 'Organisation / Company', description: '', required: false, options: [], sectionId: sid(1), logic: [] },
        { id: qid(4), type: 'short_answer', title: 'Phone Number', description: '', required: false, options: [], sectionId: sid(1), logic: [] },
        { id: qid(5), type: 'checkboxes', title: 'Which sessions will you attend?', description: 'Select all that apply.', required: true, options: ['Morning Keynote', 'Workshop A', 'Workshop B', 'Networking Lunch', 'Evening Panel'], sectionId: sid(2), logic: [] },
        { id: qid(6), type: 'dropdown', title: 'Dietary Requirements', description: '', required: false, options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Other'], sectionId: sid(2), logic: [] },
        { id: qid(7), type: 'paragraph', title: 'Anything we should know?', description: 'Accessibility needs, special requests, etc.', required: false, options: [], sectionId: sid(2), logic: [] },
      ],
    },
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id: 'quiz',
    name: 'Knowledge Quiz',
    description: 'A simple multiple-choice quiz with a comprehension passage.',
    icon: '🧠',
    color: '#7C3AED',
    category: 'Education',
    form: {
      title: 'General Knowledge Quiz',
      description: 'Test your knowledge with these questions. Good luck!',
      headerImage: null,
      settings: {
        confirmationMessage: 'Quiz submitted! Your responses have been recorded.',
        theme: { primaryColor: '#7C3AED', fontFamily: 'Outfit, sans-serif' },
      },
      sections: [{ id: sid(1), title: '', description: '', order: 0 }],
      questions: [
        { id: qid(1), type: 'short_answer', title: 'What is your name?', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(2), type: 'multiple_choice', title: 'Which planet is closest to the Sun?', description: '', required: true, options: ['Venus', 'Mercury', 'Earth', 'Mars'], sectionId: sid(1), logic: [] },
        { id: qid(3), type: 'multiple_choice', title: 'What is the capital of Japan?', description: '', required: true, options: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'], sectionId: sid(1), logic: [] },
        { id: qid(4), type: 'checkboxes', title: 'Which of these are programming languages?', description: 'Select all that apply.', required: true, options: ['Python', 'HTML', 'JavaScript', 'Photoshop', 'Rust'], sectionId: sid(1), logic: [] },
        { id: qid(5), type: 'comprehension', title: 'Reading Comprehension', description: 'Read the passage and answer the questions below.', required: false, options: [], sectionId: sid(1), passage: 'The Internet is a global network of computers connected together to share information. It was originally developed as a military project in the 1960s and became publicly available in the early 1990s. Today, billions of people use the Internet for communication, education, commerce, and entertainment.', subQuestions: [{ id: 'sq1', question: 'When did the Internet become publicly available?', answer: 'Early 1990s' }, { id: 'sq2', question: 'Name two uses of the Internet mentioned in the passage.', answer: '' }], logic: [] },
      ],
    },
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id: 'job',
    name: 'Job Application',
    description: 'Collect applicant details, experience, and availability.',
    icon: '💼',
    color: '#0EA5E9',
    category: 'HR',
    form: {
      title: 'Job Application Form',
      description: 'Apply for a position by completing this form. We\'ll be in touch within 5 business days.',
      headerImage: null,
      settings: {
        collectEmail: true,
        confirmationMessage: 'Application received! We\'ll review it and contact you soon.',
        theme: { primaryColor: '#0EA5E9', fontFamily: 'Inter, sans-serif' },
      },
      sections: [
        { id: sid(1), title: 'Personal Information', description: '', order: 0 },
        { id: sid(2), title: 'Experience & Skills', description: '', order: 1 },
      ],
      questions: [
        { id: qid(1), type: 'short_answer', title: 'Full Name', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(2), type: 'short_answer', title: 'Phone Number', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(3), type: 'dropdown', title: 'Position Applying For', description: '', required: true, options: ['Software Engineer', 'Product Designer', 'Marketing Manager', 'Data Analyst', 'Other'], sectionId: sid(1), logic: [] },
        { id: qid(4), type: 'date', title: 'Earliest Available Start Date', description: '', required: false, options: [], sectionId: sid(1), logic: [] },
        { id: qid(5), type: 'multiple_choice', title: 'Years of Relevant Experience', description: '', required: true, options: ['Less than 1 year', '1–3 years', '3–5 years', '5–10 years', '10+ years'], sectionId: sid(2), logic: [] },
        { id: qid(6), type: 'checkboxes', title: 'Key Skills', description: 'Select all that apply.', required: false, options: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Figma', 'Project Management'], sectionId: sid(2), logic: [] },
        { id: qid(7), type: 'paragraph', title: 'Why do you want to join us?', description: '', required: true, options: [], sectionId: sid(2), logic: [] },
        { id: qid(8), type: 'short_answer', title: 'Portfolio / LinkedIn / GitHub URL', description: '', required: false, options: [], sectionId: sid(2), logic: [] },
      ],
    },
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id: 'cloze-demo',
    name: 'Fill in the Blanks',
    description: 'A sample cloze exercise for language or science classes.',
    icon: '✏️',
    color: '#EC4899',
    category: 'Education',
    form: {
      title: 'Fill in the Blanks Exercise',
      description: 'Complete the sentences by filling in the missing words.',
      headerImage: null,
      settings: { theme: { primaryColor: '#EC4899', fontFamily: 'Merriweather, serif' } },
      sections: [{ id: sid(1), title: '', description: '', order: 0 }],
      questions: [
        { id: qid(1), type: 'short_answer', title: 'Student Name', description: '', required: true, options: [], sectionId: sid(1), logic: [] },
        { id: qid(2), type: 'cloze', title: 'Complete the sentence', description: 'Type the missing words in the blanks.', required: true, options: [], sectionId: sid(1), text: 'The [BLANK] is the closest star to Earth. Water freezes at [BLANK] degrees Celsius. The process by which plants make food is called [BLANK].', logic: [] },
      ],
    },
  },
];

export default TEMPLATES;
