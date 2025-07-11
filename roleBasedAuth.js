function restrictToRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not authenticated.",
      })
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden. Access denied." })
    }
    next()
  }
}

export default restrictToRoles
