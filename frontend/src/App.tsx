import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import States from './components/leaderboard/States'
import UserTag from './components/leaderboard/UserTag'
import LeaderBoard from './components/leaderboard/LeaderBoard'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import SignOut from './pages/SignOut'
import AuthCallback from './pages/AuthCallback'
import Profile from './pages/Profile'
import TermsOfService from './pages/TemsOfService'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <States />
              <div className="hidden md:block"><UserTag /></div>
              <LeaderBoard />
            </>
          } />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signout" element={<SignOut />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
