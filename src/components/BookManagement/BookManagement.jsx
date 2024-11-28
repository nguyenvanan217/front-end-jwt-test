import React, { useEffect, useState } from "react";

const BookManagementTable = () => {
  // Dữ liệu mẫu
  const [books, setBooks] = useState([]);
  useEffect(()=> {

  }, [])

 

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản Lý Sách</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="border border-gray-300 px-4 py-2">ID Sách</th>
            <th className="border border-gray-300 px-4 py-2">Tên Sách</th>
            <th className="border border-gray-300 px-4 py-2">Thể Loại</th>
            <th className="border border-gray-300 px-4 py-2">Tác Giả</th>
            <th className="border border-gray-300 px-4 py-2">Số Lượng</th>
            <th className="border border-gray-300 px-4 py-2">Ảnh Bìa</th>
            <th className="border border-gray-300 px-4 py-2">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{book.id}</td>
              <td className="border border-gray-300 px-4 py-2">{book.title}</td>
              <td className="border border-gray-300 px-4 py-2">{book.genre}</td>
              <td className="border border-gray-300 px-4 py-2">{book.author}</td>
              <td className="border border-gray-300 px-4 py-2">{book.quantity}</td>
              <td className="border border-gray-300 px-4 py-2">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="w-12 h-12 object-cover mx-auto"
                  />
                ) : (
                  "Không có ảnh"
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                >
                  Chỉnh Sửa
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookManagementTable;
