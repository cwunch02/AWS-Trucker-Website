import React from 'react'
import { Button, Typography, Container, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const Navigate=useNavigate();
    return (
        <Container  sx={{ boxShadow: 3 , height: 600, p: 5, alignContent: 'center'}}>
            <Grid container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center">
            <div className='home'>
                <Typography variant="h4" align="center" sx={{ textDecoration: "underline", paddingBottom: 5}}>Welcome</Typography>
                <div className='homeButtons'>
                    <Button style={{margin:'10px'}} variant='contained' onClick={()=>Navigate('/signup')}>
                        Signup
                    </Button>
                    <Button style={{margin:'10px'}} variant='contained' onClick={()=>Navigate('/login')}>
                        Login
                    </Button>
                </div>
            </div>
            </Grid>
        </Container>
    )
}

export default Home