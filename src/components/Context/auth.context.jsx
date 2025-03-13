import { createContext, useState } from 'react';

const AuthContext = createContext({
    auth: {
        isLoading: null,
        isAuthenticated: false,
        user: {
            id: '',
            email: '',
            name: '',
            groupWithRoles: null,
        },
    },
    setAuth: () => {},
});

export const AuthWrapper = ({ children }) => {
    const [auth, setAuth] = useState({
        isLoading: true,
        isAuthenticated: false,
        user: {
            id: '',
            email: '',
            name: '',
            groupWithRoles: null,
        },
    });

    return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
