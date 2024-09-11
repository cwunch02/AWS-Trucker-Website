import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes, Link, redirect, Navigate, useNavigate} from 'react-router-dom';
import About from './About';
import '@aws-amplify/ui-react/styles.css'
import userpool from "./userpool";
import Home from "./components/Home"
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Driver_Application from './components/Driver/Driver_Application';
import Driver_Catalog from './components/Driver/Driver_Catalog'
import Sponsor_Catalog from "./components/Sponsor/Sponsor_Catalog";
import Driver_App_Status from './components/Driver/Driver_App_Status';
import ApplicationPage from './components/Driver/Application';
import Sponsor_Applications from "./components/Sponsor/Sponsor_Applications";
import SponsorPromotion from './components/Sponsor/Sponsor_Promotion';
import UserInfo from './components/Admin/Admin_UserInfo';
import ReportLogs from './components/Admin/Admin_Reportlogs';
import {AppBar, Toolbar, Box, Container, Button, IconButton, Menu, MenuItem, Stack, Badge, useStepContext, Typography} from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu'
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ForgotPassword from "./components/ForgotPassword";
import DriverDrawer from './components/Driver/driverDrawer';
import SponsorDrawer from './components/Sponsor/sponsorDrawer';
import SponsorAdminDrawer from './components/Sponsor/sponsorAdminDrawer';
import UnauthorizedPage from './Unauthorized';
import NotificationsIcon from '@mui/icons-material/Notifications'; // Import the notifications icon
import AdminDrawer from './components/Admin/adminDrawer';
import SponsorView from './components/Admin/Admin_SponsorView';
import DriverView from './components/Sponsor/Sponsor_DriverView';
import SponsorLogs from './components/Sponsor/Sponsor_Logs';
import SponsorPointTrack from './components/Sponsor/Sponsor_PointTrack';
import AdminSalesInvoice from './components/Admin/Admin_SalesInvoice';
import { logout } from './services/authenticate';
import Profile from "./account/profile";
import {Amplify} from 'aws-amplify'
import NotificationMenu from './Notification';
import AdminCreateAccount from './components/Admin/Admin_CreateAccounts';
import SponsorCompanyAndAccountCreation from './components/Admin/Admin_Create_Company';
import Driver_Orders from "./components/Driver/Driver_Orders";
import Sponsor_Orders from "./components/Sponsor/Sponsor_Orders";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolClientId: '2u7gvha4ktphglt18bmf75d4i5',
            userPoolId: 'us-east-1_rcpOZpAOx',
            username: true,
        }
    }
});

