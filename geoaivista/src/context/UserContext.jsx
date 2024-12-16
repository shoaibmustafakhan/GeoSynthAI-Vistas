// // /** @format */

//  import { useState, useContext, createContext, useEffect } from "react";
// import PropTypes from "prop-types";

// const UserContext = createContext();

// export function useUser() {
//   return useContext(UserContext);
// }

// export function UserProvider({ children }) {
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [invisibleLayer, setInvisibleLayer] = useState(null);
//   const [originalImageDimensions, setOriginalImageDimensions] = useState(null); // Store original image dimensions
//   const [originalImageUrl, setOriginalImageUrl] = useState(null); // Store original image URL for downloading
//   const [originalImageData, setOriginalImageData] = useState(null); // Store original image data (Blob or File)
//   const [generatedImage, setGeneratedImage] = useState(null);


//   const [email, setEmail] = useState(null);

//   useEffect(() => {
//     if (token) {
//       localStorage.setItem("token", token);
//       setLoggedIn(true);
//     } else {
//       localStorage.removeItem("token");
//       setLoggedIn(false);
//     }
//   }, [token]);

//   return (
//     <UserContext.Provider
//       value={{
//         token,
//         email,
//         setEmail,
//         setToken,
//         loggedIn,
//         setLoggedIn,
//         uploadedImage,
//         setUploadedImage,
//         invisibleLayer,
//         setInvisibleLayer,
//         originalImageDimensions,
//         setOriginalImageDimensions,
//         originalImageUrl,
//         setOriginalImageUrl,
//         originalImageData,
//         setOriginalImageData,
//         generatedImage, // Added generatedImage to context
//         setGeneratedImage, // Added setGeneratedImage to context
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// }

// UserProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };
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
  const [originalImageDimensions, setOriginalImageDimensions] = useState(null); // Store original image dimensions
  const [originalImageUrl, setOriginalImageUrl] = useState(null); // Store original image URL for downloading
  const [originalImageData, setOriginalImageData] = useState(null); // Store original image data (Blob or File)

  // Add generatedImage state to store the generated image
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
        generatedImage, // Added generatedImage to context
        setGeneratedImage, // Added setGeneratedImage to context
        email, // Added email to context
        setEmail, // Added setEmail to context
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};