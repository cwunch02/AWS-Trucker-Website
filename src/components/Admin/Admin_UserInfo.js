import React, { useEffect, useState } from 'react';
import { Typography, Tabs, Tab, Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import userpool from '../../userpool';

function UserInfo() {
    const [sponsors, setSponsors] = useState([]);
    const [sponsorUsers, setSponsorUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [applications, setApplications] = useState([]);
    const [currentTab, setCurrentTab] = useState('sponsor companies');
    const [error, setError] = useState(null);
    const [sponsorNameMap, setSponsorNameMap] = useState({});
    const [userNameMap, setUserNameMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data for sponsor companies
                const sponsorResult = await fetch(`https://team27-express.cpsc4911.com/sponsors`);
                const sponsorJsonResult = await sponsorResult.json();
                const sponsorNameMap = {};
                sponsorJsonResult.forEach(sponsor => {
                    sponsorNameMap[sponsor.SPONSOR_ID] = sponsor.SPONSOR_NAME;
                });
                setSponsors(sponsorJsonResult);
                setSponsorNameMap(sponsorNameMap);

                // Fetch data for sponsor users
                const sponsorUsersResult = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts`);
                const sponsorUsersJsonResult = await sponsorUsersResult.json();
                const updatedSponsorUsers = sponsorUsersJsonResult.map(sponsorUser => ({
                    ...sponsorUser,
                    SPONSOR_NAME: sponsorNameMap[sponsorUser.SPONSOR_ID]
                }));
                setSponsorUsers(updatedSponsorUsers);

                // Fetch data for drivers
                const driversResult = await fetch(`https://team27-express.cpsc4911.com/drivers`);
                const driversJsonResult = await driversResult.json();
                setDrivers(driversJsonResult);

                // Fetch data for admins
                const adminsResult = await fetch(`https://team27-express.cpsc4911.com/admins`);
                const adminsJsonResult = await adminsResult.json();
                setAdmins(adminsJsonResult);

                // Fetch data for applications
                const applicationsResult = await fetch(`https://team27-express.cpsc4911.com/applications`);
                const applicationsJsonResult = await applicationsResult.json();
                setApplications(applicationsJsonResult);

                // Fetch data for users
                const usersResult = await fetch(`https://team27-express.cpsc4911.com/users`);
                const usersJsonResult = await usersResult.json();
                const userNameMap = {};
                usersJsonResult.forEach(user => {
                    userNameMap[user.USER_ID] = user.FNAME + " " + user.LNAME;
                });
                setUserNameMap(userNameMap);

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data. Please try again later.");
            }
        };
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <div className='infoContainer'>
            <Typography variant="h3">User Info</Typography>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="User Info Tabs">
                <Tab label="Sponsor Companies" value="sponsor companies" />
                <Tab label="Drivers" value="drivers" />
                <Tab label="Sponsors" value="sponsors" />
                <Tab label="Admins" value="admins" />
                <Tab label="Applications" value="applications" />
            </Tabs>
            <div className="tabContent">
                {currentTab === 'sponsor companies' && (
                    <div>
                        <Typography variant="h4">Sponsor Companies</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sponsor ID</TableCell>
                                        <TableCell>Sponsor Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sponsors.map((sponsor) => (
                                        <TableRow key={sponsor.SPONSOR_ID}>
                                            <TableCell>{sponsor.SPONSOR_ID}</TableCell>
                                            <TableCell>{sponsor.SPONSOR_NAME}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
                {currentTab === 'sponsors' && (
                    <div>
                        <Typography variant="h4">Sponsors</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User ID</TableCell>
                                        <TableCell>Sponsor Name</TableCell>
                                        <TableCell>Sponsor Email</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sponsorUsers.map((sponsorUser) => (
                                        <TableRow key={sponsorUser.USER_ID}>
                                            <TableCell>{sponsorUser.USER_ID}</TableCell>
                                            <TableCell>{sponsorNameMap[sponsorUser.SPONSOR_ID]}</TableCell>
                                            <TableCell>{sponsorUser.EMAIL}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
                {currentTab === 'drivers' && (
                    <div>
                        <Typography variant="h4">Drivers</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Driver ID</TableCell>
                                        <TableCell>Driver Name</TableCell>
                                        <TableCell>Driver Email</TableCell>
                                        <TableCell>Sponsor ID</TableCell>
                                        <TableCell>Sponsor Name</TableCell>
                                        <TableCell>Points</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {drivers.map((driver) => (
                                        <TableRow key={driver.USER_ID}>
                                            <TableCell>{driver.USER_ID}</TableCell>
                                            <TableCell>{driver.FNAME} {driver.LNAME}</TableCell>
                                            <TableCell>{driver.EMAIL}</TableCell>
                                            <TableCell>{driver.SPONSOR_ID}</TableCell>
                                            <TableCell>{sponsorNameMap[driver.SPONSOR_ID]}</TableCell>
                                            <TableCell>{driver.POINTS}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
                {currentTab === 'admins' && (
                    <div>
                        <Typography variant="h4">Admins</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Admin ID</TableCell>
                                        <TableCell>Admin Name</TableCell>
                                        <TableCell>Admin Email</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Array.isArray(admins) ? (
                                        admins.map((admin) => (
                                            <TableRow key={admin.USER_ID}>
                                                <TableCell>{admin.USER_ID}</TableCell>
                                                <TableCell>{admin.FNAME} {admin.LNAME}</TableCell>
                                                <TableCell>{admin.EMAIL}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow key={admins.USER_ID}>
                                            <TableCell>{admins.USER_ID}</TableCell>
                                            <TableCell>{admins.FNAME} {admins.LNAME}</TableCell>
                                            <TableCell>{admins.EMAIL}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
                {currentTab === 'applications' && (
                    <div>
                        <Typography variant="h4">Applications</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>User Name</TableCell>
                                        <TableCell>Sponsor Name</TableCell>
                                        <TableCell>Answer 1</TableCell>
                                        <TableCell>Answer 2</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {applications.map((application) => (
                                        <TableRow key={application.USER_ID}>
                                            <TableCell>{userNameMap[application.USER_ID]}</TableCell>
                                            <TableCell>{sponsorNameMap[application.SPONSOR_ID]}</TableCell>
                                            <TableCell>{application.QUESTION_1}</TableCell>
                                            <TableCell>{application.QUESTION_2}</TableCell>
                                            <TableCell>{application.STATUS}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserInfo;