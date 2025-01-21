import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from '../components/Login/Login';
import Register from '../components/Register/Register';
import BookManagement from '../components/BookManagement/BookManagement';
import UserManagement from '../components/UserManagement/UserManagement';
import BookList from '../components/BookList/BookList';
import BookBorrowingHistory from '../components/BookBorrowingHistory/BookBorrowingHistory';
import BookLoanReturnDetails from '../components/BookLoanReturnDetails/BookLoanReturnDetails';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/usermanagerment" element={<UserManagement />} />
            <Route path="/bookmanagerment" element={<BookManagement />} />
            <Route path="/booklist" element={<BookList />} />
            <Route path="/bookborrowinghistory" element={<BookBorrowingHistory />} />
            <Route path="/bookloanreturndetails/:id" element={<BookLoanReturnDetails />} />
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
