const express = require('express');
const cookieParser = require('cookie-parser');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const cors = require('cors');
const io = require('socket.io')(8080, {
    cors: {
        origin: 'http://localhost:3000',
    }
})

const app = express()

//Import Schemas
const Users = require('./models/userSchema');
const Post = require('./models/postSchema');
const Conversations = require('./models/conversationSchema');
const Messages = require('./models/messageSchema');
//connect to db
require('./db/connection')
//import Middlewares
const authenticate = require('./middleware/auth');
const Contacts = require('./models/contactSchema');

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

const port = process.env.PORT || 8000;
//socket.io
let users = [];
io.on('connection', socket => {
    console.log('User connected', socket.id);

    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await Users.findById(senderId);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, username: user.username, email: user.email }
            });
        } else {
            io.to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user: { id: user._id, username: user.username, email: user.email }
            });
        }
    });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
});
app.post('/api/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400).send('Cannot be empty');
        }
        const isExist = await Users.findOne({ email });
        console.log(isExist, 'isExist');
        if (isExist) {
            return res.status(400).send('User already exists');
        } else {
            const hashedPassword = await bcryptjs.hash(password, 10);
            const user = new Users({
                username,
                email,
                password: hashedPassword // Set the hashed password directly
            });
            await user.save();
            console.log('User registered successfully:', user);
            return res.status(200).send('Successfully registered');
        }
    } catch (error) {
        res.status(500).send('Server Error');
        console.log(error, 'error');
    }
});


app.post('/api/login',async(req,res) =>{
    const{email,password} = req.body
    const user = await Users.findOne({ email });
    if(!user){
        res.status(401).send('User or password is invalid')
    }else{
        const validate =await bcryptjs.compare(password,user.password)
        if(!validate){
            res.status(401).send('User or password is invalid')
        }else{
            const payload = {
                id: user._id,
                username:user.username
            }
            const JWT_SECTRET_KEY = process.env.JWT_SECTRET_KEY || 'THIS_IS_THE_SECRET_KEY_OF_JWT';
            jsonwebtoken.sign(
                payload,
                JWT_SECTRET_KEY,
                {expiresIn: 86400},
                (err,token)=>{
                    if(err) res.json({message:err})
                    return res.status(200).json({user,token})
                }
            )
        }
    }
})
app.post('/api/new-post',authenticate, async (req,res) =>{
    try{
        const {caption, desc,url} = req.body;
        const {user}=req
        if(!caption || !desc || !url){
            res.status(400).send('Please fill all the fields')
        }
        const createPost = new Post({
            caption,
            description: desc,
            image: url,
            user:user
        })
        await createPost.save()
        res.status(200).send('Create Post Successfully')
    }catch(error){
        res.status(500).send('Error'+error)
    }
})

