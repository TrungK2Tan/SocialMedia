import React, { useState, useEffect } from "react";
import Button from "../../components/Button";
import {  useNavigate } from 'react-router-dom'

const EditPassword = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    // Lấy userId từ localStorage khi component được tạo
    const userIdFromStorage = localStorage.getItem("userId");
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
    }
  }, []);

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Thực hiện kiểm tra mật khẩu và xác nhận mật khẩu
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Gửi yêu cầu cập nhật mật khẩu đến API
      const response = await fetch(`http://localhost:8000/api/editPassword/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({ newPassword: password }), // Sử dụng newPassword thay vì password
    });

    if (!response.ok) {
      throw new Error("Failed to update password");
    }
      alert("Password updated successfully!");
      navigate('/profile'); // Chuyển hướng đến trang profile
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Failed to update password. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="w-[800px] h-[600px] p-6 bg-white">
        <form onSubmit={handlePasswordUpdate}>
          <input
            type="password"
            placeholder="New Password..."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password..."
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <Button label="Save" className="bg-red-400 hover:bg-red-500" type="submit" disabled={isLoading} />
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default EditPassword;