import React, {useState, useEffect} from "react";
import { Box, Button, Container, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export default function Driver_App_Status()
{
    const [USER_ID, setUSER_ID] = useState(null);
    const [applications, setApplications] = useState([]);
    const [sponsors, setSponsors] = useState([]);

    function getSponsorNameById(sponsorId) {
        const sponsor = sponsors.find(sponsor => sponsor.SPONSOR_ID === sponsorId);
        return sponsor ? sponsor.SPONSOR_NAME : "Unknown Sponsor";
    }

    const fetchSponsors = async () => {
        if(USER_ID === null)
        return;
        fetch(`https://team27-express.cpsc4911.com/sponsors`)
        .then(response => response.json())
          .then(data => {
            setSponsors(data);
          })
          .catch(error => {
            console.error('Error fetching sponsors:', error);
          });
    }
    const fetchApplications = async () =>
    {
        if(USER_ID === null)
        return;
        try{
            // Getting applications
            const isDriverView = sessionStorage.getItem("DriverView");
            let request = '';
            if(isDriverView){
                const SPONSOR_USER_ID = sessionStorage.getItem("viewDriverUserID");
                const sponsorResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${SPONSOR_USER_ID}`);
                const sponsorData = await sponsorResponse.json();
                request = `https://team27-express.cpsc4911.com/applications?USER_ID=${USER_ID}&SPONSOR_ID=${sponsorData.SPONSOR_ID}`
            }
            else{
                request = `https://team27-express.cpsc4911.com/applications?USER_ID=${USER_ID}`
            }
            const response = await fetch(request);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            // Turning data into json response
            const jsonResult = await response.json();
            setApplications(jsonResult);
        }
        catch (error) {
            console.log("Error retrieving applications:", error);
        }
    }

    useEffect(() => {
        setUSER_ID(sessionStorage.getItem("USER_ID"));
        fetchApplications();
        fetchSponsors();
    }, [USER_ID]);
    return(
        <Container>
        {applications.length > 0 ? (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sponsor Name</TableCell>
                            <TableCell>Question 1</TableCell>
                            <TableCell>Question 2</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Reason</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.USER_ID}>
                                <TableCell>{getSponsorNameById(application.SPONSOR_ID)}</TableCell>                                
                                <TableCell>{application.QUESTION_1}</TableCell>
                                <TableCell>{application.QUESTION_2}</TableCell>
                                <TableCell>{application.STATUS}</TableCell>
                                <TableCell>{application.REASON}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        ) : (
            <Typography variant="body1" gutterBottom>
                You currently have no applications.
            </Typography>
        )}
    </Container>
    )
}