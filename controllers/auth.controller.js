const User = require("../models/user")
const { generateToken, verifyToken } = require("../middleware/auth.middleware")
const { UnauthorizedError, ValidationError, NotFoundError } = require("../utils/errors")

const authController = {
  register: async (req, res, next) => {
    try {
      const { name, email, password, rol = "user" } = req.body

      if (!name || !email || !password) {
        throw new ValidationError("Name, email and password are required")
      }

      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        throw new ValidationError("Email already exists")
      }

      const user = await User.create({ name, email, password, rol })
      const { accessToken, refreshToken } = generateToken({
        userId: user.id,
        email: user.email,
        rol: user.rol,
      })

      res.status(201).json({
        user: user.toJSON(),
        accessToken,
        refreshToken,
      })
    } catch (error) {
      next(error)
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        throw new ValidationError("Email and password are required")
      }

      const user = await User.findOne({ where: { email } })
      if (!user) {
        throw new UnauthorizedError("Invalid credentials")
      }

      const isValid = await user.comparePassword(password)
      if (!isValid) {
        throw new UnauthorizedError("Invalid credentials")
      }

      const { accessToken, refreshToken } = generateToken({
        userId: user.id,
        email: user.email,
        rol: user.rol,
      })

      res.json({
        user: user.toJSON(),
        accessToken,
        refreshToken,
      })
    } catch (error) {
      next(error)
    }
  },

  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        throw new ValidationError("Refresh token is required")
      }

      const payload = verifyToken(refreshToken)
      const { accessToken, refreshToken: newRefreshToken } = generateToken({
        userId: payload.userId,
        email: payload.email,
        rol: payload.rol,
      })

      res.json({ accessToken, refreshToken: newRefreshToken })
    } catch (error) {
      next(new UnauthorizedError("Invalid refresh token"))
    }
  },

  me: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.userId)
      if (!user) {
        throw new NotFoundError("User not found")
      }
      res.json(user.toJSON())
    } catch (error) {
      next(error)
    }
  },
}

module.exports = authController