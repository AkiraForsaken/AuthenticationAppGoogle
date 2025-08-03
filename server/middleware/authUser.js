import jwt from 'jsonwebtoken'

const authUser = async (req, res, next)=>{
    const {token} = req.cookies;

    if (!token){
        // return res.json({success: false, message: 'Not Authorized'})
        return res.json({success: false});
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        if(tokenDecode.userId){
            req.userId = tokenDecode.userId; // req.body is undefined for GET requests
            // the JWT payload uses userId as the property name (in authController.js)
        } else {
            console.log('middleware error')
            return res.json({success: false, message: 'No Token id'})
        }
        next()
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}

export default authUser