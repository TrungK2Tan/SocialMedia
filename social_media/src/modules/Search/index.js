import React from "react";
import { useLocation } from 'react-router-dom';
import { navigations } from "../Home/data";
import { useNavigate, Link } from 'react-router-dom';
const Search = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchData = location.state && location.state.searchData;

    return (
        <div className='h-screen bg-[#d2cfdf] flex overflow-hidden'>
            <div className='w-[20%] bg-white flex flex-col'>
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
                    }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg> Log Out</div>
                </div>
            </div>
            <div className='w-[80%] bg-white flex flex-col overflow-scroll  scrollbar-hide '>
                <h1 className="text-3xl font-semibold mb-8">Kết quả tìm kiếm</h1>
                {searchData && searchData.users && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 flex">Người dùng</h2>
                        {searchData.users.map((user, index) => (
                            <div key={index} className="flex flex-col items-center space-x-4 mb-4 ">
                                <p className="text-lg font-semibold flex">{user.username}</p>
                                <img src={user.image} alt={user.username} className="rounded-2xl w-[80%]" />

                            </div>
                        ))}
                    </div>
                )}
                {searchData && searchData.posts && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Bài Đăng</h2>
                        {searchData.posts.map((post, index) => (
                            <div key={index} className="mb-6">
                                <p className="text-lg font-semibold mb-2">Caption: {post.caption}</p>
                                <p className="text-lg mb-2">Description: {post.description}</p>
                                <img src={post.image} alt={post.title} className="rounded-2xl w-[80%]" />
                
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
