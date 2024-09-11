import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Menu,
    MenuItem,
    Grid,
    Container
} from "@mui/material"

export default function DriverCatalog() {
    const [userID, setUserId] = useState(null);
    const [currentSponsors, setCurrentSponsors] = useState(null);
    const [sponsorCompanies, setSponsorCompanies] = useState(null);
    const [pointChanges, setPointChanges] = useState(null);
    const [catalogItems, setCatalogItems] = useState(null);
    const [carts, setCarts] = useState([]);
    const [anchorEl, setAnchorEl] = useState({});
    const [cartTotals, setCartTotals] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [isDriverView, setIsDriverView] = useState(false);
    useEffect(() => {
        const fetchSponsorCompanies = async () => {
            fetch(`https://team27-express.cpsc4911.com/sponsors`)
                .then(response => response.json())
                .then(data => {
                    setSponsorCompanies(data);
                })
                .catch(error => {
                    console.error('Error fetching sponsors:', error);
                });
        };

        const fetchSponsors = async () => {
            if (userID === null) return;
            let request = '';
            const isDriverView = sessionStorage.getItem("DriverView");
            if(isDriverView){
                const SPONSOR_USER_ID = sessionStorage.getItem("viewDriverUserID");
                const sponsorResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${SPONSOR_USER_ID}`);
                const sponsorData = await sponsorResponse.json();
                request = `https://team27-express.cpsc4911.com/drivers?USER_ID=${userID}&SPONSOR_ID=${sponsorData.SPONSOR_ID}`
            }
            else{
                request = `https://team27-express.cpsc4911.com/drivers?USER_ID=${userID}`
            }
            await fetch(request)
                .then(response => response.json())
                .then(data => {
                    setCurrentSponsors(data);
                })
                .catch(error => {
                    console.error('Error fetching sponsors:', error);
                });
        };

        const fetchSponsorCatalogs = async () => {
            await fetch(`https://team27-express.cpsc4911.com/catalog`)
                .then(response => response.json())
                .then(data => {
                    setCatalogItems(data);
                })
                .catch(error => {
                    console.error('Error fetching catalog items:', error);
                });
        };

        const fetchUserData = async () => {
            try {
                setUserId(sessionStorage.getItem("USER_ID"));
            } catch (error) {
                console.log("Error retrieving user id:", error);
            }
        };

        fetchUserData();
        fetchSponsors();
        fetchSponsorCompanies();
        fetchSponsorCatalogs();

        const fetchPointChanges = async () => {
            let request = '';
            const isDriverView = sessionStorage.getItem("DriverView");
            if(isDriverView){
                setIsDriverView(true);
                const SPONSOR_USER_ID = sessionStorage.getItem("viewDriverUserID");
                const sponsorResponse = await fetch(`https://team27-express.cpsc4911.com/sponsoraccounts?USER_ID=${SPONSOR_USER_ID}`);
                const sponsorData = await sponsorResponse.json();
                request = `https://team27-express.cpsc4911.com/point_change?USER_ID=${userID}&SPONSOR_ID=${sponsorData.SPONSOR_ID}`
            }
            else{
                request = `https://team27-express.cpsc4911.com/point_change?USER_ID=${userID}`
            }
            fetch(request)
                .then(response => response.json())
                .then(data => {
                    setPointChanges(data);
                })
                .catch(error => {
                    console.error('Error fetching sponsors:', error);
                });
        };

        fetchPointChanges();
    }, [userID]);

    function getSponsorNameById(sponsorId) {
        const sponsor = sponsorCompanies.find(sponsor => sponsor.SPONSOR_ID === sponsorId);
        return sponsor ? sponsor.SPONSOR_NAME : "Unknown Sponsor";
    }

    const addItemToCart = (sponsorId, itemId) => {
        const updatedCarts = [...carts];
        const index = updatedCarts.findIndex(cart => cart.sponsorId === sponsorId);
        if (index !== -1) {
            updatedCarts[index].items.push(itemId);
        } else {
            updatedCarts.push({ sponsorId, items: [itemId] });
        }
        setCarts(updatedCarts);
    };

    const removeItemFromCart = async (sponsorId, itemIndex, itemId) => {
        try {
            const response = await fetch(`https://team27-express.cpsc4911.com/ebay?ITEM_ID=${encodeURIComponent(itemId)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const itemData = await response.json();

            const updatedCarts = [...carts];
            const cartIndex = updatedCarts.findIndex(cart => cart.sponsorId === sponsorId);
            if (cartIndex !== -1) {
                updatedCarts[cartIndex].items.splice(itemIndex, 1);
                setCarts(updatedCarts);
            }

            updateCartTotal(sponsorId, -itemData.price.value);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const convertToPoints = (sponsorID, purchaseAmount) => {
        const sponsor = sponsorCompanies.find(sponsor => sponsor.SPONSOR_ID === sponsorID);
        if (sponsor) {
            return parseInt(((purchaseAmount / sponsor.POINT_MULTIPLIER) + 0.5), 10)
        }
        return null; // Or whatever you want to return if sponsor is not found
    };



    const handleClick = (event, sponsorId) => {
        setAnchorEl(prevState => ({
            ...prevState,
            [sponsorId]: event.currentTarget
        }));
    };

    const handleClose = (sponsorId) => {
        setAnchorEl(prevState => ({
            ...prevState,
            [sponsorId]: null
        }));
    };

    const handleCheckout = (sponsorId) => {
        const cart = carts.find(cart => cart.sponsorId === sponsorId);
        if (!cart) return;
        const sponsor = currentSponsors.find(sponsor => sponsor.SPONSOR_ID === sponsorId);
        if(sponsor.POINTS >= convertToPoints(sponsorId, cartTotals[sponsorId])){
            fetch(`https://team27-express.cpsc4911.com/drivers/${userID}/${sponsorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    POINTS: ((sponsor.POINTS)-(convertToPoints(sponsorId, cartTotals[sponsorId])))
                }),
            })
                .then(response => {
                    if (response.ok) {
                        const updatedCarts = carts.filter(c => c.sponsorId !== sponsorId);
                        setCarts(updatedCarts);
                        handleClose(sponsorId); // Close the menu after checkout
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            fetch('https://team27-express.cpsc4911.com/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    SPONSOR_ID: sponsorId,
                    USER_ID: userID,
                    POINT_TOTAL: convertToPoints(sponsorId, cartTotals[sponsorId]),
                    DOLLAR_AMOUNT: cartTotals[sponsorId],
                    ORDER_ITEMS: cart.items
                }),
            })
                .then(response => {
                    if (response.ok) {
                        const updatedCarts = carts.filter(c => c.sponsorId !== sponsorId);
                        setCarts(updatedCarts);
                        handleClose(sponsorId); // Close the menu after checkout
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            return console.log("not enough points")
        }
    };

    const updateCartTotal = (position, amount) => {
        setCartTotals(prevCartTotals => {
            const newCartTotals = [...prevCartTotals];
            newCartTotals[position] += amount;
            return newCartTotals;
        });
    };

    if (currentSponsors === null) {
        return <div>Loading....</div>;
    }

    return (
        <Container  sx={{ boxShadow: 3 , height: '80%', p: 5, alignContent: 'center'}}>
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
                <TableContainer sx={{ marginBottom: 6 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Sponsor Name</TableCell>
                                <TableCell>Points</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentSponsors.map((sponsor, index) => (
                                <TableRow key={index}>
                                    <TableCell>{sponsor.SPONSOR_NAME}</TableCell>
                                    <TableCell>{sponsor.POINTS}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TableContainer>
                    <Table size="small">
                        <TableBody>
                            {currentSponsors.length > 0 ? (
                                currentSponsors.map((sponsor, index) => (
                                    <Box key={index} sx={{ marginBottom: 6 }}>
                                        <TableRow key={index}>
                                            <TableRow sx={{ border: 'none'}}>
                                                <TableCell sx={{ border: 'none' }}>{getSponsorNameById(sponsor.SPONSOR_ID)}</TableCell>
                                                <TableCell sx={{ border: 'none' }}>
                                                    {!isDriverView && <Button
                                                        variant="contained"
                                                        onClick={(event) => handleClick(event, sponsor.SPONSOR_ID)}
                                                    >
                                                        Open Cart
                                                    </Button>}
                                                </TableCell>
                                            </TableRow>
                                            {catalogItems.length > 0 ? (
                                                catalogItems.map((item, idx) => {
                                                    if (sponsor.SPONSOR_ID === item.SPONSOR_ID) {
                                                        return (
                                                            <ItemRow key={idx} item={item} addItemToCart={addItemToCart} updateCartTotal={updateCartTotal} convertToPoints={convertToPoints}/>
                                                        )
                                                    }
                                                })
                                            ) : (
                                                <TableRow key={index}>
                                                    <TableCell colSpan={3}>There are no items in this sponsor's catalog.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableRow>
                                    </Box>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3}>You currently have no sponsors.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {carts.map((cart, index) => (
                    <Menu
                        key={index}
                        anchorEl={anchorEl[cart.sponsorId]}
                        open={Boolean(anchorEl[cart.sponsorId])}
                        onClose={() => handleClose(cart.sponsorId)}
                        MenuListProps={{ autoFocus: true, variant: 'menu' }}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        {cart.items.map((itemId, idx) => {
                            const item = catalogItems.find(item => item.ITEM_ID === itemId);
                            if (item) {
                                return (
                                    <MenuItem key={idx}>
                                        <ItemTitleAndPrice itemId={itemId} convertToPoints={convertToPoints} sponsorId={cart.sponsorId}/>
                                        <Button
                                            variant="contained"
                                            onClick={() => removeItemFromCart(cart.sponsorId, idx, itemId)}
                                            style={{ marginLeft: '8px' }} // Adjust the spacing as needed
                                        >
                                            Remove
                                        </Button>
                                    </MenuItem>
                                );
                            } else {
                                return null;
                            }
                        })}
                        <MenuItem>Total: {convertToPoints(cart.sponsorId, [cart.sponsorId])}</MenuItem>
                        <MenuItem onClick={() => handleCheckout(cart.sponsorId)}>Checkout</MenuItem>
                    </Menu>
                ))}

            </Box>
        </Container>
    );
}

const ItemTitleAndPrice = ({ itemId, convertToPoints, sponsorId}) => {
    const [itemData, setItemData] = useState(null);

    useEffect(() => {
        const fetchItemData = async () => {
            try {
                const response = await fetch(`https://team27-express.cpsc4911.com/ebay?ITEM_ID=${encodeURIComponent(itemId)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setItemData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setItemData({});
            }
        };
        fetchItemData();
        
    }, [itemId]);

    return (
        <TableRow>
            <TableCell>
                {itemData ? (
                    <>
                        <div>{itemData.title}</div>
                        {itemData.price && (
                            <div>{convertToPoints(sponsorId, Number(itemData.price.value))}</div>
                        )}
                    </>
                ) : (
                    'Loading...'
                )}
            </TableCell>
        </TableRow>
    );
};

const ItemRow = ({ item, addItemToCart, updateCartTotal, convertToPoints}) => {
    const [itemData, setItemData] = useState(null);
    const [isDriverView, setIsDriverView] = useState(false);

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
        const isDriverView = sessionStorage.getItem("DriverView");
            if(isDriverView){
                setIsDriverView(true);
            }
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
                            <div>Point Cost: {convertToPoints(item.SPONSOR_ID, Number(itemData.price.value))}</div>
                        )}
                    </>
                ) : (
                    'Loading...'
                )}
            </TableCell>
            <TableCell>
                {!isDriverView && <Button
                    variant="contained"
                    onClick={() => { addItemToCart(item.SPONSOR_ID, item.ITEM_ID); updateCartTotal(item.SPONSOR_ID, Number(itemData.price.value))}}
                >
                    Add item to Cart
                </Button>}
            </TableCell>
        </TableRow>
    );
};