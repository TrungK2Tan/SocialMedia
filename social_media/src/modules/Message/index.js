import React, { useEffect, useState, useRef } from "react";
import io from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { Link, useNavigate } from 'react-router-dom'
const Message = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([])
    const [socket, setSocket] = useState(null)
    const [messages, setMessages] = useState({})
    const [message, setMessage] = useState('')
    const messageRef = useRef(null)
    console.log('messages', messages)
    useEffect(() => {
        const newSocket = io('http://localhost:8080');
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);
    useEffect(() => {
        socket?.emit('addUser', user?._id);
        socket?.on('getUsers', (users) => {
            console.log('activeUsers:>>', users);
        });
        socket?.on('getMessage', (data) => {
            setMessages((prev) => ({
                ...prev,
                messages: [...prev.messages, { user: data.user, message: data.message }],
            }));
        });
    }, [socket]);
    useEffect(() => {
        messageRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages?.messages])
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:detail'));
        const fetchConversations = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?._id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const resData = await res.json();
                console.log('resData:', resData);
                setConversations(resData);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`http://localhost:8000/api/alluser/${user?._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const resData = await res.json();
            setUsers(resData);
        };

        fetchUsers();
    }, []);
    const fetchMessages = async (conversationId, receiver) => {
        const res = await fetch(
            `http://localhost:8000/api/message/${conversationId}?senderId=${user?._id}&&receiverId=${receiver?.receiverId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        const resData = await res.json();
        console.log('resData:', resData);
        setMessages({ messages: resData, receiver, conversationId });
    };
    const sendMessage = async (e) => {
        socket?.emit('sendMessage', {
            senderId: user?._id,
            receiverId: messages?.receiver?.receiverId,
            message,
            conversationId: messages?.conversationId,
        });

        const res = await fetch(`http://localhost:8000/api/message/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: messages?.conversationId,
                senderId: user?._id,
                message,
                receiverId: messages?.receiver?.receiverId,
            }),
        });

        if (res.ok) {
            setMessage(''); // Clear message input field
        } else {
            console.error('Failed to send message');
        }
    };

    return (
        <div className="w-screen flex">
            <div className="w-[25%] border border-black h-screen bg-[#a7fdff]">
                <div className="flex justify-center items-center my-4">
                    <img src={user?.image} style={{ width: '75px', height: '75px' }} className='border-4 rounded-full p-[2px]' alt="User Avatar" />
                    <div className="ml-4">
                        <h3 className="text-2xl">{user?.username}</h3>
                        <p className="text-lg font-light">{user?.email}</p>
                    </div>
                </div>
                <hr />
                <div className='h-[15%] pt-10'>
                    <div className='hover:text-red-500 ml-12 cursor-pointer flex gap-2' onClick={() => {
                        navigate('/')
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-home"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
                        Home</div>
                </div>
                <hr/>
                <div className="ml-10 mt-4">
                    <div className="text-lg text-blue-500">Message</div>
                    <div>
                        {
                            conversations.length > 0 ?
                                conversations.map(({ conversationId, user }) => {
                                    return (

                                        <div className="flex items-center my-4 border-b border-b-gray-300 py-2" key={conversationId}>
                                            <div className="cursor-pointer flex items-center" onClick={() => fetchMessages(conversationId, user)}>
                                                <div>
                                                    <img src={user?.image} style={{ width: '50px', height: '50px' }} className='border-4 rounded-full p-[2px]' alt="User Avatar" />
                                                </div>
                                            </div>
                                            <div className="ml-6">
                                                <h3 className="text-xl">{user?.username}</h3>
                                                <p className="text-lg font-light">{user?.email}</p>
                                            </div>
                                        </div>
                                    );
                                }) :
                                <div className="text-center text-lg font-semibold">
                                    No conversations
                                </div>
                        }
                    </div>
                </div>
                
            </div>
            <div className="w-[50%] border h-screen flex flex-col items-center">
                {
                    messages?.receiver?.username &&
                    <div class="w-[75%] bg-gray-300 h-[80px] mt-4 rounded-full flex items-center px-10 ">
                        <div class="cursor-pointer flex items-center">
                            <img className='border-4 rounded-full p-[2px]' src={messages?.receiver?.image} width={60} height={60} alt="Avatar" />
                        </div>
                        <div class="ml-6">
                            <h3 class="text-lg text-white font-bold">{messages?.receiver?.username}</h3>
                            <p class="text-sm font-light text-white">{messages?.receiver?.email}</p>
                        </div>
                        <div class="ml-auto">
                            <div class="cursor-pointer bg-gray-700 rounded-full p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-phone-outgoing text-white"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" /><path d="M15 9l5 -5" /><path d="M16 4l4 0l0 4" /></svg>
                            </div>
                        </div>
                    </div>
                }

                <div className="h-[75%] w-full overflow-scroll scrollbar-hide">
                    <div className="p-4">
                        {

                            messages?.messages?.length > 0 ?
                                messages.messages.map(({ message, user: { id } = {} }) => {
                                    return (
                                        <>
                                            <div class={`max-w-[40%] p-4 mb-4 ${id === user?._id ? 'bg-blue-400 rounded-xl ml-auto text-white ' : 'bg-gray-400 rounded-xl'} `}>
                                                {message}
                                            </div>
                                            <div ref={messageRef}></div>
                                        </>
                                    )


                                }) : <div className="text-center text-lg font-semibold">
                                    No messages or no conversation Selected
                                </div>
                        }
                    </div>
                </div>
                {
                    messages?.receiver?.username &&
                    <div class="p-4 w-full flex items-center">
                        <input type="text" placeholder="Nhập tin nhắn..." value={message} onChange={(e) => setMessage(e.target.value)} class="flex-1 p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none" />
                        <div class="ml-4">
                            <div class={`cursor-pointer bg-light rounded-full p-2 ${!message && 'pointer-events-none'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-mood-smile"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" /></svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class={`cursor-pointer bg-light rounded-full p-2 ${!message && 'pointer-events-none'}`} onClick={() => sendMessage()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-telegram"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg>
                            </div>
                        </div>
                    </div>
                }

            </div>
            <div className="w-[25%] border border-black h-screen overflow-scroll scrollbar-hide bg-gray-300 px-8 py-16">
                <div className="text-lg text-blue-500">People</div>
                <div>
                    {
                        users.length > 0 ?
                            users.map(({ userId, user }) => {
                                return (
                                    <div className="flex items-center my-4 border-b border-b-gray-300 py-2" >
                                        <div className="cursor-pointer flex items-center" onClick={() => fetchMessages('new', user)}>
                                            <div>
                                                <img src={user?.image} style={{ width: '50px', height: '50px' }} className='border-4 rounded-full p-[2px]' alt="User Avatar" />
                                            </div>
                                        </div>
                                        <div className="ml-6">
                                            <h3 className="text-xl">{user?.username}</h3>
                                            <p className="text-lg font-light">{user?.email}</p>
                                        </div>
                                    </div>
                                );
                            }) :
                            <div className="text-center text-lg font-semibold">
                                No conversations
                            </div>
                    }
                </div>
            </div>
        </div>
    )
}
export default Message