import React from 'react';
import  Form  from "./Form";
const Auth =() =>{
    const isSigninPage = window.location.pathname.includes('signin')
    return(
        <Form isSignInPage = {isSigninPage}/>
    )
}
export default Auth;