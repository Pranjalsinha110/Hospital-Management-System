import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";

/**
 * Safely parse user data from localStorage.
 */
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Failed to restore user session:", error);

    localStorage.removeItem(USER_KEY);

    return null;
  }
};

/**
 * Extract token from different possible backend response shapes.
 *
 * Supported examples:
 * response.token
 * response.data.token
 * response.accessToken
 * response.data.accessToken
 */
const extractToken = (response) => {
  return (
    response?.token ||
    response?.accessToken ||
    response?.data?.token ||
    response?.data?.accessToken ||
    null
  );
};

/**
 * Extract user from different possible backend response shapes.
 */
const extractUser = (response) => {
  return (
    response?.user ||
    response?.data?.user ||
    response?.data ||
    null
  );
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState(getStoredUser);

  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token);

  /**
   * LOGIN
   */
  const login = useCallback(async (credentials) => {
    setLoading(true);

    try {
      const response = await loginUser(credentials);

      const newToken = extractToken(response);
      const newUser = extractUser(response);

      if (!newToken) {
        throw new Error(
          "Login successful but authentication token was not received."
        );
      }

      localStorage.setItem(TOKEN_KEY, newToken);

      setToken(newToken);

      if (newUser) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(newUser)
        );

        setUser(newUser);
      }

      return {
        success: true,
        data: response,
        user: newUser,
        token: newToken,
      };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * REGISTER
   */
  const register = useCallback(async (userData) => {
    setLoading(true);

    try {
      const response = await registerUser(userData);

      /*
       * Registration may or may not return a token.
       *
       * If backend automatically logs the user in,
       * token will be stored.
       *
       * If backend only creates the account,
       * Auth.jsx can redirect/show login after success.
       */
      const newToken = extractToken(response);
      const newUser = extractUser(response);

      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
      }

      if (newUser) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(newUser)
        );

        setUser(newUser);
      }

      return {
        success: true,
        data: response,
        user: newUser,
        token: newToken,
      };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * LOGOUT
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  }, []);

  /**
   * Restore authentication state on application load.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = getStoredUser();

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  /**
   * Role helper
   */
  const hasRole = useCallback(
    (role) => {
      if (!user?.role) {
        return false;
      }

      return user.role === role;
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,

      login,
      register,
      logout,

      hasRole,
    }),
    [
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      hasRole,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
};

export default AuthContext;