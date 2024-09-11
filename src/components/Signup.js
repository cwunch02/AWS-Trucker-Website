import {CognitoUser, CognitoUserAttribute} from "amazon-cognito-identity-js";
import userpool from "../userpool";
import React, { useState } from "react";
import { Button, TextField } from "@mui/material"
import { useNavigate } from "react-router-dom"

const Signup = () => {
    const Navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [passwordErr, setPasswordErr] = useState("");
    const [birthday, setBirthday] = useState("");
    const [birthdayErr, setBirthdayErr] = useState("");
    const [givenName, setGivenName] = useState("");
    const [givenNameErr, setGivenNameErr] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [familyNameErr, setFamilyNameErr] = useState("");
    const [signUpClicked, setSignUpClicked] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [verifyCodeErr, setVerifyCodeErr] = useState("");
    const [userNameForVerification, setUserNameForVerification] = useState("");
    const [username, setUsername] = useState("");

    const formInputChange = (formField, value) => {
        if (formField === "email") {
            setEmail(value);
        }
        if (formField === "password") {
            setPassword(value);
        }
        if (formField === "birthdate") {
            setBirthday(value);
        }
        if (formField === "given") {
            setGivenName(value);
        }
        if (formField === "family") {
            setFamilyName(value);
        }
    };

    const validation = () => {
        return new Promise((resolve, reject) => {
            if (email === "" && password === "") {
                setEmailErr("Email is Required");
                setPasswordErr("Password is required");
                resolve({email: "Email is required", password: "Password is required"});
            } else if (email === "") {
                setEmailErr("Email is required")
                resolve({email: "Email is required", password: ""});
            } else if (password === "") {
                setPasswordErr("Password is required")
                resolve({email: "", password: "Password is required"});
            } else if (password.length < 6) {
                setPasswordErr("Must be at least 6 characters")
                resolve({email: "", password: "Must be at least 6 characters"});
            } else {
                resolve({email: "", password: ""});
            }
            reject("");
        });
    };

    const verifyUser = (callback) => {
        const userData = {
            Username: userNameForVerification,
            Pool: userpool
        };
        const cognitoUser = new CognitoUser(userData);
        cognitoUser.confirmRegistration(verifyCode, true, (err, data) => {
            callback(err, data);
        });
    }
    const handleClick = (e) => {
        setEmailErr("");
        setPasswordErr("");
        setBirthdayErr("");
        validation()
            .then((res) => {
                if (res.email === '' && res.password === '') {
                    const attributeList = [];
                    attributeList.push(
                        new CognitoUserAttribute({
                            Name: 'email',
                            Value: email,
                        }),
                        new CognitoUserAttribute({
                            Name: 'birthdate',
                            Value: birthday,
                        }),
                        new CognitoUserAttribute({
                            Name: 'given_name',
                            Value: givenName,
                        }),
                        new CognitoUserAttribute({
                            Name: 'family_name',
                            Value: familyName,
                        })
                    );
                    let username = email;
                    setUserNameForVerification(email);
                    userpool.signUp(username, password, attributeList, null, (err, data) => {
                        if (err) {
                            console.log(err);
                            alert("Couldn't sign up");
                        } else {
                            console.log(data);
                            setUsername(data.userSub);
                            setSignUpClicked(true);
                        }
                    });
                }
            }, err => console.log(err))
            .catch(err => console.log(err));
    };

    const handleVerification = () => {
        verifyUser((err, data) =>{
            if(err){
                console.log(err);
                alert("User verification has failed!");
            } else {
                console.log(data);
                alert("User verified successfully!");

                // Adds user to database on signup
                // Defaults user to driver when they signup
                // *NEEDS ERROR HANDLING IF USER IS UNABLE TO BE ADDED TO DATABASE
                const jsonData = {
                    USER_TYPE: 'D',
                    EMAIL: email,
                    USERNAME: username,
                    FNAME: givenName,
                    LNAME: familyName
                };
                
                fetch('https://team27-express.cpsc4911.com/users', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData),
                })
                    .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add user to database');
                    }
                    return response.json();
                    })
                    .then(data => {
                    console.log('User successfully added to database:', data);
                    Navigate("/dashboard");
                    })
                    .catch(error => {
                    console.error('Error adding user:', error);
                    });
              }
            });
        };

    return (
        <div className="signup">
            <div className="form">
                <TextField
                    value={email}
                    onChange={(e) => formInputChange("email", e.target.value)}
                    label="Email"
                    helperText={emailErr}
                />
            </div>
            <div className="formfield">
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
            <div>
                <TextField
                    value={birthday}
                    onChange={(e) => formInputChange("birthdate", e.target.value)}
                    label="Birthday"
                    helperText={birthdayErr}
                />
            </div>
            <div className="form">
                <TextField
                    value={givenName}
                    onChange={(e) => formInputChange("given", e.target.value)}
                    label="GivenName"
                    helperText={givenNameErr}
                />
            </div>
            <div className="form">
                <TextField
                    value={familyName}
                    onChange={(e) => formInputChange("family", e.target.value)}
                    label="FamilyName"
                    helperText={familyNameErr}
                />
            </div>
            <div className="formfield">
                <Button type="submit" variant="contained" onClick={handleClick}>Signup</Button>
            </div>
            {signUpClicked && (
                <div className = "formfield">
                    <TextField
                        value = {verifyCode}
                        onChange = {(e) => setVerifyCode(e.target.value)}
                        label= "Verification Code"
                        helperText = {verifyCodeErr}
                    />
                    <Button type="button" variant="contained" onClick={handleVerification}>
                        Verify
                    </Button>
                </div>
            )}
        </div>
    )
}

export default Signup