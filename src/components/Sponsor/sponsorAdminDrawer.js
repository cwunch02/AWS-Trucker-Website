import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';

const SponsorAdminDrawer = ({ open, onClose }) => {
    return (
        <Drawer anchor='left' open={open} onClose={onClose}>
            <List>
                <ListItem>
                    <ListItemButton component={Link} to="/dashboard">
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/about">
                        <ListItemText primary="About Page" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/s_applications">
                        <ListItemText primary="Sponsor Info" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/promote_sponsors">
                        <ListItemText primary="Create a Sponsor Account" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/s_logs">
                        <ListItemText primary="Sponsor Logs" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/s_pointtrack">
                        <ListItemText primary="Driver Point Tracking" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/driver_view">
                        <ListItemText primary="Driver View" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={Link} to="/s_catalog">
                        <ListItemText primary="Catalog" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default SponsorAdminDrawer;