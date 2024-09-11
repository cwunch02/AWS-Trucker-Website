import React, {useState, useEffect} from "react";
import {BrowserRouter as Router, Route, Routes, Link, Navigate} from 'react-router-dom';
import { Box, Button, Container, Grid, Typography, Table, TableCell, TableRow, TableHead, TableContainer, TableBody } from '@mui/material';
import userpool from "../../userpool";
export default function Driver_Application()
{
    const [userID, setUserId] = useState(null); // assuming user ID is initially null
    const [FNAME, setFNAME] = useState(null);
    const [currentSponsors, setCurrentSponsors] = useState(null);
    const [sponsorCompanies, setSponsorCompanies] = useState(null);
    const [pointChanges, setPointChanges] = useState(null);
    const [sortedChanges, setSortedChanges] = useState(null);
    useEffect(() => {
        const fetchSponsorCompanies = async () => {
            fetch(`https://team27-express.cpsc4911.com/sponsors`)
            .then(response => response.json())
              .then(data => {
                setSponsorCompanies(data);
              })
              .catch(error => {
                console.error('Error fetching sponsors:', error);
              });
        }
        // Gets Current Sponsors
        const fetchSponsors = async () => {
            const isDriverView = sessionStorage.getItem("DriverView");
            let request = '';
            if(isDriverView){
                const SPONSOR_USER_ID = sessionStorage.getItem("viewDriverUserID");
                const sponsorResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${SPONSOR_USER_ID}`);
                const sponsorData = await sponsorResponse.json();
                request = `https://team27-express.cpsc4911.com/drivers?USER_ID=${userID}&SPONSOR_ID=${sponsorData.SPONSOR_ID}`
            }
            else{
                request = `https://team27-express.cpsc4911.com/drivers?USER_ID=${userID}`
            }
            if(userID === null) return;
            await fetch(request)
            .then(response => response.json())
              .then(data => {
                setCurrentSponsors(data);
              })
              .catch(error => {
                console.error('Error fetching sponsors:', error);
              });
            }
    
        // Gets user data
        const fetchUserData = async () => {
            try {
                // Get user data
                const userdata = userpool.getCurrentUser();
                const response = await fetch(`https://team27-express.cpsc4911.com/users?USERNAME=${userdata.username}`);

                // Check for successful response status (200-299 range)
                if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
                }

                const jsonResult = await response.json();

                // Validate the response data
                console.log(jsonResult);
                if (!jsonResult || !jsonResult.USER_ID) {
                throw new Error("Invalid response data received from the API.");
                }

                // Set user ID
                setUserId(sessionStorage.getItem("USER_ID"));
                console.log(userID);
                setFNAME(jsonResult.FNAME);
            } catch (error) {
                console.log("Error retrieving user id:", error);
            }
            };

            // Fetch sponsors and user data on component mount
            fetchUserData();
            fetchSponsors();
            fetchSponsorCompanies();
        // Gets point data
        const fetchPointChanges = async () =>{
            let request = '';
            const isDriverView = sessionStorage.getItem("DriverView");
            if(isDriverView){
                const SPONSOR_USER_ID = sessionStorage.getItem("viewDriverUserID");
                const sponsorResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${SPONSOR_USER_ID}`);
                const sponsorData = await sponsorResponse.json();
                request = `https://team27-express.cpsc4911.com/point_change?USER_ID=${userID}&SPONSOR_ID=${sponsorData.SPONSOR_ID}`
            }
            else{
                request = `https://team27-express.cpsc4911.com/point_change?USER_ID=${userID}`
            }
            fetch(request)
            .then(response => response.json())
              .then(data => {
                setPointChanges(data);
              })
              .catch(error => {
                console.error('Error fetching sponsors:', error);
              });
            }
            fetchPointChanges();
    }, [userID]);

    useEffect(()=>{
        if(pointChanges){
            const sortedChanges = pointChanges.sort((a, b) => new Date(b.AUDIT_DATE) - new Date(a.AUDIT_DATE)).slice(0, 5);
            setSortedChanges(sortedChanges);
        }
    },[pointChanges])

    function getSponsorNameById(sponsorId) {
        const sponsor = sponsorCompanies.find(sponsor => sponsor.SPONSOR_ID === sponsorId);
        return sponsor ? sponsor.SPONSOR_NAME : "Unknown Sponsor";
    }

    if(currentSponsors === null)
    {
        return <div> Loading.... </div>
    }
    return(
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Your Sponsorship Partners
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/d_applications/apply"
                        sx={{ marginRight: 2 }}
                    >
                        Apply for Sponsors
                    </Button>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/d_applications/status"
                    >
                        View Application Status
                    </Button>
                </Box>
            </Box>

            {/* Table for current sponsor companies */}
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Current Sponsor Companies
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Sponsor Name</TableCell>
                                <TableCell>Points</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentSponsors.length > 0 ? (
                                currentSponsors.map((sponsor, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{sponsor.SPONSOR_NAME}</TableCell>
                                        <TableCell>{sponsor.POINTS}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2}>You currently have no sponsors.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Table for recent point changes */}
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Point Changes
                </Typography>
                <TableContainer style={{ maxHeight: 200, overflowY: 'auto' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Sponsor</TableCell>
                                <TableCell>Points</TableCell>
                                <TableCell>Reason</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedChanges.length > 0 ? (
                                sortedChanges.map((change, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{getSponsorNameById(change.AUDIT_SPONSOR)}</TableCell>
                                        <TableCell>{change.AUDIT_POINTS}</TableCell>
                                        <TableCell>{change.AUDIT_REASON}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3}>No recent point changes.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    )
}