import React, { useEffect, useState } from 'react';
import userpool from '../../userpool';
import './Sponsor_Applications.css'
import {Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

function Sponsor_Applications() {
	const [sponsors, setSponsors] = useState([]);
	const [drivers, setDrivers] = useState([]);
	const [applications, setApplications] = useState([]);
	const [currentTab, setCurrentTab] = useState('sponsors');
	const [pointsChange, setPointsChange] = useState('');
    const [pointsReason, setPointsReason] = useState('');
    const [selectedUpdatePointsDriver, setSelectedUpdatePointsDriver] = useState(null);
    const [selectedDeleteDriver, setSelectedDeleteDriver] = useState(null);
	const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedPointMultiplier, setSelectedPointMultiplier] = useState(null)
    const [selectedName, setSelectedName] = useState(null)
    const [pointMultiplierChange, setPointMultiplierChange] = useState('');
    const [nameChange, setNameChange] = useState('');
    const [statusChange, setStatusChange] = useState('');
    const [reasonChange, setReasonChange] = useState('');
    const [sponsorCompany, setSponsorCompany] = useState(null);
    const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
    const [USER_ID, setUSERID] = useState(null);
  
	useEffect(() => {
		const fetchData = async () => {
			try {
                // GETS CURRENT USER FROM USER TABLE
                const userIdFromStorage = sessionStorage.getItem('USER_ID');
                if(userIdFromStorage === undefined) return
                setUSERID(userIdFromStorage);
                // GETS CURRENT SPONSORUSER 
                let sponsorData = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${userIdFromStorage}`); 
				sponsorData = await sponsorData.json();
                console.log(sponsorData);
				
				// get sponsor users based on the current user's SPONSOR_ID
				const sponsorsResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
				const sponsorsData = await sponsorsResponse.json();
                console.log(sponsorsData);
				setSponsors(sponsorsData);
		
				// get drivers associated with the current sponsor
				const driversResult = await fetch(`https://team27-express.cpsc4911.com/drivers?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
				const driversJsonResult = await driversResult.json();
                console.log(driversResult);
				setDrivers(driversJsonResult);
		
				// get driver applications associated with the current sponsor
                const applicationsResult = await fetch(`https://team27-express.cpsc4911.com/applications?SPONSOR_ID=${sponsorData.SPONSOR_ID}&STATUS=Pending`);
                const applicationsJsonResult = await applicationsResult.json();
                setApplications(applicationsJsonResult);

                // GETS CURRENT SPONSOR COMPANY
                const sponsorCompanyResult = await fetch(`https://team27-express.cpsc4911.com/sponsors?SPONSOR_ID=${sponsorData.SPONSOR_ID}`);
                const sponsorCompanyJson = await sponsorCompanyResult.json();
                setSponsorCompany(sponsorCompanyJson);



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

    // Use effect that updates pointmultiplier change
    // Used to render the current point multiplier
    useEffect(()=>{
        if(selectedPointMultiplier === true){
            setPointMultiplierChange(sponsorCompany[0].POINT_MULTIPLIER)
        }
    },[selectedPointMultiplier])

	// function to handle updating points for a driver
    const updatePoints = async (operation) => {
        try {
            // Calculate the new points value based on the operation (add or subtract)
            const currentPoints = selectedUpdatePointsDriver.POINTS;
            let newPoints;
            if (operation === 'add') {
                newPoints = currentPoints + parseInt(pointsChange);
            } else if (operation === 'subtract') {
                newPoints = Math.max(currentPoints - parseInt(pointsChange), 0); // Ensure points don't go below 0
            }

            // Update the points in the database for the selected driver
            await fetch(`https://team27-express.cpsc4911.com/drivers/${selectedUpdatePointsDriver.USER_ID}/${selectedUpdatePointsDriver.SPONSOR_ID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    POINTS: newPoints,
                }),
            });

            if (operation === 'add'){
                await fetch('https://team27-express.cpsc4911.com/point_change/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        USER_ID: USER_ID,
                        SPONSOR_ID: selectedUpdatePointsDriver.SPONSOR_ID,
                        REASON: pointsReason,
                        POINT_TOTAL: parseInt(pointsChange),
                        DRIVER_ID: selectedUpdatePointsDriver.USER_ID
                    }),
                });
            }
            else {
                await fetch('https://team27-express.cpsc4911.com/point_change/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        USER_ID: USER_ID,
                        SPONSOR_ID: selectedUpdatePointsDriver.SPONSOR_ID,
                        REASON: pointsReason,
                        POINT_TOTAL: '-' + parseInt(pointsChange),
                        DRIVER_ID: selectedUpdatePointsDriver.USER_ID
                    }),
                });
            }
            

            // Update the local state with the new points value
            const updatedDrivers = drivers.map(driver => {
                if (driver.USER_ID === selectedUpdatePointsDriver.USER_ID && driver.SPONSOR_ID === selectedUpdatePointsDriver.SPONSOR_ID) {
                    return { ...driver, POINTS: newPoints };
                }
                return driver;
            });
            setDrivers(updatedDrivers);

            // Clear the selected driver and reset points change
            setPointsChange('');
            setSelectedUpdatePointsDriver(null);
        } catch (error) {
            console.error("Error updating points:", error);
            setError("Error updating points. Please try again later.");
        }
    };
  
	// Function to handle updating application status and creating a driver if approved
    const updateApplicationStatus = async () => {
        try {
            // Update the application status and reason in the database
            await fetch(`https://team27-express.cpsc4911.com/applications/${selectedApplication.USER_ID}/${selectedApplication.SPONSOR_ID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    STATUS: statusChange,
                    REASON: reasonChange,
                }),
            });

            // Remove the updated application from the visible table if it's no longer pending
            if (statusChange !== 'Pending') {
                const updatedApplications = applications.filter(application => application.USER_ID !== selectedApplication.USER_ID);
                setApplications(updatedApplications);
            }

            // If the status is "Accepted", create a driver
            if (statusChange === 'Accepted') {
                // Make a POST request to create a new driver
                await fetch('https://team27-express.cpsc4911.com/drivers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        USER_ID: selectedApplication.USER_ID,
                        SPONSOR_ID: selectedApplication.SPONSOR_ID,
                    }),
                });

                // Fetch updated list of drivers after creating the new driver
                const updatedDriversResult = await fetch(`https://team27-express.cpsc4911.com/drivers?SPONSOR_ID=${selectedApplication.SPONSOR_ID}`);
                const updatedDriversJsonResult = await updatedDriversResult.json();
                setDrivers(updatedDriversJsonResult);
            }

            await fetch('https://team27-express.cpsc4911.com/application_change', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        USER_ID: USER_ID,
                        SPONSOR_ID: selectedApplication.SPONSOR_ID,
                        DRIVER_ID: selectedApplication.USER_ID,
                        STATUS: statusChange,
                        REASON: reasonChange,
                    }),
                });

            // Clear the selected application and reset status and reason
            setSelectedApplication(null);
            setStatusChange('');
            setReasonChange('');

            
        } catch (error) {
            console.error("Error updating application status:", error);
            setError("Error updating application status. Please try again later.");
        }
    };

    // Function that updates the name of the company
    const updatePointMultiplier= async() =>
    {
        try{
            await fetch(`https://team27-express.cpsc4911.com/sponsors/${sponsorCompany[0].SPONSOR_ID}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        POINT_MULTIPLIER: pointMultiplierChange
                    }),
                });
            setPointMultiplierChange('');
            setSelectedPointMultiplier('');
            sponsorCompany[0].POINT_MULTIPLIER = pointMultiplierChange;
        }catch(error)
        {
            console.error("Error updating point multiplier :", error);
            setError("Error updating point multiplier . Please try again later.");
        }
    }
    const updateName= async() =>
    {
        try{
            await fetch(`https://team27-express.cpsc4911.com/sponsors/${sponsorCompany[0].SPONSOR_ID}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        SPONSOR_NAME: nameChange
                    }),
                });
            setNameChange('');
            setSelectedName(null);
            sponsorCompany[0].SPONSOR_NAME = nameChange;
        }catch(error)
        {
            console.error("Error updating company name :", error);
            setError("Error updating company name . Please try again later.");
        }
    }

    const deleteDriver = async (USER_ID, SPONSOR_ID) => {
        try {
            // Delete the driver from the database
            await fetch(`https://team27-express.cpsc4911.com/drivers/${USER_ID}/${SPONSOR_ID}`, {
                method: 'DELETE',
            });
    
            // Update the local state by removing the deleted driver from the drivers array
            const updatedDrivers = drivers.filter(driver => !(driver.USER_ID === USER_ID && driver.SPONSOR_ID === SPONSOR_ID));
            setDrivers(updatedDrivers);
    
            // Clear the selected driver
            setSelectedDeleteDriver(null);
        } catch (error) {
            console.error("Error deleting driver:", error);
            setError("Error deleting driver. Please try again later.");
        }
    };

    if (loading) {
        return <div>Loading...</div>; 
    }

	return (
	  	<div className='infoContainer'>
			<h2>Sponsor Info</h2>
			<div className="tabs">
                
				<button onClick={() => setCurrentTab('sponsors')}>Company Sponsors</button>
				<button onClick={() => setCurrentTab('drivers')}>Company Drivers</button>
				<button onClick={() => setCurrentTab('applications')}>Pending Applications</button>
                <button onClick={() => setCurrentTab('company management')}>Manage Company</button>

			</div>
			<div className="tabContent">
                {currentTab === 'sponsors' && (
                    <div>
                        <h3>Sponsor Admin</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Company Admin Name</th>
                                    <th>Company Admin Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sponsors.filter(sponsor => sponsor.IS_ADMIN).map((admin) => (
                                    <tr key={admin.USER_ID}>
                                        <td>{admin.FNAME} {admin.LNAME}</td>
                                        <td>{admin.EMAIL}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <h3>Company Sponsor Representatives</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sponsor Name</th>
                                    <th>Sponsor Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sponsors.filter(sponsor => !sponsor.IS_ADMIN).map((sponsor) => (
                                    <tr key={sponsor.USER_ID}>
                                        <td>{sponsor.FNAME} {sponsor.LNAME}</td>
                                        <td>{sponsor.EMAIL}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
				{currentTab === 'drivers' && (
                    <div>
                        <h3>Company Drivers</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Driver Name</th>
									<th>Driver Email</th>
                                    <th>Points</th>
                                    <th>Update Points</th>
                                    <th>Delete Driver</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map((driver) => (
                                    <tr key={driver.USER_ID}>
                                        <td>{driver.FNAME} {driver.LNAME}</td>
										<td>{driver.EMAIL}</td>
                                        <td>{driver.POINTS}</td>
                                        <td>
                                            <button onClick={() => setSelectedUpdatePointsDriver(driver)}>Update Points</button>
                                        </td>
                                        <td>
                                            <button onClick={() => setSelectedDeleteDriver(driver)}>Delete Driver</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
				{currentTab === 'applications' && (
					<div>
					<h3>Pending Applications</h3>
					<table>
						<thead>
						<tr>
							<th>Driver Name</th>
							<th>Answer 1</th>
							<th>Answer 2</th>
							<th>Status</th>
						</tr>
						</thead>
						<tbody>
						{applications.map((application) => (
							<tr key={application.USER_ID}>
							<td>{application.FNAME} {application.LNAME}</td>
							<td>{application.QUESTION_1}</td>
							<td>{application.QUESTION_2}</td>
							<td>
								<button onClick={() => setSelectedApplication(application)}>Update Application</button>
							</td>
							</tr>
						))}
						</tbody>
					</table>
					</div>
				)}
                	{currentTab === 'company management' && (
					<div>
					<h3>Company Management</h3>
					<table>
						<thead>
						<tr>
							<th>Company Name</th>
							<th>Point Multiplier</th>
						</tr>
						</thead>
						<tbody>
                            <tr>
                            <td>{sponsorCompany[0].SPONSOR_NAME}</td>
                            <td>{sponsorCompany[0].POINT_MULTIPLIER}</td>
                            </tr>
						</tbody>
					</table>
                        <button onClick={() => setSelectedName(true)}>Update Company Name</button>
                        <button onClick={() => setSelectedPointMultiplier(true)}>Edit Multiplier</button>
					</div>
				)}
			</div>
			{selectedUpdatePointsDriver && (
                <div className="popup">
                    <div className="popup-content">
                        <span className="close" onClick={() => setSelectedUpdatePointsDriver(null)}>×</span>
                        <h2>Update Points</h2>
                        <div>
                            <label>Points Change:</label>
                            <input type="number" value={pointsChange} onChange={(e) => setPointsChange(e.target.value)} />
                        </div>
                        <div>
                            <label>Reason:</label>
                            <textarea value={pointsReason} onChange={(e) => setPointsReason(e.target.value)} />
                        </div>
                        <button onClick={() => updatePoints('add')}>Add Points</button>
                        <button onClick={() => updatePoints('subtract')}>Subtract Points</button>
                    </div>
                </div>
            )}
            {selectedDeleteDriver && (
                <div className="popup">
                    <div className="popup-content">
                        <span className="close" onClick={() => setSelectedDeleteDriver(null)}>×</span>
                        <h2>Delete Driver</h2>
                        <p>Are you sure you want to delete this driver?</p>
                        <button onClick={() => deleteDriver(selectedDeleteDriver.USER_ID, selectedDeleteDriver.SPONSOR_ID)}>Confirm Delete</button>
                    </div>
                </div>
            )}
			{selectedApplication && (
                <div className="popup">
                    <div className="popup-content">
                        <span className="close" onClick={() => setSelectedApplication(null)}>×</span>
                        <h2>Update Application Status</h2>
                        <div>
                            <label>Status:</label>
                            <select value={statusChange} onChange={(e) => setStatusChange(e.target.value)}>
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Declined">Declined</option>
                            </select>
                        </div>
                        <div>
                            <label>Reason:</label>
                            <textarea value={reasonChange} onChange={(e) => setReasonChange(e.target.value)} />
                        </div>
                        <button onClick={updateApplicationStatus}>Update Status</button>
                    </div>
                </div>
            )}
            {selectedPointMultiplier && (
                <div className="popup">
                <div className="popup-content">
                    <span className="close" onClick={() => setSelectedPointMultiplier(null)}>×</span>
                    <h2>Update Point Multipliers</h2>
                    <div>
                        <label>Current: {sponsorCompany[0].POINT_MULTIPLIER}</label>
                    </div>
                        <label>New: </label>
                        <input type="number" value={pointMultiplierChange} onChange={(e) => setPointMultiplierChange(e.target.value)} step={0.01} />
                    <div>
                    </div>
                    <button onClick={updatePointMultiplier}>Update Point Multiplier</button>
                </div>
            </div>
            )}
             {selectedName && (
                <div className="popup">
                <div className="popup-content">
                    <span className="close" onClick={() => setSelectedName(null)}>×</span>
                    <h2>Update Company Name</h2>
                    <div>
                        <label>Current: {sponsorCompany[0].SPONSOR_NAME}</label>
                    </div>
                        <label>New: </label>
                        <input type="text" value={nameChange} onChange={(e) => setNameChange(e.target.value)} />
                    <div>
                    </div>
                    <button onClick={updateName}>Update Company Name</button>
                </div>
            </div>
            )}
		</div>
	);
}
	
export default Sponsor_Applications;