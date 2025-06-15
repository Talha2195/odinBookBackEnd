const authMiddleware = async (req, res, next) => {
  try {
    if (!req.session) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Please log in." })
    }

    if (!req.session.user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Please log in." })
    }

    const sessionUser = req.session.user

    if (!sessionUser.id || !sessionUser.username || !sessionUser.role) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Invalid user data." })
    }
    req.user = sessionUser
    return next()
  } catch (error) {
    console.error("Error processing user session:", error)
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." })
  }
}

export default authMiddleware
