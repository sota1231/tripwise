import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const users = [
    {
      id: "user_001",
      name: "ユーザー1",
      displayName: "sota",
      password: "10",
      isVerified: true
    },
    {
      id: "user_002",
      name: "ユーザー2",
      displayName: "marina",
      password: "2",
      isVerified: false
    }
  ];

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setPassword("");
    setError("");
  };

  const handleLogin = () => {
    if (!selectedUser) {
      setError("ユーザーを選択してください");
      return;
    }
    if (password.trim() === "") {
      setError("パスワードを入力してください");
      return;
    }
    onLogin(selectedUser, password);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setPassword("");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">TripWise</h1>
        <p className="login-subtitle">
          {selectedUser ? `${selectedUser.displayName}としてログイン` : "ユーザーを選択してください"}
        </p>

        {!selectedUser ? (
          <div className="user-selection">
            {users.map((user) => (
              <div
                key={user.id}
                className="user-card"
                onClick={() => handleUserSelect(user)}
              >
                <div className="user-avatar">
                  {user.displayName.charAt(0)}
                </div>
                <div className="user-info">
                  <h3>{user.displayName}</h3>
                  <p>{user.email}</p>
                  <span className={`verification-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                    {user.isVerified ? '✓ 認証済み' : '未認証'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="login-form">
            <div className="selected-user-info">
              <div className="user-avatar-small">
                {selectedUser.displayName.charAt(0)}
              </div>
              <span>{selectedUser.displayName}</span>
            </div>

            <input
              type="password"
              className="login-input"
              placeholder="パスワード"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              autoFocus
            />

            {error && <p className="login-error">{error}</p>}

            <button
              className="login-button"
              onClick={handleLogin}
            >
              ログイン
            </button>

            <button
              className="back-button"
              onClick={handleBack}
            >
              ← 戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
