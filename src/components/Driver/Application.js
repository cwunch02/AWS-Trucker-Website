import React, { useState, useEffect } from 'react';
import userpool from '../../userpool';
import { Snackbar, Box, Container, Typography, Button, Grid } from "@mui/material"
import { useNavigate } from 'react-router-dom';

function ApplicationPage() {
    const [sponsorOptions, setSponsorOptions] = useState([]);
    const [selectedSponsor, setSelectedSponsor] = useState('');
    const [question1Answer, setQuestion1Answer] = useState('');
    const [question2Answer, setQuestion2Answer] = useState('');
    const [userId, setUserId] = useState(null);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSponsors = () => {
            fetch('https://team27-express.cpsc4911.com/sponsors')
                .then(response => response.json())
                .then(data => {
                    setSponsorOptions(data);
                })
                .catch(error => {
                    console.error('Error fetching sponsors:', error);
                });
        }

        const fetchUserData = async () => {
                setUserId(sessionStorage.getItem("USER_ID"));
        };

        fetchSponsors();
        fetchUserData();
    }, []);

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
        navigate("/d_applications");
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const existingApplicationsResponse = await fetch(`https://team27-express.cpsc4911.com/applications?USER_ID=${userId}&SPONSOR_ID=${selectedSponsor}`);
            const existingApplications = await existingApplicationsResponse.json();
    
            if (existingApplications.length > 0) {
                throw new Error('You already have an existing application with this sponsor.');
            }
            const existingDriverSponsorshipResponse = await fetch(`https://team27-express.cpsc4911.com/drivers?USER_ID=${userId}&SPONSOR_ID=${selectedSponsor}`);
            const existingDriverSponsorship = await existingDriverSponsorshipResponse.json();

            if (existingDriverSponsorship.length > 0) {
                throw new Error('You already belong to this sponsor as a driver.');
            }

            const formData = {
                userId: userId,
                sponsorId: selectedSponsor,
                question1: question1Answer,
                question2: question2Answer
            };
    
            const response = await fetch('https://team27-express.cpsc4911.com/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (!response.ok) {
                throw new Error('Failed to submit application');
            }
    
            setIsSnackbarOpen(true);
        } catch (error) {
            setErrorMessage(error.message); // Set error message to be displayed to the user
            console.error('Error submitting application:', error);
        }
    };

    return (
        <Container sx={{ boxShadow: 3, height: 600, p: 5, alignContent: 'center' }}>
            <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
                <div>
                    <Typography variant="h4" align="center" sx={{ textDecoration: "underline", paddingBottom: 5 }}>Application</Typography>
                    {errorMessage && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</div>} {/* Display error message */}
                    <form onSubmit={handleFormSubmit}>
                        <div>
                            <label htmlFor="sponsor">Select Sponsor:</label>
                            <select id="sponsor" value={selectedSponsor} onChange={(e) => setSelectedSponsor(e.target.value)}>
                                <option value="">Select a Sponsor</option>
                                {sponsorOptions.map(sponsor => (
                                    <option key={sponsor.SPONSOR_ID} value={sponsor.SPONSOR_ID}>{sponsor.SPONSOR_NAME}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="question1">Question 1: Why did you pick this sponsor?</label>
                            <br />
                            <textarea id="question1" rows={4} cols={50} value={question1Answer} onChange={(e) => setQuestion1Answer(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="question2">Question 2: What traits qualify you as a driver for this sponsor?</label>
                            <br />
                            <textarea id="question2" rows={4} cols={50} value={question2Answer} onChange={(e) => setQuestion2Answer(e.target.value)} />
                        </div>
                        <button type="submit">Submit Application</button>
                    </form>
                </div>
            </Grid>
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={isSnackbarOpen}
                onClose={handleSnackbarClose}
                message="Application Successfully Submitted"
                action={
                    <Button color="inherit" size="small" onClick={handleSnackbarClose}>
                        Close
                    </Button>
                }
            />
        </Container>
    );
}

export default ApplicationPage;