/** @format */

import { useState, useContext, createContext, useEffect } from "react";
import PropTypes from "prop-types";

const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [uploadedImage, setUploadedImage] = useState(null);
  const [invisibleLayer, setInvisibleLayer] = useState(null);
  const [originalImageDimensions, setOriginalImageDimensions] = useState(null); 
  const [originalImageUrl, setOriginalImageUrl] = useState(null); 
  const [originalImageData, setOriginalImageData] = useState(null); 
  const [generatedImage, setGeneratedImage] = useState(null);

  // Add email state
  const [email, setEmail] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setLoggedIn(true);
    } else {
      localStorage.removeItem("token");
      setLoggedIn(false);
    }
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
        loggedIn,
        setLoggedIn,
        uploadedImage,
        setUploadedImage,
        invisibleLayer,
        setInvisibleLayer,
        originalImageDimensions,
        setOriginalImageDimensions,
        originalImageUrl,
        setOriginalImageUrl,
        originalImageData,
        setOriginalImageData,
        generatedImage, 
        setGeneratedImage, 
        email, 
        setEmail, 
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};