function App() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userType, setUserType] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [authenticated, setAuthenticated] = useState(null);
    const [notificationOpen, setNotificationOpen] = useState(false); // State for managing notification dropdown
    const [notificationCount, setNotificationCount] = useState(null);
    const [SERVERPORT, setServerPort] = useState(null);
    const [USER_ID, setUSERID] = useState(null);
    const [isDriverView, setDriverView] = useState(false);
    const [isSponsorView, setSponsorView] = useState(null);
    const open = Boolean(anchorEl);
    // Gets user type and status on page refresh
    useEffect(()=>{
        const loggedInStatus = sessionStorage.getItem('loggedIn');
        const userType = sessionStorage.getItem('userType');
        
        if (loggedInStatus === 'true') {
            setLoggedIn(true);
        }
        if (userType){
            setUserType(userType);
        }
    });

    // Loads view status on page refresh
    useEffect(()=>{
        const driverViewStatus = sessionStorage.getItem('DriverView');
        const sponsorViewStatus = sessionStorage.getItem('SponsorView');
        if(sponsorViewStatus === "true"){
            setSponsorView(true);
            console.log('isSponsorView');
        }
        if(driverViewStatus === "true"){
            setDriverView(true);
            console.log('isSponsorView');
        }
    });

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = async () =>
    {
        setUserType(null);
        setLoggedIn(false);
        setUSERID(null);
        sessionStorage.clear();
        logout();
    }
    
    function RequireAuth({ children, redirectTo }) {

        useEffect(() => {
            const checkAuthentication = async () => {
                try {
                    const user = userpool.getCurrentUser();
                    setAuthenticated(!!user); // Assuming user is truthy when authenticated
                    setLoggedIn(!!user);
                } catch (error) {
                    console.error('Error checking authentication:', error);
                    setAuthenticated(false);
                }
            };
    
            checkAuthentication();
        }, []); // Empty dependency array ensures this effect runs once on component mount
    
        return authenticated === null ? <div>Loading...</div> : authenticated ? children : <Navigate to={redirectTo} />;  
    }
    
    const handleLogin = async (userData) => {
        try {
            const response = await fetch(`https://team27-express.cpsc4911.com/users?USERNAME=${userData}`);
    
            // Check for successful response status (200-299 range)
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
    
            const jsonResult = await response.json();
    
            // Validate the response data
            console.log(jsonResult);
            if (!jsonResult || !jsonResult.USER_TYPE) {
                throw new Error("Invalid response data received from the API.");
            }
    
            setUserType(jsonResult.USER_TYPE); // Setting USER_TYPE
            sessionStorage.setItem('userType', jsonResult.USER_TYPE);
    
            setLoggedIn(true);
            sessionStorage.setItem('loggedIn',true);
            sessionStorage.setItem("USER_ID", jsonResult.USER_ID);
            setUSERID(jsonResult.USER_ID);
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    const handleDriverView = (DriverID) => {
        sessionStorage.setItem('viewDriverUserID', USER_ID);
        sessionStorage.setItem('viewDriverUserType', userType);
        sessionStorage.setItem('USER_ID', DriverID);
        sessionStorage.setItem('userType', 'D');
        sessionStorage.setItem('DriverView',true);
        setUSERID(DriverID);
        setDriverView(true);
        setUserType('D');
        return;
    };

    const handleSponsorView = (SponsorID, USER_TYPE) => {
        sessionStorage.setItem('viewSponsorUserID', USER_ID);
        sessionStorage.setItem('viewSponsorUserType', userType);
        sessionStorage.setItem('USER_ID', SponsorID);
        sessionStorage.setItem('userType', USER_TYPE);
        sessionStorage.setItem('SponsorView',true);
        setUSERID(SponsorID);
        setSponsorView(true);
        setUserType(USER_TYPE);
        return;
    }

    const accountClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const accountClose = () => {
        setAnchorEl(null);
    }
    
        const renderDrawer = () => {
        switch (userType) {
            case 'A':
                return <AdminDrawer open={drawerOpen} onClose={toggleDrawer} />;
            case 'D':
                return <DriverDrawer open={drawerOpen} onClose={toggleDrawer} />;
            case 'S':
                return <SponsorDrawer open={drawerOpen} onClose={toggleDrawer} />;
            case 'T':
                return <SponsorAdminDrawer open={drawerOpen} onClose={toggleDrawer} />;
            default:
                console.log("No user type error");
                console.log(userType);
                return null;
        }
    };

    const handleNotificationOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setNotificationOpen(!notificationOpen);
        setNotificationAnchorEl(event.currentTarget); // Update notificationAnchorEl
    };

    const handleNotificationClose = (event: React.MouseEvent<HTMLButtonElement>) => {
        setNotificationOpen(!notificationOpen);
        setNotificationAnchorEl(null); // Reset notificationAnchorEl
    };

    // Handles the swapping between different views 
    const handleViewSwap = () => {
        // Have to swap from drivers view first, in case admin is in view
        if(isDriverView){     
            sessionStorage.setItem('USER_ID', sessionStorage.getItem('viewDriverUserID'));
            sessionStorage.setItem('userType', sessionStorage.getItem('viewDriverUserType'));
            sessionStorage.setItem('DriverView',false);
            setUserType(sessionStorage.getItem('viewDriverUserType'));
            setUSERID(sessionStorage.getItem('viewDriverUserID'));
            setDriverView(false);
            return;
        }
        
        if(isSponsorView){
            sessionStorage.setItem('USER_ID', sessionStorage.getItem('viewSponsorUserID'));
            sessionStorage.setItem('userType', sessionStorage.getItem('viewSponsorUserType'));
            sessionStorage.setItem('SponsorView',false);
            setUserType(sessionStorage.getItem('viewSponsorUserType'));
            setUSERID(sessionStorage.getItem('viewSponsorUserID'));
            setSponsorView(false);
            return;
        }
    };

    return (
        <Router>
            <AppBar position='static' style={{ background: '#80211b' }}>
                <Toolbar>
                    <Box display="flex" justifyContent="space-between" sx={{ width: 1 }}>
                        {loggedIn && 
                        (<IconButton size='large' edge='start' color='inherit' aria-label='logo' onClick={toggleDrawer}>
                            <MenuIcon/>
                        </IconButton>)}
                       {loggedIn && 
                       ( <IconButton href='/dashboard' size='large' edge='start' color='inherit' aria-label='logo' sx ={{marginRight: 'auto'}}>
                            <img alt="edit" width="70" height="25" src="/Hyperion.png"/>
                        </IconButton>)}
                        {/* Conditionally render additional button based on state */}
                        {(isDriverView || isSponsorView) && (
                            <IconButton
                                id='additional-button'
                                size='large'
                                edge='start'
                                color='inherit'
                                aria-label='additional'
                                onClick={handleViewSwap}
                            >
                            <div variant="body1">
                                Swap back to {isDriverView ? "Sponsor" : "Admin"}
                            </div>
                            </IconButton>
                        )}
                            {/* Account icon */}
                            {loggedIn && (<IconButton
                            id='account-button'
                            size='large'
                            edge='start'
                            color='inherit'
                            aria-label='logo'
                            onClick={accountClick}
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup='true'
                            aria-expanded={open ? 'true' : undefined}
                            >
                            <AccountCircleIcon />
                            </IconButton>)}
                            <Menu
                            id='account-menu'
                            anchorEl={anchorEl}
                            open={open}
                            MenuListProps={{
                                'aria-labelledby': 'account-button',
                            }}
                            onClose={accountClose}
                            >
                            <Stack>
                                {!loggedIn && (<Button onClick={accountClose} href='/login'>account</Button>)}
                                {loggedIn && (<Button varient ="text" href='/profile'> Account </Button>)}
                                {!loggedIn && (<Button onClick={accountClose} href='/login'>login</Button>)}
                                {loggedIn && (<Button varient ="text" onClick={handleLogout}> Logout </Button>)}
                            </Stack>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {renderDrawer()}

            {/* Routes need to be protected behind user being logged in */}
            {/* Should only be accessable by clicking on them in drawer */}
            {/* Create grant access function, that works only if the user is a certain type */}
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login onLogin={(userData) => handleLogin(userData)}/>}/>
                <Route path="/about"     element={<About />} />
                <Route path="/forgot-password" element={<ForgotPassword/>}/>
                <Route path="/profile"     element={
                    <RequireAuth redirectTo="/login">
                        <Profile />
                    </RequireAuth>
                } />
                <Route path="/d_applications/"     element={
                    <RequireAuth redirectTo="/login">
                        {userType === 'D' ? (
                            <Driver_Application />
                        ) :(
                            isSponsorView ? <Navigate to= '/dashboard'/> : <UnauthorizedPage/>
                        )}
                    </RequireAuth>
                } />
                <Route path="/d_catalog/"     element={
                    <RequireAuth redirectTo="/login">
                        {userType === 'D' ? (
                            <Driver_Catalog />
                        ) :(
                            isSponsorView ? <Navigate to= '/dashboard'/> : <UnauthorizedPage/>
                        )}
                    </RequireAuth>
                } />
                <Route path = "/d_applications/apply" element = 
                {<RequireAuth redirectTo="/login">
                    {userType === 'D' ? (
                            <ApplicationPage/>
                        ) :(
                            isSponsorView ? <Navigate to= '/dashboard'/> : <UnauthorizedPage/>
                    )}
                    </RequireAuth>
                } />
                <Route path = "/d_applications/status" element = 
                {<RequireAuth redirectTo="/login">
                    {userType === 'D' ? (
                            <Driver_App_Status/>
                        ) :(
                            isSponsorView ? <Navigate to= '/dashboard'/> : <UnauthorizedPage/>
                    )}
                    </RequireAuth>
                } />
                <Route path = "/d_orders" element =
                    {<RequireAuth redirectTo="/login">
                        {userType === 'D' ? (
                            <Driver_Orders/>
                        ) :(
                            isSponsorView ? <Navigate to= '/dashboard'/> : <UnauthorizedPage/>
                        )}
                    </RequireAuth>
                    } />
                <Route path="/signup" element={<Signup />}/>
                <Route path="/dashboard"     element={
                    <RequireAuth redirectTo="/login">
                        <Dashboard />
                    </RequireAuth>
                } />
                <Route path="/s_applications"     element={
                    <RequireAuth redirectTo="/login">
                        {['S', 'T'].includes(userType)? (
                            <Sponsor_Applications />
                        ) :(
                            userType === 'A' ? <Navigate to = '/dashboard'/> : <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />

                <Route path="/s_catalog/"     element={
                    <RequireAuth redirectTo="/login">
                        {['S', 'T'].includes(userType)? (
                            <Sponsor_Catalog />
                        ) :(
                            userType === 'A' ? <Navigate to = '/dashboard'/> : <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />
                <Route path="/s_orders/"     element={
                    <RequireAuth redirectTo="/login">
                        {['S', 'T'].includes(userType)? (
                            <Sponsor_Orders/>
                        ) :(
                            userType === 'A' ? <Navigate to = '/dashboard'/> : <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />
                <Route path="/promote_sponsors"     element={
                    <RequireAuth redirectTo="/login">
                        {['S', 'T'].includes(userType) ? (
                            <SponsorPromotion />
                        ) :(
                            userType === 'A' ? <Navigate to = '/dashboard'/> : <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />
                <Route path="/user_info"     element={
                    <RequireAuth redirectTo="/login">
                        {userType === 'A' ? (
                            <UserInfo />
                        ) :(
                            <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />
                <Route path="/admin_create_account"     element={

                    <RequireAuth redirectTo="/login">
                        {userType === 'A' ? (
                            <AdminCreateAccount />
                        ) :(
                            <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />
                <Route path="/admin_create_company"     element={

                <RequireAuth redirectTo="/login">
                    {userType === 'A' ? (
                        <SponsorCompanyAndAccountCreation />
                    ) :(
                        <UnauthorizedPage />
                    )}
                </RequireAuth>
                } />
                <Route path="/reports"     element={
                    <RequireAuth redirectTo="/login">
                        {userType === 'A' ? (
                            <ReportLogs />
                        ) :(
                            <UnauthorizedPage />
                        )}
                    </RequireAuth>
                    } />
                <Route path="/sponsor_view"     element={
                    <RequireAuth redirectTo="/login">
                        {userType === 'A' ? (
                            <SponsorView onSponsorView={(SponsorID, USER_TYPE) => handleSponsorView(SponsorID, USER_TYPE)}/>
                        ) :(
                            isSponsorView? <Navigate to= '/dashboard'/> : <UnauthorizedPage/>
                        )}
                    </RequireAuth>
                } />
                <Route path="/driver_view" element={
                    <RequireAuth redirectTo="/login">
                        {['S', 'T'].includes(userType) ? (
                            <DriverView onDriverView={(DriverID) => handleDriverView(DriverID)} />
                        ) : (
                            isDriverView ? <Navigate to= '/dashboard'/> : <UnauthorizedPage/>
                        )}
                    </RequireAuth>
                } />
                <Route path="/s_logs"     element={
                    <RequireAuth redirectTo="/login">
                        {['S', 'T'].includes(userType)? (
                            <SponsorLogs/>
                        ) :(
                            userType === 'A' ? <Navigate to = '/dashboard'/> : <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />
                <Route path="/s_pointtrack"     element={
                    <RequireAuth redirectTo="/login">
                        {['S', 'T'].includes(userType)? (
                            <SponsorPointTrack/>
                        ) :(
                            userType === 'A' ? <Navigate to = '/dashboard'/> : <UnauthorizedPage />
                        )}
                    </RequireAuth>
                } />
                <Route path="/admin_salesinvoice"     element={
                    <RequireAuth redirectTo="/login">
                        {userType === 'A' ? (
                            <AdminSalesInvoice />
                        ) :(
                            <UnauthorizedPage />
                        )}
                    </RequireAuth>
                    } />
            </Routes>
        </Router>
    );
}

export default App;