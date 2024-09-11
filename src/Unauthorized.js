import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleRedirectToDashboard = () => {
    // Set loggedIn to true in sessionStorage
    sessionStorage.setItem('loggedIn', true);
    // Navigate the user to the dashboard
    navigate('/dashboard');
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: '50px', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Unauthorized Access
      </Typography>
      <Typography variant="body1" paragraph>
        You are not authorized to access this page.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleRedirectToDashboard}
      >
        Go to Dashboard
      </Button>
    </Container>
  );
};

export default UnauthorizedPage;
