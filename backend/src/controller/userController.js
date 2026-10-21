import { User } from "../model/userModel.js";

export const userController = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({
      email,
      password,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login query failed:", error.name, error.code ?? "unknown");
    return res
      .status(503)
      .json({ message: "Login service is temporarily unavailable" });
  }
};
