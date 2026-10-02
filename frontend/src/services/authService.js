import apiFetch from "./api";

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

/*
  Login existing user
*/
export const loginUser = async (credentials) => {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};