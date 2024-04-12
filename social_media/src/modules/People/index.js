import React, { useState } from "react";
import avt from '../../assets/avt.jpg';
import { stats } from "../Home/data";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/Button";
import RingLoader from 'react-spinners/RingLoader'

const People = () => {
    const { username } = useParams()
    const [posts, setPosts] = useState([])
    const [user, setUser] = useState([])
    const [isFollowed, setIsFollowed] = useState(false)
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const getPosts = async () => {
            setLoading(true)
            const response = await fetch(`http://localhost:8000/api/people?username=${username}`, {
                method: 'GET',
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}` // Corrected spelling of 'Authorization'
                },
            })
            const data = await response.json()
            setPosts(data?.posts)
            setUser(data?.userDetail)
            setIsFollowed(data?.isFollowed)
            setLoading(false)

        }
        getPosts()
    }, [])

    const handleFollowing = async (purpose = 'follow') => {
        setLoading(true)
        const response = await fetch(`http://localhost:8000/api/${purpose}`, {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${localStorage.getItem('user:token')}` // Corrected spelling of 'Authorization'
            },
            body: JSON.stringify({ id: user.id })
        })
        const data = await response.json()
        setIsFollowed(data?.isFollowed)
        setLoading(false)
    }
    if (loading || !(posts?.length))
        return <div className='flex justify-center items-center h-screen '>
            <RingLoader />
        </div>

    return (
        <div className=' flex justify-center items-center'>
            <div className='w-[100%]  flex flex-col items-center p-10'>
                <div className='flex flex-col justify-around items-center '>
                    <img src={user?.image} alt="avt" style={{ width: '120px', height: '120px' }} className='border-4 rounded-full p-2' />
                    <div className='my-4 text-center'>
                        <h3>{user?.username}</h3>
                        <p className='my-4'>{user?.email}</p>
                    </div>
                    <div className=' flex justify-around w-[600px] text-center my-4 border'>
                        {
                            stats.map(({ id, name, stats }) => {
                                return (
                                    <div key={id}>
                                        <h4 className="font-bold text-2xl">{stats}</h4>
                                        <p className="font-light text-sm text-lg">{name}</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div>
                        {
                            !isFollowed ?
                                <Button label='Follow' disabled={loading} onClick={() => handleFollowing('follow')} />
                                :
                                <Button label='Unfollow' disabled={loading} onClick={() => handleFollowing('unfollow')} />
                        }

                    </div>
                </div>
                <div className='flex justify-center flex-wrap'>
                    {
                        posts?.length > 0 &&
                        posts?.map(({ _id, caption = '', description = '', image = '' }) => {
                            return (
                                <div className='w-[400px] mt-6 mx-2 flex flex-col border p-2 rounded-lg '>
                                    <div className=' pb-4 mb-4'>
                                        <img src={image} alt="kakashi" className="rounded-2xl w-[100%]" />
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
export default People