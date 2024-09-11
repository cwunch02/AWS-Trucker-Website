import React, {useState} from 'react'
import {Button, TextField} from "@mui/material";
import {resetPassword, confirmResetPassword} from 'aws-amplify/auth';
import userpool from "../userpool";
import {useNavigate} from "react-router-dom";


const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [emailErr, setEmailErr] = useState("");
    const [emailEntered, setEmailEntered] = useState(false);
    const [verifyCode, setVerifyCode] = useState("");
    const [verifyCodeErr, setVerifyCodeErr] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordErr, setNewPasswordErr] = useState("");
    const [resetStatus, setResetStatus] = useState("");
    const navigate = useNavigate();

    const formInputChange = (formField, value) => {
        if (formField === "username") {
            setEmail(value);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault()
        try {
            const output = await resetPassword({username: email});
            handleResetPasswordNextSteps(output);
            setEmailEntered(true);
        } catch (error) {
            console.log(error);
        }
    }

    function handleResetPasswordNextSteps(output) {
        const {nextStep} = output;
        switch (nextStep.resetPasswordStep) {
            case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
                const codeDeliveryDetails = nextStep.codeDeliveryDetails;
                console.log(
                    `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
                );
                break;
            case 'DONE':
                console.log('Successfully reset password.');
                break;
        }
    }

    const handleConfirmResetPassword = async(e) => {
        e.preventDefault();
        try {
            await confirmResetPassword({username: email, confirmationCode: verifyCode, newPassword: newPassword});

            const account = await fetch(`https://team27-express.cpsc4911.com/users?EMAIL=${email}`);
            const accountID = await account.json();

            await fetch('https://team27-express.cpsc4911.com/password_change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    USER_ID: accountID[0].USER_ID,
                    AUDIT_USER_ID: accountID[0].USER_ID,
                    REASON: "Forgot Password"
                }),
            });
            setResetStatus("success");
        } catch (error) {
            setResetStatus("error");
            console.log(error);
        }
    }

    const redirectToAnotherPage = () => {
        navigate("/");
    };

    return (
        <div className="forgotPassword">
            <h3>Forgot Password</h3>
            {emailEntered ? (
                <div>
                    <TextField
                        type="text"
                        placeholder="Confirmation Code"
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                    />
                    <TextField
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button onClick={handleConfirmResetPassword}>Reset Password</Button>
                    {resetStatus === "success" && <p>Password changed successfully!</p>}
                    {resetStatus === "error" && <p>Failed to change password. Please try again.</p>}
                    {(resetStatus === "success" || resetStatus === "error") && (
                        <Button variant = "contained" onClick={redirectToAnotherPage}>Continue</Button>
                    )}
                </div>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <div>
                        <p>Please input your email here: </p>
                        <TextField
                            type="email"
                            value={email}
                            placeholder="Email"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button variant = "contained" type="submit">Request Verification Code</Button>
                </form>
            )
            }
        </div>
    )
}
export default ForgotPassword