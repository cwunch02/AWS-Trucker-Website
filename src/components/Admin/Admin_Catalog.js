import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField, Menu, MenuItem
} from "@mui/material";

export default function Admin_Catalog() {
    const [userID, setUserId] = useState(null);
    const [currentSponsors, setCurrentSponsors] = useState(null);
    const [sponsorCompanies, setSponsorCompanies] = useState(null);
    const [catalogItems, setCatalogItems] = useState(null);
    const [itemId, setItemId] = useState('');
    const [sponsorId, setSponsorId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userIdFromStorage = sessionStorage.getItem("USER_ID");
                setUserId(userIdFromStorage);

                if (userIdFromStorage !== null) {
                    const sponsorsResponse = await fetch(`https://team27-express.cpsc4911.com/drivers?USER_ID=${userIdFromStorage}`);
                    const sponsorsData = await sponsorsResponse.json();
                    setCurrentSponsors(sponsorsData);

                    const sponsorCompaniesResponse = await fetch(`https://team27-express.cpsc4911.com/sponsors`);
                    const sponsorCompaniesData = await sponsorCompaniesResponse.json();
                    setSponsorCompanies(sponsorCompaniesData);

                    const sponsorCatalogsResponse = await fetch(`https://team27-express.cpsc4911.com/catalog`);
                    const sponsorCatalogsData = await sponsorCatalogsResponse.json();
                    setCatalogItems(sponsorCatalogsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    function getSponsorNameById(sponsorId) {
        const sponsor = sponsorCompanies.find(sponsor => sponsor.SPONSOR_ID === sponsorId);
        return sponsor ? sponsor.SPONSOR_NAME : "Unknown Sponsor";
    }

    const deleteItem = (itemId) => {
        fetch(`https://team27-express.cpsc4911.com/catalog?ITEM_ID="${itemId}"`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete item');
                }
                // Refresh catalog after successful deletion
                fetchCatalogItems();
            })
            .catch(error => {
                console.error('Error deleting item:', error);
                // Handle error as needed
            });
    };

    const handlePostRequest = () => {
        if (!itemId || !userID) return;
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
                // Refresh catalog after successful addition
                fetchCatalogItems();
                setItemId(''); // Clear input after adding item
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle error as needed
            });
    };

    const [dataArray, setDataArray] = useState([]);

    // Function to add item ID to the array
    const addItemToArr = (itemId) => {
        setDataArray(prevArray => [...prevArray, itemId]);
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if(currentSponsors === null)
    {
        return <div> Loading.... </div>
    }

    const handleCheckout = () => {
        /*
        fetch('https://team27-express.cpsc4911.com/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                SPONSOR_ID: sponsorId,
                USER_ID: USER_ID
            }),
        })
            .then(response => {
                // Clear the cart if the request is successful
                if (response.ok) {
                    setDataArray([]);
                    setAnchorEl(null); // Close the menu after checkout
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
         */
        setDataArray([]);
        setAnchorEl(null); // Close the menu after checkout
    };
    const fetchCatalogItems = async () => {
        try {
            const response = await fetch(`https://team27-express.cpsc4911.com/catalog`);
            const data = await response.json();
            setCatalogItems(data);
        } catch (error) {
            console.error('Error fetching catalog items:', error);
        }
    };

    return (
        <Container  sx={{ boxShadow: 3 , height: '90%', p: 5, alignContent: 'center'}}>
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
                <TextField
                    label="Sponsor ID"
                    value={sponsorId}
                    onChange={(e) => setSponsorId(e.target.value)}
                />
                <Button variant="contained" onClick={handlePostRequest}>
                    Add Item
                </Button>
                <Button variant="contained" onClick={handleClick}>
                    Open Cart
                </Button>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {dataArray.map((item, index) => (
                        <MenuItem key={index}>{item}</MenuItem>
                    ))}

                    <MenuItem onClick={handleCheckout}>Checkout</MenuItem>
                </Menu>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Sponsor Name</TableCell>
                                <TableCell>Item ID</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {catalogItems && catalogItems.length > 0 ? (
                                catalogItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{getSponsorNameById(item.SPONSOR_ID)}</TableCell>
                                        <TableCell>{item.ITEM_ID}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" onClick={() => deleteItem(item.ITEM_ID)}>Delete</Button>
                                        </TableCell>
                                        <TableCell>
                                            <TableCell><Button variant="contained" onClick={() => addItemToArr(item.ITEM_ID)}>Add item to Cart</Button></TableCell>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3}>No items found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
}
