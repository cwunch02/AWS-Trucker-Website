import React, { useEffect, useState } from 'react';

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
    <div className='infoContainer'>
      <h2>About</h2>
      {error ? (
        <p>{error}</p>
      ) : aboutInfo ? (
        <div>
          <h4>Team Number: {aboutInfo.TEAM_NUM}</h4>
          <h4>Version Number: {aboutInfo.VERSION_NUM}</h4>
          <h4>Release Date: {formattedDate}</h4>
          <h4>Product Name: {aboutInfo.PROD_NAME}</h4>
          <h4>Product Description: {aboutInfo.PROD_DESCRIPTION}</h4>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default About;
