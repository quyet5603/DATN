import React, { createContext, useState, useEffect } from 'react'

export const LoginContext = createContext("");

export const Context = ({children}) => {

    const [loginData, setLoginData]= useState();

    // Load user data from localStorage on mount
    useEffect(() => {
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                setLoginData(user);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
            setLoginData(null);
        }
    }, []);

    return (
    <div>
        <LoginContext.Provider value={{loginData, setLoginData}}>
            {children}
        </LoginContext.Provider>
    </div>
  )
}
