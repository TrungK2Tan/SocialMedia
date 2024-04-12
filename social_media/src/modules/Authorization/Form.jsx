import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/input'
import Button from '../../components/Button'
import loginImage from '../../assets/login.png'
import registerImage from '../../assets/register.png'

const Form=({
    isSignInPage = false    
}) =>{
    const navigate = useNavigate()
    const [data,setData] = useState({
        ...(!isSignInPage && {username: ''}),
        email:'',
        password:''
    })
    // console.log(data,'data');
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8000/api/${isSignInPage ? 'login' : 'register'}`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({...data})
            });
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            // console.log(responseData); // Do something with the response data
            if(res.status === 200 && isSignInPage){
                const{token,user} = await res.json();
                console.log(token,user,'reponse');
                localStorage.setItem('user:token',token)
                localStorage.setItem('user:detail',JSON.stringify(user))
                navigate('/');
            }else if(res.status === 401){
                alert('Invalid Credentials')
            }else{
                alert('Success')
            }
        } catch (error) {
            console.error('Error occurred during fetch:', error.message);
            // Handle error here, e.g., show error message to the user
        }
    };
    return(
        <div className='bg-[#d2cfdf] h-screen w-full flex justify-center items-center'>
            <div className='h-[700px] w-[1000px] bg-white flex justify-center items-center'>
                <div className={`h-full w-full flex flex-col justify-center items-center ${!isSignInPage && 'order-2'}`}>
                    <div className='text-3xl'>WELCOME {isSignInPage && 'BACK'}</div>
                    <div className='mb-[50px]'>PLEASE {isSignInPage ? 'LOGIN' : 'REGISTER'} TO CONTINUE</div>
                    <form className='w-[350px]' onSubmit={(e) => handleSubmit(e)}>
                        {
                            !isSignInPage &&
                            <Input label='Username' type='text' placeholder='Enter your Username' value={data.username}
                                   onChange={(e) => setData({...data, username: e.target.value})}/>
                        }
                        <Input label='Email' type='Email' placeholder='Enter your Email' value={data.email}
                               onChange={(e) => setData({...data, email: e.target.value})}/>
                        <Input label='Password' type='password' placeholder='Enter your password' value={data.password}
                               onChange={(e) => setData({...data, password: e.target.value})}/>
                        <Button type={'submit'} className='bg-blue-500 hover:bg-blue-700 '
                                label={isSignInPage ? 'LOGIN' : 'REGISTER'}/>
                    </form>
                    <div className='cursor-pointer'
                         onClick={() => navigate(`${isSignInPage ? '/account/signup' : '/account/signin'}`)}>
                        {isSignInPage ? 'Create new account' : 'Sign In'}
                    </div>
                </div>
                <div className={`h-full w-full bg-gray-400 ${!isSignInPage && 'order-1'}`}>
                {isSignInPage ?
                        <img src={loginImage} alt="Login"  />
                        :
                        <img src={registerImage} alt="Register" />
                    }
                </div>
            </div>
        </div>
    )
}
export default Form