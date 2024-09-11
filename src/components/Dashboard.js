import { Button, Typography, Container, Box } from '@mui/material'
import React,{useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import userpool from '../userpool'
import { logout } from '../services/authenticate';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const Dashboard = () => {

    const Navigate = useNavigate();
    const [USER_ID, setUserID] = useState(null);
    const [USER_TYPE, setUserType] = useState(null);
    useEffect(()=>{
        const fetchData = async() => {
            let userType=sessionStorage.getItem('userType');
            switch(userType){
                case 'D':
                    setUserType('Driver');
                    break;
                case 'S':
                    setUserType('Sponsor');
                    break;
                case 'T':
                    setUserType('Sponsor Admin');
                    break;
                case 'A':
                    setUserType('Admin');
                default:
                    return null;
            }
        }
        fetchData();
    },[]);

    const handleLogout=()=>{
        sessionStorage.clear();
        logout();
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box style={{ paddingTop: '64px' }}>
                <Container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100vh' }}>
                    {/* Left side with welcome message */}
                    <div style={{ flex: 1 }}>
                        <Typography variant="h4" gutterBottom>
                            Welcome, {USER_TYPE}!
                        </Typography>
                        <Button variant='contained' onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>

                    {/* Right side with photo collage */}
                    <Box width={800} height={800}>
                        {/* Row 1 with 3 images */}
                        <img src="/gettyimages-1168548988-2048x2048.webp" alt="Image 1" style={{ width: 'calc(33.33% - 5px)', marginBottom: '10px' }} />
                        <img src="/gettyimages-1177117400-2048x2048.webp" alt="Image 2" style={{ width: 'calc(33.33% - 5px)', marginBottom: '10px' }} />
                        <img src="/gettyimages-1289416884-2048x2048.jpg" alt="Image 3" style={{ width: 'calc(33.33% - 5px)', marginBottom: '10px' }} />

                        {/* Row 2 with 4 images */}
                        <img src="/gettyimages-1292256043-2048x2048.webp" alt="Image 4" style={{ width: 'calc(25% - 5px)', marginBottom: '10px' }} />
                        <img src="/gettyimages-1295136400-2048x2048.webp" alt="Image 5" style={{ width: 'calc(25% - 5px)', marginBottom: '10px' }} />
                        <img src="/gettyimages-1318229078-2048x2048.webp" alt="Image 6" style={{ width: 'calc(25% - 5px)', marginBottom: '10px' }} />
                        <img src="/gettyimages-1365666339-2048x2048.jpg" alt="Image 7" style={{ width: 'calc(25% - 5px)', marginBottom: '10px' }} />

                        {/* Row 3 with 1 image */}
                        <img src="/gettyimages-1405272497-2048x2048.webp" alt="Image 8" style={{ width: '100%', marginBottom: '10px' }} />
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Dashboard