import { createContext, useState } from 'react';

const AuthContext = createContext({
    auth: {
        isLoading: null,
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
        isLoading: true,
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
