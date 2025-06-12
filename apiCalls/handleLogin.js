async function handleLogin(username, password) {
  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: "include",
    })
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json()
      if (data.success) {
        return { success: true, user: data.user }
      } else {
        return { success: false, message: data.message || "Login failed" }
      }
    } else {
      const text = await response.text()
      return { success: false, message: text || "Unexpected response format" }
    }
  } catch (error) {
    console.error("Error:", error)
    return { success: false, message: "An error occurred. Please try again." }
  }
}

export { handleLogin }
