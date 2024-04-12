import React, { useState } from "react";
import avt from '../../assets/avt.jpg';
// import { stats } from "../Home/data";
import { useEffect } from "react";
import Button from "../../components/Button";
import { useNavigate } from 'react-router-dom'
const Profile = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([])
    const [user, setUser] = useState([])
    const [postsCount, setPostsCount] = useState(0)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [avatarUrl, setAvatarUrl] = useState("");
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
                setPosts(data.posts);
                setUser(data.user);
                setAvatarUrl(data.user.image); // Lưu trữ URL mới của avatar từ server
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
        const fetchPostsStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/posts-stats', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch posts count');
                }
                const data = await response.json();
                setPostsCount(data.postsCount);
            } catch (error) {
                console.error('loi khong hien thi post', error);
            }
        }
        const fetchFollowersStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/followers-stats', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch followers count');
                }
                const data = await response.json();
                setFollowersCount(data.followersCount);
            } catch (error) {
                console.error('Error fetching followers count:', error);
                // Handle error
            }
        };
        const fetchFollowingStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/following-stats', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch following count');
                }
                const data = await response.json();
                setFollowingCount(data.followingCount);
            } catch (error) {
                console.error('Error fetching following count:', error);
                // Handle error
            }
        };

        const getPosts = async () => {
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'GET',
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}` // Corrected spelling of 'Authorization'
                },
            })
            const data = await response.json()
            setPosts(data?.posts)
            setUser(data?.user)
        }
        getPosts();
        fetchProfile();
        fetchPostsStats();
        fetchFollowersStats();
        fetchFollowingStats();
    }, [])
    return (
        <div className=' flex justify-center items-center'>
            <div className='w-[100%]  flex flex-col items-center p-10'>
                <div className='flex flex-col justify-around items-center '>
                <div className='flex'>
                        <img src={avatarUrl || 'default_avatar.jpg'} alt="avt" style={{ width: '120px', height: '120px' }} className='border-4 rounded-full p-2' />
                        <Button icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
                        } onClick={() => navigate('/editprofile')} />
                    </div>
                    <div className='my-4 text-center'>
                        <h3 className='font-medium'>{user?.username}</h3>
                        <p className='my-2'>{user?.email}</p>
                    </div>
                    <div className=' flex justify-around w-[600px] text-center my-4 border'>
                        <div>
                            <h4 className="font-bold">{postsCount}</h4>
                            <p className="font-light text-sm">Posts</p>
                        </div>
                        <div>
                            <h4 className="font-bold">{followersCount}</h4>
                            <p className="font-light text-sm">Followers</p>
                        </div>
                        <div>
                            <h4 className="font-bold">{followingCount}</h4>
                            <p className="font-light text-sm">Following</p>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center flex-wrap'>
                    {
                        posts?.length > 0 &&
                        posts?.map(({ _id, caption = '', description = '', image = '' }) => {
                            return (
                                <div className='w-[400px] mt-6 mx-2 flex flex-col border p-2 rounded-lg '>
                                    <div className=' pb-4 mb-4'>
                                        <img src={image} alt="kakashi" className="rounded-2xl w-[100%]"
                                        onClick={() => navigate('/editpost')} />
                                        <div className='flex mt-4 mb-2 pb-2 justify-center'>
                                            <p className='font-medium text-center'>{caption}</p>
                                        </div>
                                        <p className='text-center'>{description}</p>
                                    </div>
                                    <div className='flex justify-evenly'>
                                        <div className="flex"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-heart"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg> 10.5k </div>
                                        <div className="flex"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-message-dots"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4" /><path d="M12 11l0 .01" /><path d="M8 11l0 .01" /><path d="M16 11l0 .01" /></svg>10.5k </div>
                                        <div className="flex"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-share"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>10.5k </div>
                                        <div className="flex"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-bookmark"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" /></svg>10.5k </div>
                                    </div>
                                </div>
                            )
                        })
                    }


                </div>
            </div>
        </div>
    )
}
export default Profile