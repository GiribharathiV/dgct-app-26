
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
  createdBy?: string;
};

type Student = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdBy: string;
};

type Question = {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  type: 'text' | 'multiple-choice';
};

type Assessment = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  startDate: string;
  startTime: string;
  dueDate: string;
  dueTime: string;
  questions: Question[];
  createdAt: string;
};

type Submission = {
  id: string;
  assessmentId: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
  submittedAt: string;
  isCompleted: boolean;
  marksAwarded?: number;
  autoGradedMarks?: number;
  tabSwitched?: boolean;
};

type AuthContextType = {
  currentUser: User | null;
  students: Student[];
  teachers: User[];
  assessments: Assessment[];
  submissions: Submission[];
  loading: boolean;
  teacherPasswords: Record<string, string>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createStudent: (name: string, email: string, password: string) => Promise<Student>;
  deleteStudent: (studentId: string) => Promise<void>;
  addTeacher: (name: string, email: string, password: string) => Promise<void>;
  createTeacher: (name: string, email: string, password: string) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;
  createAssessment: (
    title: string,
    description: string,
    startDate: string,
    startTime: string,
    dueDate: string,
    dueTime: string,
    questions: Omit<Question, 'id'>[]
  ) => Promise<Assessment>;
  getTeacherAssessments: (teacherId: string) => Assessment[];
  getStudentAssessments: (studentId: string) => Assessment[];
  submitAssessment: (
    assessmentId: string,
    studentId: string,
    answers: {
      questionId: string;
      answer: string;
    }[],
    tabSwitched?: boolean
  ) => Promise<void>;
  getSubmission: (assessmentId: string, studentId: string) => Submission | undefined;
  getAssessmentSubmissions: (assessmentId: string) => Submission[];
  awardMarks: (submissionId: string, marksAwarded: number) => Promise<void>;
  getAssessmentById: (assessmentId: string) => Assessment | undefined;
  getAllAssessments: () => Assessment[];
  getAllSubmissions: () => Submission[];
  getAllStudents: () => Student[];
  canStudentTakeAssessment: (assessmentId: string, studentId: string) => boolean;
  isAssessmentActive: (assessment: Assessment) => boolean;
  deleteAssessment: (assessmentId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminUser: User = { id: 'admin1', name: 'Admin User', email: 'admin@example.com', role: 'admin' };

const teacherPasswords: Record<string, string> = {
  'admin@example.com': 'adminpass',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<User[]>([adminUser]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
    
    const savedAssessments = localStorage.getItem('assessments');
    if (savedAssessments) {
      setAssessments(JSON.parse(savedAssessments));
    }
    
    const savedSubmissions = localStorage.getItem('submissions');
    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students]);
  
  useEffect(() => {
    if (assessments.length > 0) {
      localStorage.setItem('assessments', JSON.stringify(assessments));
    }
  }, [assessments]);
  
  useEffect(() => {
    if (submissions.length > 0) {
      localStorage.setItem('submissions', JSON.stringify(submissions));
    }
  }, [submissions]);

  useEffect(() => {
    const savedTeachers = localStorage.getItem('teachers');
    if (savedTeachers) {
      const parsedTeachers = JSON.parse(savedTeachers);
      if (!parsedTeachers.some((t: User) => t.email === adminUser.email)) {
        parsedTeachers.push(adminUser);
      }
      setTeachers(parsedTeachers);
    }
    
    const savedTeacherPasswords = localStorage.getItem('teacherPasswords');
    if (savedTeacherPasswords) {
      Object.assign(teacherPasswords, JSON.parse(savedTeacherPasswords));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('teachers', JSON.stringify(teachers));
  }, [teachers]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const user = teachers.find(t => t.email === email);
      if (user && teacherPasswords[email] === password) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}`);
        return true;
      }
      
      const student = students.find(s => s.email === email && s.password === password);
      if (student) {
        const studentUser: User = {
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'student',
          createdBy: student.createdBy
        };
        setCurrentUser(studentUser);
        localStorage.setItem('currentUser', JSON.stringify(studentUser));
        toast.success(`Welcome, ${student.name}`);
        return true;
      }
      
      toast.error('Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.info('You have been logged out');
  };

  const createStudent = async (name: string, email: string, password: string): Promise<Student> => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can create students');
    }
    
    if (students.some(s => s.email === email)) {
      throw new Error('A student with this email already exists');
    }
    
    const newStudent: Student = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdBy: currentUser.id,
    };
    
    setStudents(prev => [...prev, newStudent]);
    toast.success(`Student ${name} created successfully`);
    return newStudent;
  };

  const deleteStudent = async (studentId: string): Promise<void> => {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
      throw new Error('Only teachers and admins can delete students');
    }
    
    const studentToDelete = students.find(s => s.id === studentId);
    
    if (!studentToDelete) {
      throw new Error('Student not found');
    }
    
    if (currentUser.role === 'teacher' && studentToDelete.createdBy !== currentUser.id) {
      throw new Error('You can only delete students you created');
    }
    
    const updatedSubmissions = submissions.filter(s => s.studentId !== studentId);
    setSubmissions(updatedSubmissions);
    
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    
    toast.success(`Student ${studentToDelete.name} deleted successfully`);
  };

  const addTeacher = async (name: string, email: string, password: string): Promise<void> => {
    if (teachers.some(t => t.email === email)) {
      throw new Error('A teacher with this email already exists');
    }
    
    const newTeacher: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'teacher',
    };
    
    (teacherPasswords as any)[email] = password;
    
    setTeachers(prev => [...prev, newTeacher]);
    
    localStorage.setItem('teachers', JSON.stringify([...teachers, newTeacher]));
    localStorage.setItem('teacherPasswords', JSON.stringify(teacherPasswords));
    
    toast.success(`Teacher ${name} added successfully`);
  };

  const createTeacher = async (name: string, email: string, password: string): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admin can create teachers');
    }
    
    if (teachers.some(t => t.email === email)) {
      throw new Error('A teacher with this email already exists');
    }
    
    const newTeacher: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'teacher',
    };
    
    (teacherPasswords as any)[email] = password;
    
    setTeachers(prev => [...prev, newTeacher]);
    
    localStorage.setItem('teachers', JSON.stringify([...teachers, newTeacher]));
    localStorage.setItem('teacherPasswords', JSON.stringify(teacherPasswords));
    
    toast.success(`Teacher ${name} created successfully`);
  };

  const createAssessment = async (
    title: string,
    description: string,
    startDate: string,
    startTime: string,
    dueDate: string,
    dueTime: string,
    questions: Omit<Question, 'id'>[]
  ): Promise<Assessment> => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can create assessments');
    }
    
    const questionsWithIds = questions.map(q => ({
      ...q,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
    }));
    
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      title,
      description,
      createdBy: currentUser.id,
      startDate,
      startTime,
      dueDate,
      dueTime,
      questions: questionsWithIds,
      createdAt: new Date().toISOString(),
    };
    
    setAssessments(prev => [...prev, newAssessment]);
    toast.success(`Assessment "${title}" created successfully`);
    return newAssessment;
  };

  const getTeacherAssessments = (teacherId: string): Assessment[] => {
    return assessments.filter(assessment => assessment.createdBy === teacherId);
  };

  const getStudentAssessments = (studentId: string): Assessment[] => {
    const student = students.find(s => s.id === studentId);
    if (!student) return [];
    
    return assessments.filter(assessment => assessment.createdBy === student.createdBy);
  };

  const submitAssessment = async (
    assessmentId: string,
    studentId: string,
    answers: { questionId: string; answer: string }[],
    tabSwitched: boolean = false
  ): Promise<void> => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    const isCompleted = tabSwitched || answers.length > 0;
    
    // Calculate auto-graded marks for MCQs
    let autoGradedMarks = 0;
    if (isCompleted) {
      assessment.questions.forEach(question => {
        if (question.type === 'multiple-choice' && question.correctAnswer) {
          const studentAnswer = answers.find(a => a.questionId === question.id)?.answer;
          if (studentAnswer === question.correctAnswer) {
            autoGradedMarks += question.marks;
          }
        }
      });
    }
    
    // Calculate total possible MCQ marks
    const totalMcqMarks = assessment.questions
      .filter(q => q.type === 'multiple-choice')
      .reduce((total, q) => total + q.marks, 0);
    
    // Calculate total possible text marks
    const totalTextMarks = assessment.questions
      .filter(q => q.type === 'text')
      .reduce((total, q) => total + q.marks, 0);
    
    const existingSubmission = submissions.find(
      s => s.assessmentId === assessmentId && s.studentId === studentId
    );
    
    if (existingSubmission) {
      setSubmissions(prev => 
        prev.map(s => 
          s.id === existingSubmission.id 
            ? {
                ...s,
                answers,
                submittedAt: new Date().toISOString(),
                isCompleted,
                autoGradedMarks: isCompleted ? autoGradedMarks : undefined,
                // If teacher previously graded text answers, preserve that score
                marksAwarded: isCompleted && existingSubmission.marksAwarded !== undefined
                  ? autoGradedMarks + (existingSubmission.marksAwarded - (existingSubmission.autoGradedMarks || 0))
                  : (totalTextMarks > 0 ? undefined : autoGradedMarks), // If only MCQs, set total marks
                tabSwitched: tabSwitched || s.tabSwitched
              }
            : s
        )
      );
    } else {
      const newSubmission: Submission = {
        id: Date.now().toString(),
        assessmentId,
        studentId,
        answers,
        submittedAt: new Date().toISOString(),
        isCompleted,
        autoGradedMarks: isCompleted ? autoGradedMarks : undefined,
        // If only MCQs, set total marks. If text questions exist, leave undefined for teacher grading
        marksAwarded: totalTextMarks > 0 ? undefined : autoGradedMarks,
        tabSwitched
      };
      
      setSubmissions(prev => [...prev, newSubmission]);
    }
    
    const message = tabSwitched 
      ? 'Assessment auto-submitted due to tab switching'
      : isCompleted 
        ? 'Assessment submitted successfully' 
        : 'Assessment saved as draft';
    
    toast.success(message);
  };

  const getSubmission = (assessmentId: string, studentId: string): Submission | undefined => {
    return submissions.find(
      s => s.assessmentId === assessmentId && s.studentId === studentId
    );
  };

  const getAssessmentSubmissions = (assessmentId: string): Submission[] => {
    return submissions.filter(s => s.assessmentId === assessmentId);
  };

  const awardMarks = async (submissionId: string, marksAwarded: number): Promise<void> => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    // Get the assessment to calculate MCQ and text marks
    const assessment = assessments.find(a => a.id === submission.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    
    // Get auto-graded MCQ marks (or default to 0)
    const autoGradedMarks = submission.autoGradedMarks || 0;
    
    // Ensure the teacher is only awarding marks for the text answers
    // and combining with the auto-graded MCQ marks
    setSubmissions(prev => 
      prev.map(s => 
        s.id === submissionId 
          ? { ...s, marksAwarded } 
          : s
      )
    );
    
    toast.success('Marks awarded successfully');
  };

  const getAssessmentById = (assessmentId: string): Assessment | undefined => {
    return assessments.find(a => a.id === assessmentId);
  };

  const getAllAssessments = (): Assessment[] => {
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }
    return assessments;
  };

  const getAllSubmissions = (): Submission[] => {
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }
    return submissions;
  };

  const getAllStudents = (): Student[] => {
    if (!currentUser || currentUser.role !== 'admin') {
      return [];
    }
    return students;
  };

  const deleteTeacher = async (teacherId: string): Promise<void> => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Only admin can delete teachers');
    }
    
    const teacherToDelete = teachers.find(t => t.id === teacherId);
    
    if (!teacherToDelete) {
      throw new Error('Teacher not found');
    }

    if (teacherToDelete.role === 'admin') {
      throw new Error('Cannot delete admin user');
    }
    
    const teacherStudents = students.filter(s => s.createdBy === teacherId);
    if (teacherStudents.length > 0) {
      throw new Error('Cannot delete teacher with students. Delete their students first.');
    }
    
    const updatedAssessments = assessments.map(assessment => {
      if (assessment.createdBy === teacherId) {
        return { ...assessment, createdBy: 'admin1' };
      }
      return assessment;
    });
    
    setAssessments(updatedAssessments);
    
    delete (teacherPasswords as any)[teacherToDelete.email];
    
    const updatedTeachers = teachers.filter(t => t.id !== teacherId);
    setTeachers(updatedTeachers);
    
    localStorage.setItem('teachers', JSON.stringify(updatedTeachers));
    localStorage.setItem('teacherPasswords', JSON.stringify(teacherPasswords));
    localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
    
    toast.success(`Teacher ${teacherToDelete.name} deleted successfully`);
  };

  const canStudentTakeAssessment = (assessmentId: string, studentId: string): boolean => {
    const submission = getSubmission(assessmentId, studentId);
    return !submission || (!submission.isCompleted && !submission.tabSwitched);
  };

  const isAssessmentActive = (assessment: Assessment): boolean => {
    const now = new Date();
    
    const startDateTime = new Date(`${assessment.startDate}T${assessment.startTime}`);
    const endDateTime = new Date(`${assessment.dueDate}T${assessment.dueTime}`);
    
    return now >= startDateTime && now <= endDateTime;
  };

  const deleteAssessment = async (assessmentId: string): Promise<void> => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can delete assessments');
    }
    
    const assessmentToDelete = assessments.find(a => a.id === assessmentId);
    
    if (!assessmentToDelete) {
      throw new Error('Assessment not found');
    }
    
    if (assessmentToDelete.createdBy !== currentUser.id) {
      throw new Error('You can only delete assessments you created');
    }
    
    const updatedSubmissions = submissions.filter(s => s.assessmentId !== assessmentId);
    setSubmissions(updatedSubmissions);
    
    const updatedAssessments = assessments.filter(a => a.id !== assessmentId);
    setAssessments(updatedAssessments);
    
    localStorage.setItem('assessments', JSON.stringify(updatedAssessments));
    localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
    
    toast.success(`Assessment "${assessmentToDelete.title}" deleted successfully`);
  };

  const value = {
    currentUser,
    students,
    teachers,
    assessments,
    submissions,
    loading,
    teacherPasswords,
    login,
    logout,
    createStudent,
    deleteStudent,
    addTeacher,
    createTeacher,
    deleteTeacher,
    createAssessment,
    getTeacherAssessments,
    getStudentAssessments,
    submitAssessment,
    getSubmission,
    getAssessmentSubmissions,
    awardMarks,
    getAssessmentById,
    getAllAssessments,
    getAllSubmissions,
    getAllStudents,
    canStudentTakeAssessment,
    isAssessmentActive,
    deleteAssessment,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
