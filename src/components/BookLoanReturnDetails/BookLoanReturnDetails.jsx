import React from 'react';

function BookLoanReturnDetails() {
  // Dữ liệu mẫu cho chi tiết mượn trả
  const userDetails = {
    userId: '12345',
    email: 'user@example.com',
    username: 'Nguyễn Văn A',
    bookTitle: 'Lập Trình Web React',
    borrowDate: '2024-11-01',
    returnDate: '2024-11-15',
    status: 'Chờ trả',
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center text-blue-500 mb-4">Chi Tiết Mượn Trả</h2>
      
      <div className="flex justify-between gap-6">
        {/* Thông tin người dùng */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-blue-600 mb-2">Thông tin người dùng:</h3>
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Thông tin</th>
                <th className="px-4 py-2 text-left">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 font-medium">ID người dùng:</td>
                <td className="px-4 py-2">{userDetails.userId}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Email:</td>
                <td className="px-4 py-2">{userDetails.email}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Tên sinh viên:</td>
                <td className="px-4 py-2">{userDetails.username}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Thông tin sách mượn */}
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-green-600 mb-2">Thông tin sách mượn:</h3>
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-green-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Thông tin</th>
                <th className="px-4 py-2 text-left">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 font-medium">Tên sách:</td>
                <td className="px-4 py-2">{userDetails.bookTitle}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Ngày mượn:</td>
                <td className="px-4 py-2">{userDetails.borrowDate}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Ngày trả:</td>
                <td className="px-4 py-2">{userDetails.returnDate}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-medium">Trạng thái:</td>
                <td className="px-4 py-2">{userDetails.status}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg">Chỉnh sửa</button>
        <button className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg">Xóa</button>
      </div>
    </div>
  );
}

export default BookLoanReturnDetails;
