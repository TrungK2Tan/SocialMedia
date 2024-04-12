import React, { useEffect, useState } from "react";
import avt from '../../assets/avt.jpg';
import Input from "../../components/input";
import Button from "../../components/Button";
import { stats, navigations } from "./data";
import { Link, useNavigate } from 'react-router-dom'
import RingLoader from 'react-spinners/RingLoader'
const Home = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [user, setUser] = useState({});
    // const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [postsCount, setPostsCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [trendingPost, setTrendingPost] = useState(null);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [activeFollowers, setActiveFollowers] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [commentForms, setCommentForms] = useState({});
    useEffect(() => {
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
                console.error('Error fetching posts count:', error);
                // Handle error
            }
        };
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
        const fetchPosts = async () => {
            try {
                setLoading(true)
                const response = await fetch('http://localhost:8000/api/posts', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const responseData = await response.json();
                setData(responseData.posts);
                setUser(responseData.user);
                setLoading(false)
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        const fetchTrendingPosts = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/posts', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch trending posts');
                }
                const data = await response.json();
                // Sort posts by number of likes in descending order
                const sortedPosts = data.posts.sort((a, b) => b.likes.length - a.likes.length);
                // Get the first post (most liked)
                const randomIndex = Math.floor(Math.random() * sortedPosts.length);
                const trendingPost = sortedPosts[randomIndex];
                setTrendingPost(trendingPost);
            } catch (error) {
                console.error('Error fetching trending posts:', error);
            }
        };
        const fetchSuggestions = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/users', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch trending users');
                }
                const data = await response.json();
                const storedUsers = data.users;

                // Lọc ra các người dùng chưa được theo dõi và không phải là người dùng hiện tại
                const nonFollowedUsers = storedUsers.filter(user => !user.isFollowed && user._id !== loggedInUserId);

                // Tạo một mảng rỗng để lưu trữ các người dùng gợi ý
                const suggestedUsers = [];

                // Lặp để lấy ra 3 người dùng ngẫu nhiên từ danh sách nonFollowedUsers
                while (suggestedUsers.length < 3 && nonFollowedUsers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * nonFollowedUsers.length);
                    const randomUser = nonFollowedUsers.splice(randomIndex, 1)[0];
                    suggestedUsers.push(randomUser);
                }

                // Cập nhật state suggestedUsers với danh sách người dùng ngẫu nhiên chưa được theo dõi
                setSuggestedUsers(suggestedUsers);
            } catch (error) {
                console.error('Error fetching trending users:', error);
            }
        };
        const fetchActiveFollowers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/active-followers', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch active followers');
                }
                const data = await response.json();
                setActiveFollowers(data.followers); // Cập nhật state activeFollowers với danh sách người dùng đã follow
            } catch (error) {
                console.error('Error fetching active followers:', error);
            }
        };
        fetchActiveFollowers();
        fetchPosts();
        fetchPostsStats();
        fetchFollowersStats();
        fetchFollowingStats();
        fetchTrendingPosts();
        fetchSuggestions();
    }, []);
    const { _id: loggedInUserId = '', username = '', email = '', image = '' } = user || {}
    const handleCommentChange = (e) => {
        setCommentContent(e.target.value);
        
    };
    // Khi bạn cần hiển thị hoặc ẩn hộp bình luận cho một bài đăng
    const toggleCommentForm = (postId) => {
        setCommentForms(prevState => ({
            ...prevState,
            [postId]: !prevState[postId] // Đảo ngược trạng thái cho bài đăng với id là postId
        }));
    };
    // Trạng thái hiển thị hộp bình luận cho mỗi bài đăng
    const isCommentFormVisible = (postId) => {
        return commentForms[postId] || false;
    };
    const handleCommentSubmit = async (postId, commentContent) => {
        try {
            const response = await fetch(`http://localhost:8000/api/comments/${postId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}`
                },
                body: JSON.stringify({ text: commentContent })
            });
    
            if (!response.ok) {
                throw new Error('Failed to submit comment');
            }
            const { comment } = await response.json();
            setData(prevData => {
                return prevData.map(post => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            comments: [...post.comments, comment]
                        };
                    }
                    return post;
                });
            });
            setCommentContent('');
            setCommentForms(prevState => ({
                ...prevState,
                [postId]: true
            }));
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const handleReaction = async (_id, index, reaction = 'like') => {
        try {
            const response = await fetch(`http://localhost:8000/api/${reaction}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}`
                },
                body: JSON.stringify({ id: _id }) // Fix typo here
            });
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            const { updatedPost } = await response.json();
            const updatePost = data?.map((post, i) => {
                if (i === index) return updatedPost
                else return post
            })
            setData(updatePost)
        } catch (error) {
            console.log(error);
        }

    }

    return (
        <div className='h-screen bg-[#d2cfdf] flex overflow-hidden'>
            <div className='w-[20%] bg-white flex flex-col'>
                {
                    loading ?
                        <div className='flex justify-center items-center h-[30%] border-b'>
                            <RingLoader />
                        </div>
                        :
                        <div className='h-[30%] flex justify-center items-center border-b'>
                            <div className='flex flex-col justify-around items-center'>
                                <img src={image} alt="avt" style={{ width: '75px', height: '75px' }} className='border-4 rounded-[36px] p-2' />
                                <h3>{username}</h3>
                                <p className='my-4'>{email}</p>
                                <div className=' h-[50px] flex justify-around w-[300px] text-center'>

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
                        </div>
                }
                <div className='h-[55%] flex flex-col justify-evenly pl-12 border-b'>
                    {
                        navigations.map(({ id, name, icon, url }) => {
                            return (
                                <Link to={url} key={id} className='hover:text-red-500 cursor-pointer flex gap-2'>
                                    {icon}
                                    <p>{name}</p>
                                </Link>
                            )
                        })
                    }
                </div>
                <div className='h-[15%] pt-10'>
                    <div className='hover:text-red-500 ml-12 cursor-pointer flex gap-2' onClick={() => {
                        localStorage.clear();
                        navigate('/account/signin')
                    }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg> Log Out</div>
                </div>
            </div>
            <div className='w-[60%] overflow-scroll h-full scrollbar-hide'>
                <div className='bg-white h-[75px] border-l flex justify-evenly items-center pt-4 sticky top-0 shadow-lg'>
                    <div className='flex justify-center items-center'>
                        <Input placeholder='Enter your search' />
                        <Button label={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-search"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>} className='mb-4 ml-4' />
                    </div>
                    <Button
                        onClick={() => navigate('/new-post')}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>}
                        label='Create new post'
                        className='rounded-lg mb-4 w-[200px]'
                    />

                </div>
                {
                    loading ?
                        <div className='flex justify-center items-center h-[90%]'>
                            <RingLoader />
                        </div>
                        :
                        data?.map(({ _id = '', caption = '', description = '', image = '', user = {},comments = {}, likes = [] }, index) => {
                            const isAlreadyLiked = likes.length > 0 && likes.includes(loggedInUserId);
                            return (
                                <div className='bg-white w-[80%]  mx-auto mt-8 p-8'>
                                    <div className='border-b flex items-center pb-4 mb-4 cursor-pointer' onClick={() =>
                                        username === user?.username ? navigate('/profile') : navigate(`/user/${user?.username}`)}>
                                        <img src={user?.image} alt="avt" style={{ width: '50px', height: '50px' }} className='border-4 rounded-full p-1' />
                                        <div className='ml-4'>
                                            <h3 className="font-bold">{user?.username}</h3>
                                            <p>{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className='border-b pb-4 mb-4'>
                                    <p style={{fontSize: "17px", paddingBottom: "10px"}}>{description}</p>
                                        <img loading='lazy' src={image} alt="kakashi" className="rounded-2xl w-[100%]" />
                                        {/* <p>{user.username}: {caption}</p> */}

                                    </div>
                                    {isCommentFormVisible(_id) && (
                                        <div className="mt-4" >
                                        {comments.map((comment, commentIndex) => (
                                            <div key={commentIndex} className="mb-2" style={{fontSize: "18px", margin: "5px 0px", border: "1px solid #ddd", borderRadius: "5px", padding: "5px"}}>
                                                <div className="flex ">
                                                    <img src={comment.user?.image} alt="avt" style={{ width: '40px', height: '40px' }} className='border-4 rounded-full p-1' />
                                                    <div>
                                                        <h3 className="font-bold" style={{fontSize: "18px", margin: "3px 10px 0"}}>{comments.user?.username}</h3>
                                                        <p  style={{fontSize: "18px", margin: "0 10px 10px"}}>{comment.text}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            ))}
                                        </div>

                                    )}
                                    {isCommentFormVisible(_id) && (
                                        <div className="mt-4">
                                            <Input
                                                type="text"
                                                value={commentContent}
                                                onChange={handleCommentChange}
                                                placeholder="Type your comment here..."
                                            />
                                            <Button
                                                label="Submit"
                                                onClick={() => handleCommentSubmit(_id, commentContent)}
                                            />
                                        </div>
                                    )}
                                    <div className='flex justify-evenly'>
                                        <div className="flex cursor-pointer items-center" onClick={() => isAlreadyLiked ? handleReaction(_id, index, 'dislike') : handleReaction(_id, index, 'like')}>
                                            <svg fill={isAlreadyLiked ? 'red' : 'white'} color={isAlreadyLiked ? 'red' : 'black'} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-heart">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
                                            </svg> {likes?.length} Likes
                                        </div>
                                        <div className="flex cursor-pointer items-center" onClick={() => toggleCommentForm(_id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-message-dots">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4" />
                                            <path d="M12 11l0 .01" />
                                            <path d="M8 11l0 .01" />
                                            <path d="M16 11l0 .01" />
                                        </svg> {comments?.length} Comments
                                        </div>
                                        <div className="flex cursor-pointer items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-share"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>10.5k Shares</div>
                                        <div className="flex cursor-pointer items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-bookmark"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" /></svg>10.5k Saved</div>
                                    </div>
                                </div>
                            )
                        })
                }

            </div>
            <div className='w-[20%] bg-white overflow-scroll scrollbar-hide'>
                <h1 className="pt-4 ms-8 font-bold text-xl ">Trending Feeds</h1>
                <div className='w-[80%] h-[200px] mx-auto mt-8 '>
                    {trendingPost && (
                        <div className='w-full h-[200px] overflow-hidden rounded-2xl'>
                            <img
                                loading='lazy'
                                src={trendingPost.image}
                                alt="kakashi"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
                </div>
                <h1 className="pt-4 ms-8 font-bold text-xl">Suggestions for you</h1>
                <div className='w-[80%] h-auto flex flex-col p-4'>
                    {suggestedUsers
                        .filter(user => user._id !== loggedInUserId) // Filter out the current user
                        .map((user, index) => (
                            <div key={index} className='flex items-center justify-between mb-4'>
                                <div className="flex items-center" onClick={() =>
                                    username === user?.username ? navigate('/profile') : navigate(`/user/${user?.username}`)}>
                                    {user.image ? ( // Check if user has an image URL
                                        <img src={user?.image} alt="avt" style={{ width: '75px', height: '75px' }} className='border-4 rounded-full p-1' />
                                    ) : (
                                        <div className="border-4 rounded-full p-2 w-16 h-16 flex justify-center items-center bg-gray-200">
                                            <span className="text-gray-500">Avt</span>
                                        </div>
                                    )}
                                    <h1 className="mt-2 text-sm font-semibold ps-2 pb-2">{user.username}</h1>
                                </div>
                            </div>
                        ))}
                </div>

                <h1 className="pt-4 ms-8 font-bold text-xl">Active Followers</h1>
                <div className='w-[80%] h-auto flex flex-col p-4'>
                    {activeFollowers.map(follower => (
                        <div key={follower._id} className='flex items-center justify-between mb-4'>
                            <div className="flex items-center">
                                {follower.image ? (
                                    <img src={follower.image} alt="avt" style={{ width: '75px', height: '75px' }} className='border-4 rounded-full p-2' />
                                ) : (
                                    <img src={avt} alt="avt" style={{ width: '75px', height: '75px' }} className='border-4 rounded-full p-2' />
                                )}
                                <h1 className="mt-2 text-sm font-semibold ps-2 pb-2">{follower.username}</h1>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    )
}
export default Home