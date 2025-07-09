import DatabaseConnection from "../lib/mongoose";
import { User } from "../models";

async function userExamples() {
  try {
    // Connect to database
    await DatabaseConnection.connect();

    // Create a new user
    const newUser = new User({
      email: "john.doe@example.com",
      password: "password123",
      name: "John Doe"
    });

    await newUser.save();
    console.log("User created:", newUser.toJSON());

    // Find user by email
    const foundUser = await User.findOne({ email: "john.doe@example.com" });
    if (foundUser) {
      console.log("Found user:", foundUser.toJSON());

      // Compare password
      const isMatch = await foundUser.comparePassword("password123");
      console.log("Password match:", isMatch);
    }

    // Find all users
    const allUsers = await User.find().sort({ createdAt: -1 });
    console.log("All users:", allUsers.length);

    // Update user
    await User.updateOne(
      { email: "john.doe@example.com" },
      { name: "John Updated" }
    );

    // Delete user
    await User.deleteOne({ email: "john.doe@example.com" });
    console.log("User deleted");

  } catch (error) {
    console.error("User example error:", error);
  } finally {
    await DatabaseConnection.disconnect();
  }
}

// Export for use in other files
export { userExamples }; 