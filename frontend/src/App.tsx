import 'bootstrap/dist/css/bootstrap.min.css';

import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AppNavBar from './components/appNavBar.component';
import BidItemsList from './components/bidItemsList.component';
import ItemsList from './components/itemsList.component';
import Profile from './components/profile.component';
import Signin from './components/signin.component';
import Signup from './components/signup.component';
import UserService from './services/user.service';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const currentUser = UserService.getCurrentUser();
    setIsLoggedIn(currentUser !== null);
    if (currentUser) {
      setUserEmail(currentUser.email || '');
    }
  }, []);

  return (
    <div>
      <AppNavBar isLoggedIn={isLoggedIn} userEmail={userEmail} />
      <Routes>
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/profile" /> : <Signup />}
        />
        <Route
          path="/signin"
          element={isLoggedIn ? <Navigate to="/profile" /> : <Signin />}
        />
        <Route
          path="/signout"
          element={<Navigate to="/signin" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/signin" />}
        />
        <Route
          path="/items"
          element={isLoggedIn ? <ItemsList /> : <Navigate to="/signin" />}
        />
        <Route
          path="/bidItems"
          element={isLoggedIn ? <BidItemsList /> : <Navigate to="/signin" />}
        />
      </Routes>
    </div>
  );
}

export default App;