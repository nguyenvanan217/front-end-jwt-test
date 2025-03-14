import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from '../Pages/Login/Login';
import Register from '../Pages/Register/Register';
import BookManagement from '../Pages/BookManagement/BookManagement';
import UserManagement from '../Pages/UserManagement/UserManagement';
import BookList from '../Pages/BookList/BookList';
import BookBorrowingHistory from '../Pages/BookBorrowingHistory/BookBorrowingHistory';
import BookLoanReturnDetails from '../Pages/BookLoanReturnDetails/BookLoanReturnDetails';
import PrivateRoutes from './PrivateRoutes';
import RolesManagerment from '../Pages/Roles/RolesManagerment';
import AccountInformation from '../Pages/AccountInformation/AccountInformation';
import Messenger from '../Pages/Messenger/Messenger';

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<PrivateRoutes />}>
                <Route path="/usermanagerment" element={<UserManagement />} />
                <Route path="/bookmanagerment" element={<BookManagement />} />
                <Route path="/booklist" element={<BookList />} />
                <Route path="/bookborrowinghistory" element={<BookBorrowingHistory />} />
                <Route path="/bookloanreturndetails/:id" element={<BookLoanReturnDetails />} />
                <Route path="/rolemanagerment" element={<RolesManagerment />} />
                <Route path="/accountinformation" element={<AccountInformation />} />
                <Route path="/messenger" element={<Messenger />} />
            </Route>

            {/* 404 route */}
            <Route
                path="*"
                element={
                    <div style={{ textAlign: 'center', marginTop: '50px' }}>
                        <h1 className="text-red-600 text-2xl font-bold">404 - Page Not Found</h1>
                        <p className="text-red-600">The page you are looking for does not exist.</p>
                        <a href="/" className="text-blue-600 underline">
                            Go back to Home
                        </a>
                    </div>
                }
            />
        </Routes>
    );
}

export default AppRoutes;
