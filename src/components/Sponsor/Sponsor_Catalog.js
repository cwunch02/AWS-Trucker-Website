import React, { useEffect, useState } from 'react';
import {
    Input,
    TextField,
    Box,
    Container,
    Typography,
    Button,
    Grid,
    TableContainer,
    Table,
    TableHead, TableRow, TableCell, TableBody
} from "@mui/material"
import userpool from "../../userpool";

export default function Sponsor_Catalog() {
    const [userID, setUserId] = useState(null);
    const [FNAME, setFNAME] = useState(null);
    const [currentSponsors, setCurrentSponsors] = useState(null);
    const [sponsorCompanies, setSponsorCompanies] = useState(null);
    const [pointChanges, setPointChanges] = useState(null);
    const [catalogItems, setCatalogItems] = useState(null);
    const [sortedChanges, setSortedChanges] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const userIdFromStorage = sessionStorage.getItem("USER_ID");
                setUserId(userIdFromStorage);
                console.log(userIdFromStorage);
    
                // Fetch sponsors
                if (userIdFromStorage !== null) {
                    const sponsorsResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${userIdFromStorage}`);
                    const sponsorsData = await sponsorsResponse.json();
                    console.log(sponsorsData)

                    setCurrentSponsors(sponsorsData);
    
                    // Fetch sponsor companies
                    const sponsorCompaniesResponse = await fetch(`https://team27-express.cpsc4911.com/sponsors`);
                    const sponsorCompaniesData = await sponsorCompaniesResponse.json();
                    setSponsorCompanies(sponsorCompaniesData);
    
                    // Fetch sponsor catalogs
                    const sponsorCatalogsResponse = await fetch(`https://team27-express.cpsc4911.com/catalog?SPONSOR_ID=${sponsorsData.SPONSOR_ID}`);
                    const sponsorCatalogsData = await sponsorCatalogsResponse.json();
                    setCatalogItems(sponsorCatalogsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);
    
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

    const deleteItem = (item) => {
        // Make a DELETE request to the API to delete the item
        fetch(`https://team27-express.cpsc4911.com/catalog?ITEM_ID="${item}"`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete item');
                }
                // Handle successful deletion as needed
            })
            .catch(error => {
                console.error('Error deleting item:', error);
                // Handle error as needed
            });
    };

    function getEbayItem(itemId){
        return (
            <Grid container spacing={2} alignItems="right">
                <Grid item>
                    <Typography variant="body1">{itemId}</Typography>
                </Grid>
                <Grid item>
                    <Button variant="contained" onClick={() => deleteItem(itemId)}>Delete</Button>
                </Grid>
            </Grid>
        )
    }

    const [itemId, setItemId] = useState('');

    const handlePostRequest = (sponsorId) => {
        // Send POST request to the endpoint
        fetch('https://team27-express.cpsc4911.com/catalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                SPONSOR_ID: sponsorId,
                ITEM_ID: itemId
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to post data');
                }
                // Handle success response
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error as needed
            });
    };


    if(currentSponsors === null || catalogItems === null)
    {
        return <div> Loading... </div>
    }

    return (
        <Container  sx={{ boxShadow: 3 , height: 600, p: 5, alignContent: 'center'}}>
            <Grid container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center">
                <div className='infoContainer'>
                    <Typography variant="h4" align="center" sx={{ textDecoration: "underline"}}>
                        Catalog
                    </Typography>
                </div>
            </Grid>
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Catalog
                </Typography>
                <TextField
                    label="Item ID"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                />
                <Button variant="contained" onClick={() => handlePostRequest(currentSponsors.SPONSOR_ID)}>
                    Add Item
                </Button>
                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            {catalogItems.length > 0 ? (
                                catalogItems.map((item, idx) => {
                                    return (
                                        <ItemRow key={idx} item={item}/>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2}>there are no items in this sponsors catalog.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
}

const ItemRow = ({ item }) => {
    const [itemData, setItemData] = useState(null);

    useEffect(() => {
        const fetchEbayItemData = async () => {
            try {
                const response = await fetch(`https://team27-express.cpsc4911.com/ebay?ITEM_ID=${encodeURIComponent(item.ITEM_ID)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json(); // Parse the response JSON
                setItemData(data); // Set the state to the item data
            } catch (error) {
                console.error('Error fetching data:', error);
                setItemData({}); // Set an empty object if there's an error
            }
        };
        fetchEbayItemData();
    }, [item.ITEM_ID]);

    return (
        <TableRow>
            <TableCell>
                {itemData ? (
                    <>
                        <div>{itemData.title}</div>
                        {itemData.image && (
                            <img
                                src={itemData.image.imageUrl}
                                alt="Item Image"
                                style={{ maxWidth: '20%', height: 'auto' }}
                            />
                        )}
                        {itemData.price && (
                            <div>{itemData.price.value}</div>
                        )}
                    </>
                ) : (
                    'Loading...'
                )}
            </TableCell>
        </TableRow>
    );
};