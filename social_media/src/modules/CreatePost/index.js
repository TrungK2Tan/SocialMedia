import React, { useState } from "react";
import Input from "../../components/input"; // Corrected import path for Input component
import Button from "../../components/Button";
import { useNavigate } from 'react-router-dom'

const CreatePost = () => {
    const [data, setData] = useState({
        caption: '',
        desc: '',
        img: null // Changed initial value to null for img
    });
    const [url, setUrl] = useState('');
    const navigate = useNavigate()
    
    const uploadImage = async () => {
        const formData = new FormData();
        formData.append('file', data.img);
        formData.append('upload_preset', 'SocialMedia');
        formData.append('cloud_name', 'dvnsihl8y');

        const res = await fetch(`https://api.cloudinary.com/v1_1/dvnsihl8y/upload`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) { // Changed !res.status === 200 to !res.ok
            const errorData = await res.json(); // Corrected usage of await
            throw new Error(errorData.message); // Throw an error with error message
        } else {
            const responseData = await res.json(); // Corrected usage of await
            return responseData.secure_url; // Return secure_url
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const secureUrl = await uploadImage();
        setUrl(secureUrl);

        const response = await fetch('http://localhost:8000/api/new-post',{
            method: 'POST',
            headers:{
                "Content-Type" : 'application/json',
                Authorization: `Bearer ${localStorage.getItem('user:token')}` // Corrected spelling of 'Authorization'
            },
            body: JSON.stringify({
                caption: data.caption,
                desc: data.desc,
                url: secureUrl,
            })
        });
        if (response.status === 200) {
            navigate('/')
        } else {
            console.log('Error');
        }
    };

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='w-[800px] h-[600px] p-6'>
                <form onSubmit={(e) => handleSubmit(e)}>
                    <Input
                        placeholder="caption..."
                        name='caption' // Changed name from 'title' to 'caption'
                        className='py-4'
                        value={data.caption}
                        onChange={(e) => setData({ ...data, caption: e.target.value })}
                        isRequired={true}
                    />
                    <textarea
                        rows={10}
                        className='w-full border shadow p-4 resize-none'
                        placeholder='Description'
                        value={data.desc}
                        onChange={(e) => setData({ ...data, desc: e.target.value })}
                        required
                    />
                    <Input
                        type='file'
                        name='image'
                        className='py-4'
                        onChange={(e) => setData({ ...data, img: e.target.files[0] })}
                        isRequired={false}
                    />
                    <label htmlFor='image' className='cursor-pointer p-4 border shadow w-full'>{data?.img?.name || 'upload image'}</label>
                    <Button label='Create Post' className='bg-red-400 hover:bg-red-500 mt-4' type='submit' />
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
