import { createContext, useState } from 'react';

const AuthContext = createContext({
    auth: {
        isAuthenticated: false,
        user: {
            email: '',
            name: '',
            groupWidthRoles: null,
        },
    },
    setAuth: () => {},
});

export const AuthWrapper = ({ children }) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: {
            email: '',
            name: '',
            groupWidthRoles: null,
        },
    });

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
