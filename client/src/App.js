
import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './Pages/Employer/Home';
import { Navbar } from './components/Navbar';
import { PostJob } from './Pages/Employer/PostJob';
import { AllJobs } from './Pages/Employer/AllJobs';
import { Login } from './components/Login/Login';
import { Register } from './components/Login/Register';
// Đã tắt chức năng quên mật khẩu
// import { ForgotPassword } from './components/Login/ForgotPassword';
// import { ResetPassword } from './components/Login/ResetPassword';
import { ChangePassword } from './components/Login/ChangePassword';
import { VerifyEmail } from './components/Login/VerifyEmail';
import { JobDetails } from './components/Home/JobDetails';
import { ShortlistedCandidates } from './components/ShortlistedCandidates';
import { ShortlistedDetails } from './components/ShortlistedDetails';
import { ApplicationForm } from './Pages/Candidate/ApplicationForm';
import {AllPostedJobs} from './components/AllPostedJobs'
// import { Dashboard } from './Pages/Dashboard'; // Đã xóa file
import { useContext, useEffect } from 'react';
import { LoginContext } from './components/ContextProvider/Context';
import { UpdateJob } from './Pages/Employer/UpdateJob';
import { MyJobs } from './Pages/Candidate/MyJobs';
import { Notifications } from './Pages/Candidate/Notifications';
import { CVUpload } from './Pages/Candidate/CVUpload';
import { RecommendedJobs } from './Pages/Candidate/RecommendedJobs';
import { InterviewPractice } from './Pages/Candidate/InterviewPractice';
import { ImproveCV } from './Pages/Candidate/ImproveCV';
import { MatchedCandidates } from './Pages/Employer/MatchedCandidates';
import { AnalyticsDashboard } from './Pages/Employer/AnalyticsDashboard';
import { CVManagement } from './Pages/Employer/CVManagement';
import { CandidateDetail } from './Pages/Employer/CandidateDetail';
import { Profile } from './Pages/Candidate/Profile';
import { CVManager } from './Pages/Candidate/CVManager';
import { CVTemplate } from './Pages/Candidate/CVTemplate';
import { CVUploadManager } from './Pages/Candidate/CVUploadManager';
import { CVGuide } from './Pages/Candidate/CVGuide';
import { CVScoreDetail } from './Pages/Candidate/CVScoreDetail';
import { AdminDashboard } from './Pages/Admin/AdminDashboard';
import { UserManagement } from './Pages/Admin/UserManagement';
import { EditUser } from './Pages/Admin/EditUser';
import { CreateUser } from './Pages/Admin/CreateUser';
import { JobManagement } from './Pages/Admin/JobManagement';
import { JobDetailAdmin } from './Pages/Admin/JobDetailAdmin';
import { CompanyManagement } from './Pages/Admin/CompanyManagement';
import { CompanyDetailAdmin } from './Pages/Admin/CompanyDetailAdmin';
import Chatbot from './components/Chatbot';
// import { TestMatchDetails } from './Pages/TestMatchDetails'; // Đã xóa file
import { AIGuideModal } from './components/AIGuideModal';

function App() {

  const {loginData, setLoginData} = useContext(LoginContext)

  

  return (
    <div className="App">
      <Routes>
          {/* <h1 className='text-5xl text-green-600 '>Hello</h1> */}
          <Route path='/' element={<Navbar />}> 
            <Route path='/' element={<Home />}/>
            <Route path='*' element={<Home />}/>
            <Route path='/post-job' element={<PostJob />}/>
            <Route path='/all-jobs' element={<AllJobs />}/>
            <Route path='/employer/cv-management' element={<CVManagement />}/>
            <Route path='/employer/candidate-detail/:applicationId' element={<CandidateDetail />}/>
            <Route path='/employer/dashboard' element={<AnalyticsDashboard />}/>
            <Route path='/login' element={<Login />}/>
            <Route path='/signup' element={<Register />}/>
            {/* Đã tắt chức năng quên mật khẩu */}
            {/* <Route path='/forgot-password' element={<ForgotPassword />}/> */}
            {/* <Route path='/reset-password' element={<ResetPassword />}/> */}
            <Route path='/change-password' element={<ChangePassword />}/>
            <Route path='/verify-email' element={<VerifyEmail />}/>


            {/* <Route path='/job-detail' element={<JobDetails />}/> */}
            <Route path='/current-job/:id' element={<JobDetails />}/>
            <Route path='/application-form/:id' element={<ApplicationForm />}/>
            <Route path='/shortlist' element={<ShortlistedCandidates />}/>
            <Route path='/shortlist/details/:candidate_id/:job_id' element={<ShortlistedDetails />}/>
            {/* <Route path='/dash' element={<Dashboard />}/> */}
            <Route path='/all-posted-jobs' element={<AllPostedJobs />}/>
            <Route path='/update-job/:id' element={<UpdateJob />}/>
            <Route path='/my-jobs/' element={<MyJobs />}/>
            <Route path='/notifications' element={<Notifications />}/>
            
            {/* AI Features Routes */}
            <Route path='/cv-upload/:id' element={<CVUpload />}/>
            <Route path='/improve-cv/:id' element={<ImproveCV />}/>
            <Route path='/recommended-jobs' element={<RecommendedJobs />}/>
            <Route path='/interview-practice/:id' element={<InterviewPractice />}/>
            <Route path='/matched-candidates/:id' element={<MatchedCandidates />}/>
            <Route path='/profile' element={<Profile />}/>
            
            {/* CV Management Routes */}
            <Route path='/cv/manager' element={<CVManager />}/>
            <Route path='/cv/template' element={<CVTemplate />}/>
            <Route path='/cv/upload' element={<CVUploadManager />}/>
            <Route path='/cv/guide' element={<CVGuide />}/>
            <Route path='/cv/score/:cvId' element={<CVScoreDetail />}/>
            
            {/* Admin Routes */}
            <Route path='/admin/dashboard' element={<AdminDashboard />}/>
            <Route path='/admin/users' element={<UserManagement />}/>
            <Route path='/admin/users/create' element={<CreateUser />}/>
            <Route path='/admin/users/edit/:userId' element={<EditUser />}/>
            <Route path='/admin/jobs' element={<JobManagement />}/>
            <Route path='/admin/jobs/detail/:id' element={<JobDetailAdmin />}/>
            <Route path='/admin/companies' element={<CompanyManagement />}/>
            <Route path='/admin/companies/detail/:id' element={<CompanyDetailAdmin />}/>
            
            {/* Test Routes - Chỉ dùng để test component */}
            {/* <Route path='/test-match-details' element={<TestMatchDetails />}/> */} {/* Đã xóa file */}
              
          </Route>
          
      </Routes>
      
      {/* Chatbot - hiển thị trên tất cả các trang */}
      <Chatbot />
      
      {/* AI Guide Modal - hiển thị lần đầu */}
      <AIGuideModal />
    </div>
  );
}

export default App;