app.get('/api/profile',authenticate, async(req,res) =>{
    try{
        const {user} = req;
        const posts = await Post.find({user:user._id}).populate("user","_id, username")
        // console.log(posts,'<= posts');
        res.status(200).json({posts,user});
    }catch(error){
        res.status(500).send(error)
    }
})
app.put('/api/update-profile', authenticate, async (req, res) => {
    try {
        const { username, email, image } = req.body; // Thêm trường image để nhận URL mới của avatar
        const { user } = req;

        // Kiểm tra xem người dùng muốn cập nhật có phải là người dùng hiện tại hay không
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized: Cannot update other users profile' });
        }

        // Kiểm tra xem có tồn tại người dùng có cùng username hoặc email hay không
        if (username || email) {
            const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
        }

        // Cập nhật thông tin cá nhân của người dùng, bao gồm cả avatar
        if (username) {
            user.username = username;
        }
        if (email) {
            user.email = email;
        }
        if (image) {
            user.image = image; // Cập nhật URL mới của avatar
        }
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/people', authenticate, async (req, res) => {
    try {
        const { username } = req.query;
        const {user: follower} = req
        const user = await Users.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const posts = await Post.find({ user: user._id });
        const [isFollowed] = await Contacts.find({follower:follower._id, followed:user._id})
        console.log(isFollowed,'isFollowed')
        const userDetail = {
    id: user._id,
    username: user.username,
    email: user.email,
    image: user.image
};
        res.status(200).json({ posts, userDetail ,isFollowed: !! isFollowed});
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get('/api/posts',authenticate, async(req,res) =>{
    try{
        const {user} = req
        const posts = await Post.find().populate('user', '_id username email image').sort({'_id':-1})

        // console.log(posts,'<= posts');
        res.status(200).json({posts,user});
    }catch(error){
        res.status(500).send(error)
    }
})

app.get('/api/users', authenticate, async (req, res) => {
    try {
        const loggedInUserId = req.user._id; // Lấy ID của người dùng hiện tại từ thông tin xác thực

        // Truy vấn để lấy danh sách tài khoản người dùng với thông tin về mối quan hệ theo dõi
        const usersWithFollowInfo = await Users.aggregate([
            {
                $lookup: {
                    from: 'contacts',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $and: [
                                            { $eq: ['$follower', loggedInUserId] },
                                            { $eq: ['$followed', '$$userId'] }
                                        ] },
                                        { $and: [
                                            { $eq: ['$followed', loggedInUserId] },
                                            { $eq: ['$follower', '$$userId'] }
                                        ] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'followInfo'
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    isFollowed: { $cond: { if: { $gt: [{ $size: '$followInfo' }, 0] }, then: true, else: false } } // Thêm trường isFollowed để xác định người dùng hiện tại có đang theo dõi người dùng này hay không
                }
            }
        ]);

        res.status(200).json({ users: usersWithFollowInfo }); // Trả về danh sách người dùng với thông tin về mối quan hệ theo dõi
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// Route to get active followers
app.get('/api/active-followers', authenticate, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Truy vấn để lấy danh sách người dùng đã được follow
        const activeFollowers = await Contacts.find({ followed: loggedInUserId });

        // Lấy danh sách ID của những người dùng đã follow
        const activeFollowerIds = activeFollowers.map(contact => contact.follower);

        // Truy vấn để lấy thông tin của những người dùng đã follow
        const followersInfo = await Users.find({ _id: { $in: activeFollowerIds } });

        res.status(200).json({ followers: followersInfo });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/follow', authenticate, async (req, res) => {
    try{
        const {id} = req.body;
        const {user} = req;
        if(!id) return res.status(400).send('Id cannot be empty')
        const [followedUser] =await Users.find({_id:id})
        const followUser = new Contacts({
            follower: user,
            followed: followedUser
        })
        await followUser.save()
        res.status(200).json({isFollowed:true})
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
})

app.post('/api/unfollow', authenticate, async (req, res) => {
    try{
        const {id} = req.body;
        const {user} = req;
        if(!id) return res.status(400).send('Id cannot be empty')
        await Contacts.deleteOne({follower:user._id, followed: id})

        res.status(200).json({isFollowed:false})
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
})

app.put('/api/like', authenticate, async (req, res) => {
    try{
        const {id} = req.body;
        const {user} = req;
        if(!id) return res.status(400).send('Id cannot be empty')

        const updatedPost = await Post.findOneAndUpdate({ _id: id},{
            $push: {likes: user._id}
        }, {returnDocument: "after" }).populate('user','_id username email')

        // await followUser.save()
        res.status(200).json({updatedPost})

    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
})

app.put('/api/dislike', authenticate, async (req, res) => {
    try{
        const {id} = req.body;
        const {user} = req;
        if(!id) return res.status(400).send('Id cannot be empty')

        const updatedPost = await Post.findOneAndUpdate({ _id: id},{
            $pull: {likes: user._id}
        }, {returnDocument: "after" }).populate('user','_id username email')

        // await followUser.save()
        res.status(200).json({updatedPost})
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
})


app.get('/api/posts-stats', authenticate, async (req, res) => {
    try {
        const { user } = req;
        const postsCount = await Post.countDocuments({ user: user._id });
        res.status(200).json({ postsCount });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/followers-stats', authenticate, async (req, res) => {
    try {
        const { user } = req;
        const followersCount = await Contacts.countDocuments({ follower: user._id });
        res.status(200).json({ followersCount });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/following-stats', authenticate, async (req, res) => {
    try {
        const { user } = req;
        const followingCount = await Contacts.countDocuments({ followed: user._id });
        res.status(200).json({ followingCount });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.put('/api/posts/:postId', authenticate, async (req, res) => {
    try {
        const { user } = req;
        const { postId } = req.params;
        const { caption, description, image } = req.body;

        // Check if the user owns the post before allowing edit
        const post = await Post.findOne({ _id: postId, user: user._id });
        if (!post) {
            return res.status(404).json({ error: 'Post not found or you do not have permission to edit this post' });
        }

        // Update post fields
        if (caption) {
            post.caption = caption;
        }
        if (description) {
            post.description = description;
        }
        if (image) {
            post.image = image;
        }

        // Save updated post
        const updatedPost = await post.save();

        res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
        console.error('Error editing post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/:postId', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.postId);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Server-side route to handle password update
app.put('/api/editPassword', authenticate, async (req, res) => {
    try {
        const { user } = req;
        const { newPassword } = req.body;

        // Hash the new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        // Update user's password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const newConversation = new Conversations({ members: [senderId, receiverId] })
        await newConversation.save();
        res.status(200).send('Conversation success fully')
    } catch (error) {
        console.log(error, 'error')
    }
})
app.get('/api/conversations/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversations.find({ members: { $in: [userId] } })
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = await Users.findById(receiverId)
            return { user: { receiverId: user._id, email: user.email, username: user.username, image: user.image }, conversationId: conversation._id }
        }))
        res.status(200).json(await conversationUserData)
    } catch (error) {
        console.log(error, 'error')
    }
})
app.post('/api/message', async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;
        if (!senderId || !message) return res.status(400).send('Please fill all required fields')
        if (conversationId === 'new' && receiverId) {
            const newCoversation = new Conversations({ members: [senderId, receiverId] });
            await newCoversation.save();
            const newMessage = new Messages({ conversationId: newCoversation._id, senderId, message });
            await newMessage.save();
            return res.status(200).send('Message sent successfully')
        } else if (!conversationId && !receiverId) {
            return res.status(400).send('Please fill all required fields')
        }
        const newMessage = new Messages({ conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send('Message sent thanh cong')
    } catch (error) {
        console.log(error, 'error')
    }
})
app.get('/api/message/:conversationId', async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            const messages = await Messages.find({ conversationId })
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await Users.findById(message.senderId);
                return { user: { id: user._id, email: user.email, usename: user.username, image: user.image }, message: message.message }
            }))
            res.status(200).json(await messageUserData)
        }
        const conversationId = req.params.conversationId;
        if (conversationId === 'new') {
            const checkConversation = await Conversations.find({ members: { $all: [req.query.senderId, req.query.receiverId] } })
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id)
            } else {
                return res.status(200).json([])
            }
        } else {
            checkMessages(conversationId)
        }
    } catch (error) {
        console.log('Error', error)
    }
})
app.get('/api/alluser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const users = await Users.find({ _id: { $ne: userId } })
        const usersData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, username: user.username, image: user.image, receiverId: user.id } }
        }))
        res.status(200).json(await usersData)
    } catch (error) {
        console.log(error, "Error")
    }
})
app.get('/api/search', authenticate, async (req, res) => {
    try {
        const { user } = req;
        const { q } = req.query; // Lấy từ khóa tìm kiếm từ các tham số truy vấn

        // Tìm kiếm người dùng với username hoặc email chứa từ khóa
        const userResults = await Users.find({
            $or: [
                { username: { $regex: new RegExp(q, 'i') } }, // Tìm kiếm username không phân biệt hoa thường
                { email: { $regex: new RegExp(q, 'i') } } // Tìm kiếm email không phân biệt hoa thường
            ]
        }).select('_id username email image');

        // Tìm kiếm bài viết với caption hoặc description chứa từ khóa
        const postResults = await Post.find({
            $or: [
                { caption: { $regex: new RegExp(q, 'i') } }, // Tìm kiếm caption không phân biệt hoa thường
                { description: { $regex: new RegExp(q, 'i') } } // Tìm kiếm description không phân biệt hoa thường
            ]
        }).populate('user', '_id username email image');

        // Trả về kết quả cho client
        res.status(200).json({ users: userResults, posts: postResults });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

    
app.post('/api/comments/:postId', authenticate, async (req, res) => {
    try {
        const postId = req.params.postId; // Truy xuất postId từ req.params thay vì từ req.body
        const { text } = req.body;
        const { user } = req;

        // Kiểm tra xem bài viết tồn tại không
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Tạo một bình luận mới
        const newComment = new Comment({
            text,
            user: user._id,
            post: postId
        });

        // Lưu bình luận vào cơ sở dữ liệu
        await newComment.save();

        // Thêm ID của bình luận vào bài viết
        post.comments.push(newComment._id);
        await post.save();
        // Trả về phản hồi cho client
        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(port, () => {
    console.log('server is running');
})
