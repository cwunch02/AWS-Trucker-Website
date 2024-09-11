import React, { useEffect, useState } from 'react';
import {Box, Container, Typography, Button, Grid} from "@mui/material"

function About() {
  const [aboutInfo, setAboutInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch("https://team27-express.cpsc4911.com/about");
        const jsonResult = await result.json();
        setAboutInfo(jsonResult);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  // Format the release date if aboutInfo is available
  const formattedDate = aboutInfo ? new Date(aboutInfo.RELEASE_DATE).toISOString().split('T')[0] : null;

  return (
      <Container  sx={{ boxShadow: 3 , height: 600, p: 5, alignContent: 'center'}}>
        <Grid container
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center">
        <div className='infoContainer'>
      <Typography variant="h4" align="center" sx={{ textDecoration: "underline"}}>About</Typography>
      {error ? (
        <p>{error}</p>
      ) : aboutInfo ? (
          <Box sx={{paddingTop: 5}}>
            <Typography variant="h6">Team Number: {aboutInfo.TEAM_NUM}</Typography>
            <Typography variant="h6">Version Number: {aboutInfo.VERSION_NUM}</Typography>
            <Typography variant="h6">Release Date: {formattedDate}</Typography>
            <Typography variant="h6">Product Name: {aboutInfo.PROD_NAME}</Typography>
            <Typography variant="h6">Product Description: {aboutInfo.PROD_DESCRIPTION}</Typography>
          </Box>
      ) : (
        <p>Loading...</p>
      )}
    </div>
          </Grid>
      </Container>
  );
}

export default About;
