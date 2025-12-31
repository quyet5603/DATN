
import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './Pages/Employer/Home';
import { Navbar } from './components/Navbar';
import { PostJob } from './Pages/Employer/PostJob';
import { AllJobs } from './Pages/Employer/AllJobs';
import { Login } from './components/Login/Login';
import { Register } from './components/Login/Register';
import { ForgotPassword } from './components/Login/ForgotPassword';
import { ResetPassword } from './components/Login/ResetPassword';
import { ChangePassword } from './components/Login/ChangePassword';
import { VerifyEmail } from './components/Login/VerifyEmail';
import { JobDetails } from './components/Home/JobDetails';
import { ShortlistedCandidates } from './components/ShortlistedCandidates';
import { ShortlistedDetails } from './components/ShortlistedDetails';
import { ApplicationForm } from './Pages/Candidate/ApplicationForm';
import {AllPostedJobs} from './components/AllPostedJobs'
import { Dashboard } from './Pages/Dashboard';
import { useContext, useEffect } from 'react';
import { LoginContext } from './components/ContextProvider/Context';
import { UpdateJob } from './Pages/Employer/UpdateJob';
import { MyJobs } from './Pages/Candidate/MyJobs';
import { CVUpload } from './Pages/Candidate/CVUpload';
import { RecommendedJobs } from './Pages/Candidate/RecommendedJobs';
import { InterviewPractice } from './Pages/Candidate/InterviewPractice';
import { ImproveCV } from './Pages/Candidate/ImproveCV';
import { MatchedCandidates } from './Pages/Employer/MatchedCandidates';
import { AnalyticsDashboard } from './Pages/Employer/AnalyticsDashboard';
import { Profile } from './Pages/Candidate/Profile';

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
            <Route path='/employer/dashboard' element={<AnalyticsDashboard />}/>
            <Route path='/login' element={<Login />}/>
            <Route path='/signup' element={<Register />}/>
            <Route path='/forgot-password' element={<ForgotPassword />}/>
            <Route path='/reset-password' element={<ResetPassword />}/>
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
            
            {/* AI Features Routes */}
            <Route path='/cv-upload/:id' element={<CVUpload />}/>
            <Route path='/improve-cv/:id' element={<ImproveCV />}/>
            <Route path='/recommended-jobs' element={<RecommendedJobs />}/>
            <Route path='/interview-practice/:id' element={<InterviewPractice />}/>
            <Route path='/matched-candidates/:id' element={<MatchedCandidates />}/>
            <Route path='/profile' element={<Profile />}/>
              
          </Route>
          
      </Routes>
    </div>
  );
}

export default App;
