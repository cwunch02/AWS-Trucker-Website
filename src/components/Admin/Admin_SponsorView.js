import React, { useEffect, useState } from 'react';
import userpool from '../../userpool';

const SponsorView = ({ onSponsorView }) => {
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sponsorCompany, setSponsorCompany] = useState(null);
    const [sponsorNameMap, setSponsorNameMap] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
		const fetchData = async () => {
			try {
                // GETS CURRENT USER FROM USER TABLE
                const user = userpool.getCurrentUser();
                const username = user.username;
				const userResponse = await fetch(`https://team27-express.cpsc4911.com/users?USERNAME=${username}`);
                const userData = await userResponse.json();
                console.log(userData);

                const sponsorCompanyResult = await fetch(`https://team27-express.cpsc4911.com/sponsors`);
                const sponsorCompanyJsonResult = await sponsorCompanyResult.json();
                const sponsorNameMap = {};
                sponsorCompanyJsonResult.forEach(sponsorCompany => {
                    sponsorNameMap[sponsorCompany.SPONSOR_ID] = sponsorCompany.SPONSOR_NAME;
                });
                setSponsorCompany(sponsorCompanyJsonResult);
                setSponsorNameMap(sponsorNameMap);

                const sponsorResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts`);
                const sponsorData = await sponsorResponse.json();
                const updatedSponsorUsers = sponsorData.map(sponsorUser => ({
                    ...sponsorUser,
                    SPONSOR_NAME: sponsorNameMap[sponsorUser.SPONSOR_ID]
                }));
                setSponsors(updatedSponsorUsers);
                
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
          <h2>Sponsor View</h2>
          <div>
            <h3>Sponsors</h3>
            <table>
                <thead>
                    <tr>
                        <th>Sponsor Name</th>
                        <th>User ID</th>
                        <th>Sponsor Name</th>
                        <th>Sponsor Email</th>
                        <th>Admin</th>
                        <th>Change View</th>
                    </tr>
                </thead>
                <tbody>
                    {sponsors.map((sponsor) => (
                        <tr key={sponsor.USER_ID}>
                            <td>{sponsor.SPONSOR_NAME}</td>
                            <td>{sponsor.USER_ID}</td>
                            <td>{sponsor.FNAME} {sponsor.LNAME}</td>
                            <td>{sponsor.EMAIL}</td>
                            <td>
                            {sponsor.USER_TYPE === 'T' ? (
                                    'Yes' // Display "Admin" if userType is "T"
                                ) : (
                                    'No'
                                )}
                            </td>
                            <td>
								<button onClick={() => onSponsorView(sponsor.USER_ID, sponsor.USER_TYPE)}>Change View</button>
							</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>
    )
}
export default SponsorView;