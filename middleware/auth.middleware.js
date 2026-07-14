const jwt = require("jsonwebtoken")
const { UnauthorizedError } = require("../utils/errors")

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      throw new UnauthorizedError("No token provided")
    }

    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (error) {
    next(new UnauthorizedError("Invalid token"))
  }
}

const generateToken = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" })
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
  return { accessToken, refreshToken }
}

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = {
  authenticate,
  generateToken,
  verifyToken,
  JWT_SECRET,
}