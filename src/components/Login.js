import React, { useState } from 'react'
import { Button, TextField,Typography, Container, Box, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import { authenticate } from '../services/authenticate';
import userpool from '../userpool';
import {CognitoUser} from "amazon-cognito-identity-js";
import {AuthenticationDetails} from "amazon-cognito-identity-js";

const Login = ({onLogin}) => {

    const Navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailErr, setEmailErr] = useState('');
    const [passwordErr, setPasswordErr] = useState('');
    const [loginErr,setLoginErr]=useState('');
    const [newPassword, setNewPassword]=useState('');

    const formInputChange = (formField, value) => {
        if (formField === "email") {
            setEmail(value);
        }
        if (formField === "password") {
            setPassword(value);
        }
        if (formField === 'newPassword') {
            setNewPassword(value);
        }
    };

    const validation = () => {
        return new Promise((resolve, reject) => {
            if (email === '' && password === '') {
                setEmailErr("Email is Required");
                setPasswordErr("Password is required")
                resolve({ email: "Email is Required", password: "Password is required" });
            }
            else if (email === '') {
                setEmailErr("Email is Required")
                resolve({ email: "Email is Required", password: "" });
            }
            else if (password === '') {
                setPasswordErr("Password is required")
                resolve({ email: "", password: "Password is required" });
            }
            else if (password.length < 6) {
                setPasswordErr("must be 6 character")
                resolve({ email: "", password: "must be 6 character" });
            }
            else {
                resolve({ email: "", password: "" });
            }
        });
    };

    const handleLoginSubmitSuccess = () => {

        // push to Application table
        const formData = {
            USERNAME: email,
            SUCCESS: true
        };

        // Sending log in attempt to database
        fetch('https://team27-express.cpsc4911.com/login_attempt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send login data');
                }
                return response.json();
            })
            .then(data => {
                console.log('Login attempt submitted successfully:', data);
                // we can redirect user here instead if we want
            })
            .catch(error => {
                console.error('Error submitting login attempt:', error);
            });
    }

    const handleLoginSubmitFail = () => {

        // push to Application table
        const formData = {
            USERNAME: email,
            SUCCESS: false
        };

         // Sending log in attempt to database
        fetch('https://team27-express.cpsc4911.com/login_attempt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to send login data');
                }
                return response.json();
            })
            .then(data => {
                console.log('Login attempt submitted successfully:', data);
                // we can redirect user here instead if we want
            })
            .catch(error => {
                console.error('Error submitting login attempt:', error);
            });
    }

    const handleClick = () => {
        setEmailErr("");
        setPasswordErr("");
        validation()
            .then((res) => {
                if (res.email === '' && res.password === '') {
                    const user = new CognitoUser({
                        Username: email,
                        Pool:userpool
                    });
            
                    const authDetails = new AuthenticationDetails({
                        Username:email,
                        Password:password
                    });
            
                    user.authenticateUser(authDetails, {
                        newPasswordRequired:() =>{
                            console.log('New Password Required');
                            setLoginErr('newPasswordRequired')
                            if(newPassword){
                                user.completeNewPasswordChallenge(newPassword, null, {
                                    onSuccess:(result) => {
                                        console.log('New password set successfully');
                                        setLoginErr('');
                                        const user = userpool.getCurrentUser();
                                        const username = user.username;
                                        onLogin(username);
                                        handleLoginSubmitSuccess();
                                        Navigate('/dashboard');
                                    },
                                    onFailure:(err) => {
                                        console.error('Error setting new password:', err);
                                    }
                                })
                            }  
                        },
                        onSuccess:(result) => {
                            setLoginErr('');
                            const user = userpool.getCurrentUser();
                            const username = user.username;
                            onLogin(username);
                            handleLoginSubmitSuccess();
                            Navigate('/dashboard');
                        },
                        onFailure:(err)=>{
                            handleLoginSubmitFail();
                            setLoginErr(err.message)
                        }
                    });
            }
            }, err => console.log(err))
            .catch(err => console.log(err));
    }



    return (
        <Container  sx={{ boxShadow: 3 , height: 600, p: 5, alignContent: 'center'}}>
        <Grid container
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center">
        <div className="login">

            <div className='form'>
                <div className="formfield">
                    <TextField
                        value={email}
                        onChange={(e) => formInputChange("email", e.target.value)}
                        label="Email"
                        helperText={emailErr}
                    />
                </div>
                <div className='formfield'>
                    <TextField
                        value={password}
                        onChange={(e) => {
                            formInputChange("password", e.target.value)
                        }}
                        type="password"
                        label="Password"
                        helperText={passwordErr}
                    />
                </div>
                {loginErr === 'newPasswordRequired' && ( // Conditionally render new password field
                <div className="formfield">
                <TextField
                  value={newPassword}
                  onChange={(e) => formInputChange('newPassword', e.target.value)}
                  type="password"
                  label="New Password"
                />
                </div>
                    )}
                <div>
                    <a href="https://sprint9.d2tdrdz7sencn.amplifyapp.com/forgot-password">
                        <Button>Forgot Password?</Button>
                    </a>
                </div>
                <div className='formfield'>
                    <Button type='submit' variant='contained' onClick={handleClick}>Login</Button>
                </div>
                <div className='formfield'>
                    <a href="https://branch7.d2tdrdz7sencn.amplifyapp.com/signup">
                        <Button>Signup</Button>
                    </a>
                </div>
                <Typography variant="body">{loginErr}</Typography>
            </div>

        </div>
        </Grid>
        </Container>
    )
}

export default Login