import React, { useEffect, useState } from 'react';
import userpool from '../../userpool';

const DriverView = ({ onDriverView }) => { // Corrected prop name
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sponsorCompany, setSponsorCompany] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
		const fetchData = async () => {
			try {
                // GETS CURRENT SPONSORUSER 
                const USER_ID = sessionStorage.getItem('USER_ID');
                let sponsorData = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${USER_ID}`); 
				sponsorData = await sponsorData.json();
                console.log(sponsorData);
				
				// get drivers associated with the current sponsor
				const driversResult = await fetch(`https://team27-express.cpsc4911.com/drivers?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
				const driversJsonResult = await driversResult.json();
                console.log(driversResult);
				setDrivers(driversJsonResult);
                
                // All data has been loaded
                setLoading(false);
			} catch (error) {
				console.error("Error fetching data:", error);
				setError("Error fetching data. Please try again later.");
                setLoading(false);
			}
	  	};
	
		fetchData();
	}, []);

    return (
        <div className='infoContainer'>
          <h2>Driver View</h2>
          <div>
            <h3>Drivers</h3>
            <table>
                <thead>
                    <tr>
                        <th>Driver ID</th>
                        <th>Driver Name</th>
                        <th>Driver Email</th>
                        <th>Points</th>
                        <th>Change View</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((driver) => (
                        <tr key={driver.USER_ID}>
                            <td>{driver.USER_ID}</td>
                            <td>{driver.FNAME} {driver.LNAME}</td>
                            <td>{driver.EMAIL}</td>
                            <td>{driver.POINTS}</td>
                            <td>
								<button onClick={() => onDriverView(driver.USER_ID)}>Change View</button> {/* Corrected prop name */}
							</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
    )
}
    
export default DriverView;