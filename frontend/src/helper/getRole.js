import { jwtDecode } from "jwt-decode";

export default function getRole(token) {
  try {
    if (!token) return null; // Handle case where token is not available
    const secret = import.meta.env.VITE_JWT_SECRET;

    const data = jwtDecode(token);
    return data.user.role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null; // Handle token verification errors
  }
}

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  return date.toLocaleString(); // Converts to local date and time string
};
