const jwt = require('jsonwebtoken');
const Users = require('../models/userSchema');

const authenticate = async (req, res, next) => {
    try {
        const { authorization = '' } = req.headers;
        const [bearer, token] = authorization.split(' ');

        if (!authorization || !token || bearer !== 'Bearer') {
            return res.status(401).send('Invalid Token');
        }

        const verifyToken = jwt.verify(token, 'THIS_IS_THE_SECRET_KEY_OF_JWT');
        const user = await Users.findById(verifyToken.id); // Thay đổi từ findOne sang findById

        if (!user) {
            return res.status(401).send('User not found');
        }

        // Gán user vào req để có thể sử dụng ở middleware khác
        req.user = user;

        // Kiểm tra xem user có quyền sửa username và email hay không
        if (user._id.toString() !== verifyToken.id.toString()) {
            return res.status(403).send('Unauthorized'); // Nếu không phải là chính user đó thì trả về lỗi 403
        }

        // Tiếp tục chạy middleware tiếp theo nếu không có vấn đề gì
        next();
    } catch (error) {
        console.error('Error in authentication:', error);
        res.status(500).send(error.message);
    }
};

module.exports = authenticate;
