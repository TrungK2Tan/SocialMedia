import React, { useState, useEffect } from "react";
import Input from "../../components/input"; // Đường dẫn nhập cho thành phần Input đã được sửa
import Button from "../../components/Button";

const EditProfile = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [image, setAvatar] = useState("");
    const [avatarFile, setAvatarFile] = useState(null); // Thêm state để lưu trữ file hình ảnh avatar
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/profile', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch profile data');
                }
                const data = await response.json();
                setUsername(data.user.username);
                setEmail(data.user.email);
                setAvatar(data.user.image);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        fetchProfile();
    }, []);

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setAvatar(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);
    
        try {
            let avatarUrl = image; // Giữ nguyên URL của hình ảnh nếu người dùng không thay đổi avatar
            if (avatarFile) {
                // Người dùng đã chọn một hình ảnh mới
                const formData = new FormData();
                formData.append('file', avatarFile);
                formData.append('upload_preset', 'SocialMedia');
                formData.append('cloud_name', 'dvnsihl8y');
    
                // Upload hình ảnh mới lên Cloudinary
                const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/dvnsihl8y/upload`, {
                    method: 'POST',
                    body: formData
                });
                const cloudinaryData = await cloudinaryResponse.json();
                avatarUrl = cloudinaryData.secure_url; // Lấy URL của hình ảnh mới từ Cloudinary
            }
    
            // Update thông tin người dùng với URL hình ảnh mới (nếu có)
            const updateResponse = await fetch('http://localhost:8000/api/update-profile', {
                method: 'PUT',
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}`
                },
                body: JSON.stringify({
                    username,
                    email,
                    image: avatarUrl // Cập nhật trường image với URL hình ảnh mới
                })
            });
    
            if (!updateResponse.ok) {
                throw new Error('Failed to update profile');
            }
    
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    
    
    

    return (
        <div className='flex justify-center items-center h-screen bg-black'>
            <div className='w-[800px] h-[600px] p-6 bg-white'>
                <form onSubmit={handleSubmit}>
                    <Input
                        placeholder="Username..."
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <Input
                        placeholder="Email..."
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <div>
                        {image && <img src={image} alt="Avatar" />}
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    </div>
                    <Button label='Save' className='bg-red-400 hover:bg-red-500' type='submit' disabled={isLoading} />
                    {error && <p className="text-red-500">{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
