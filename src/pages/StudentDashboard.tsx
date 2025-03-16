
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap, FileText, Calendar, CheckCircle, XCircle, Clock, Calendar as CalendarIcon } from 'lucide-react';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import { format, isPast, isAfter, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const StudentDashboard = () => {
  const { currentUser, logout, teachers, getStudentAssessments, getSubmission } = useAuth();
  
  // Find the teacher that created this student
  const teacher = teachers.find(t => t.id === currentUser?.createdBy);
  
  // Get assessments for this student
  const studentAssessments = currentUser 
    ? getStudentAssessments(currentUser.id)
    : [];
  
  // Filter assessments to only show those where start time has passed
  const now = new Date();
  const visibleAssessments = studentAssessments.filter(assessment => {
    const startDateTime = new Date(`${assessment.startDate}T${assessment.startTime || '00:00'}`);
    return !isAfter(startDateTime, now);
  });
  
  // Get upcoming (not yet visible) assessments
  const upcomingAssessments = studentAssessments.filter(assessment => {
    const startDateTime = new Date(`${assessment.startDate}T${assessment.startTime || '00:00'}`);
    return isAfter(startDateTime, now);
  });
  
  // Sort visible assessments by due date (upcoming first, then overdue)
  const sortedAssessments = [...visibleAssessments].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    const nowDate = new Date();
    
    // If both are overdue or both are not overdue, sort by date
    if ((isPast(dateA) === isPast(dateB))) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // Put non-overdue (upcoming) assessments first
    return isPast(dateA) ? 1 : -1;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                Student Dashboard
              </h1>
              <p className="text-gray-500">
                Welcome, {currentUser?.name || 'Student'}
              </p>
            </div>
            
            <Button variant="outline" onClick={logout} className="shrink-0">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AnimatedCard
              delay={0.1}
              header={
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-medium">Your Profile</h2>
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{currentUser?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-medium">{teacher?.name || 'Unknown Teacher'}</p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard
              delay={0.2}
              header={
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-medium">Assessment Summary</h2>
                </div>
              }
            >
              {currentUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-blue-700">
                        {studentAssessments.length}
                      </p>
                      <p className="text-sm text-blue-600">Total Assessments</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-green-700">
                        {sortedAssessments.filter(a => {
                          const submission = getSubmission(a.id, currentUser.id);
                          return submission?.isCompleted;
                        }).length}
                      </p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                  </div>
                  
                  {/* Upcoming assessments section */}
                  {upcomingAssessments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Scheduled Assessments</p>
                      <div className="space-y-2">
                        {upcomingAssessments
                          .slice(0, 2)
                          .map(assessment => {
                            const startDateTime = new Date(`${assessment.startDate}T${assessment.startTime || '00:00'}`);
                            
                            return (
                              <div 
                                key={assessment.id}
                                className="bg-white border rounded-md p-3 flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium line-clamp-1">{assessment.title}</p>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    <span>Starts: {format(startDateTime, 'PP pp')}</span>
                                  </div>
                                </div>
                                
                                <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  
                  {/* Active assessments */}
                  {sortedAssessments.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Active Assessments</p>
                      <div className="space-y-2">
                        {sortedAssessments
                          .filter(a => !isPast(new Date(a.dueDate)))
                          .slice(0, 2)
                          .map(assessment => {
                            const submission = currentUser 
                              ? getSubmission(assessment.id, currentUser.id)
                              : undefined;
                            
                            return (
                              <div 
                                key={assessment.id}
                                className="bg-white border rounded-md p-3 flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium line-clamp-1">{assessment.title}</p>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>Due: {format(new Date(assessment.dueDate), 'PP')}</span>
                                  </div>
                                </div>
                                
                                {submission?.isCompleted ? (
                                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Pending</Badge>
                                )}
                              </div>
                            );
                          })}
                        
                        {sortedAssessments.filter(a => !isPast(new Date(a.dueDate))).length === 0 && (
                          <p className="text-gray-500 text-sm italic">No active assessments</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full"
                  >
                    <Link to="#assessments">
                      View All Assessments
                    </Link>
                  </Button>
                </div>
              )}
            </AnimatedCard>
          </div>

          <AnimatedCard
            delay={0.3}
            id="assessments"
            header={
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-medium">Your Assessments</h2>
              </div>
            }
          >
            {sortedAssessments.length > 0 || upcomingAssessments.length > 0 ? (
              <div className="space-y-6">
                {/* Render upcoming assessments that aren't visible yet */}
                {upcomingAssessments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Upcoming Assessments</h3>
                    <div className="space-y-4">
                      {upcomingAssessments.map(assessment => {
                        const startDateTime = new Date(`${assessment.startDate}T${assessment.startTime || '00:00'}`);
                        
                        return (
                          <div 
                            key={assessment.id}
                            className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-lg mb-1">{assessment.title}</h3>
                                  <p className="text-gray-500 text-sm mb-4">
                                    {assessment.description || "No description provided"}
                                  </p>
                                </div>
                                
                                <Badge className="bg-blue-100 text-blue-800">
                                  Upcoming
                                </Badge>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                  Starts: {format(startDateTime, 'PPP p')}
                                </span>
                              </div>
                              
                              <div className="p-3 bg-gray-50 rounded-md mt-4">
                                <p className="text-sm text-gray-600">
                                  This assessment will be available to take when it starts.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Render visible assessments */}
                {sortedAssessments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Active Assessments</h3>
                    <div className="space-y-4">
                      {sortedAssessments.map(assessment => {
                        const submission = currentUser 
                          ? getSubmission(assessment.id, currentUser.id)
                          : undefined;
                        
                        const isOverdue = isPast(new Date(assessment.dueDate));
                        
                        return (
                          <div 
                            key={assessment.id}
                            className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-lg mb-1">{assessment.title}</h3>
                                  <p className="text-gray-500 text-sm mb-4">
                                    {assessment.description || "No description provided"}
                                  </p>
                                </div>
                                
                                {submission?.isCompleted ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Completed
                                  </Badge>
                                ) : isOverdue ? (
                                  <Badge variant="destructive">
                                    <XCircle className="h-3 w-3 mr-1" /> Overdue
                                  </Badge>
                                ) : submission ? (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                                    <Clock className="h-3 w-3 mr-1" /> In Progress
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" /> Not Started
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-500 mb-2">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className={isOverdue ? 'text-red-500' : ''}>
                                  Due: {format(new Date(assessment.dueDate), 'PPP')}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-500 mb-4">
                                <FileText className="h-4 w-4 mr-2" />
                                <span>{assessment.questions.length} Questions</span>
                              </div>
                              
                              {submission?.marksAwarded !== undefined && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                                  <p className="text-sm font-medium text-blue-800">Your Mark</p>
                                  <p className="text-xl font-bold text-blue-900">
                                    {submission.marksAwarded} / {assessment.questions.reduce((total, q) => total + q.marks, 0)}
                                  </p>
                                </div>
                              )}
                              
                              <Button 
                                asChild 
                                variant={submission?.isCompleted || isOverdue ? "outline" : "default"}
                                className="w-full"
                                disabled={submission?.isCompleted && submission?.marksAwarded === undefined}
                              >
                                <Link to={`/student-assessment/${assessment.id}`}>
                                  {submission?.isCompleted 
                                    ? (submission?.marksAwarded !== undefined ? 'View Results' : 'Waiting for Marking') 
                                    : (isOverdue ? 'View Assessment (Overdue)' : 'Start Assessment')}
                                </Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No assessments yet</h3>
                <p className="text-gray-500">
                  Your teacher hasn't assigned any assessments yet.
                </p>
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
