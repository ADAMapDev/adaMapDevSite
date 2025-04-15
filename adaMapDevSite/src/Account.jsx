import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faCalendarAlt, faIdBadge } from '@fortawesome/free-solid-svg-icons';
import profilePic from "./assets/baking_hamster_icon.png";


function Account() {
  const userInfo = {
    name: "Emily Zhu",
    email: "ezhu1@students.kennesaw.edu",
    username: "ezhu1",
    joined: "April 13, 2025",
    profileImage: profilePic,
  };


  return (
    <div className="account-wrapper">
      <div className="account-card horizontal-layout">
        <img
          src={userInfo.profileImage}
          alt="Profile"
          className="profile-pic-square"
        />
        <div className="user-details">
          <h2>Welcome, {userInfo.name} 👋</h2>
          <div className="account-detail">
            <FontAwesomeIcon icon={faIdBadge} />
            <span><strong>NetID:</strong> {userInfo.username}</span>
          </div>
          <div className="account-detail">
            <FontAwesomeIcon icon={faEnvelope} />
            <span><strong>Email:</strong> {userInfo.email}</span>
          </div>
          <div className="account-detail">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span><strong>Joined:</strong> {userInfo.joined}</span>
          </div>
          <button className="back-home" onClick={() => window.location.href = "/"}>
            ← Back to Map
          </button>
        </div>
      </div>
    </div>
  );
}

export default Account;

