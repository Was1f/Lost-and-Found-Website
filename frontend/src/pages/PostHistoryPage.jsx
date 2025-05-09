import React, { useState, useEffect } from "react";
import axios from "axios";

// Add these keyframe animations at the top of the component
const fadeIn = {
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  }
};

const pulse = {
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.02)' },
    '100%': { transform: 'scale(1)' }
  }
};

const slideIn = {
  '@keyframes slideIn': {
    '0%': { transform: 'translateX(-20px)', opacity: 0 },
    '100%': { transform: 'translateX(0)', opacity: 1 }
  }
};

const PostHistoryPage = () => {
  const [postHistory, setPostHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [checkedPosts, setCheckedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // "all", "update", "delete"

  // Get admin token from localStorage
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Configure axios with admin token
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${getAdminToken()}`
    }
  });

  useEffect(() => {
    // Fetch post history from the backend
    setIsLoading(true);
    api.get("/posthistory/all")
      .then(response => {
        setPostHistory(response.data);
        setFilteredHistory(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching post history:", error);
        setIsLoading(false);
      });
  }, []);

  const handleSearch = () => {
    filterHistory(searchQuery, filterType);
  };

  const filterHistory = (query, type) => {
    let filtered = postHistory.filter(post =>
      post.title?.toLowerCase().includes(query.toLowerCase()) ||
      post.description?.toLowerCase().includes(query.toLowerCase()) ||
      post.status?.toLowerCase().includes(query.toLowerCase()) ||
      post.changeType?.toLowerCase().includes(query.toLowerCase()) ||
      post.updatedBy?.username?.toLowerCase().includes(query.toLowerCase())
    );

    // Apply type filter
    if (type !== "all") {
      filtered = filtered.filter(post => post.changeType === type);
    }

    setFilteredHistory(filtered);
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleCheckPost = (e, postId) => {
    e.stopPropagation(); // Prevent selecting post when checking
    setCheckedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleDeletePosts = () => {
    if (selectedPosts.length === 0) {
      alert("Please select posts to delete.");
      return;
    }

    api.delete("/posthistory/delete", { data: { postIds: selectedPosts } })
      .then(response => {
        // Remove deleted posts from the UI
        setPostHistory(postHistory.filter(post => !selectedPosts.includes(post._id)));
        setFilteredHistory(filteredHistory.filter(post => !selectedPosts.includes(post._id)));
        setSelectedPosts([]); // Reset selected posts
        
        // Also remove from checked posts if any were checked
        setCheckedPosts(checkedPosts.filter(id => !selectedPosts.includes(id)));
        
        alert("Selected posts deleted successfully");
      })
      .catch(error => {
        console.error("Error deleting posts:", error);
        alert("Failed to delete posts.");
      });
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    filterHistory(searchQuery, type);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <div style={{ 
      padding: "40px", 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
      color: "#2D3748",
      backgroundColor: "#F7FAFC",
      minHeight: "100vh",
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "35px", 
        color: "#1A365D",
        fontSize: "36px",
        fontWeight: "700",
        letterSpacing: "-0.5px",
        animation: 'slideIn 0.6s ease-out'
      }}>Post History</h2>

      {/* Search and Filter Section */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "15px", 
        alignItems: "center", 
        marginBottom: "30px",
        backgroundColor: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        animation: 'fadeIn 0.7s ease-out',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ 
          flex: "1",
          minWidth: "300px",
          position: "relative"
        }}>
          <input 
            type="text" 
            placeholder="Search Post History" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              filterHistory(e.target.value, filterType);
            }}
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: "8px",
              border: "1px solid #E2E8F0",
              boxSizing: "border-box",
              fontSize: "16px",
              transition: "all 0.2s ease",
              outline: "none",
              backgroundColor: "#F8FAFC"
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "12px", 
          flexWrap: "wrap"
        }}>
          {['all', 'update', 'delete'].map((type, index) => (
            <button 
              key={type}
              onClick={() => handleFilterChange(type)}
              style={{
                padding: "12px 24px",
                backgroundColor: filterType === type ? 
                  (type === 'all' ? "#2B6CB0" : 
                   type === 'update' ? "#38A169" : "#E53E3E") : 
                  "#EDF2F7",
                color: filterType === type ? "white" : "#4A5568",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                transition: "all 0.3s ease",
                boxShadow: filterType === type ? 
                  `0 2px 4px rgba(${type === 'all' ? '43, 108, 176' : 
                                   type === 'update' ? '56, 161, 105' : 
                                   '229, 62, 62'}, 0.2)` : "none",
                transform: filterType === type ? "scale(1.05)" : "scale(1)",
                animation: `slideIn 0.${5 + index}s ease-out`
              }}
            >
              {type === 'all' ? 'All Posts' : type === 'update' ? 'Updates' : 'Deletions'}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Button */}
      {selectedPosts.length > 0 && (
        <div style={{ 
          marginBottom: "25px", 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
          padding: "15px 25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}>
          <span style={{ 
            color: "#4A5568", 
            fontWeight: "600",
            fontSize: "16px"
          }}>
            {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
          </span>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#E53E3E",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 2px 4px rgba(229, 62, 62, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.2s ease"
            }}
            onClick={handleDeletePosts}
          >
            <span style={{ fontSize: "20px" }}>🗑️</span>
            Delete Selected Posts
          </button>
        </div>
      )}

      {/* Post History Cards */}
      {isLoading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px", 
          color: "#4A5568",
          fontSize: "18px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          animation: 'fadeIn 0.5s ease-out'
        }}>
          Loading post history...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px", 
          color: "#4A5568",
          fontSize: "18px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          animation: 'fadeIn 0.5s ease-out'
        }}>
          No posts found matching your criteria
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredHistory.map((post, index) => (
            <div 
              key={post._id} 
              style={{
                border: "1px solid #E2E8F0", 
                padding: "25px", 
                borderRadius: "12px", 
                backgroundColor: selectedPosts.includes(post._id) ? "#EBF8FF" : "white",
                cursor: "pointer",
                position: "relative",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s ease",
                animation: `fadeIn 0.${5 + index * 0.1}s ease-out`,
                transform: selectedPosts.includes(post._id) ? "scale(1.02)" : "scale(1)",
                '&:hover': {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)"
                }
              }}
              onClick={() => handleSelectPost(post._id)}
            >
              {/* Top Section - Title and Status */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "20px",
                paddingRight: "180px"
              }}>
                <div style={{ flex: 1, maxWidth: "calc(100% - 220px)" }}>
                  <h3 style={{ 
                    color: "#2D3748", 
                    margin: "0 0 12px 0",
                    fontSize: "22px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                    wordBreak: "break-word"
                  }}>
                    {post.title}
                  </h3>
                  <p style={{ 
                    margin: "0 0 12px 0",
                    color: "#4A5568",
                    fontSize: "16px",
                    lineHeight: "1.6",
                    wordBreak: "break-word"
                  }}>
                    {post.description}
                  </p>
                </div>
                
                <div style={{ 
                  marginLeft: "25px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-end",
                  gap: "12px",
                  minWidth: "140px",
                  marginRight: "20px"
                }}>
                  <span style={{ 
                    padding: "8px 16px",
                    backgroundColor: post.status === "found" ? "#C6F6D5" : "#FEFCBF",
                    color: post.status === "found" ? "#2F855A" : "#975A16",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.3s ease",
                    animation: `pulse 2s infinite`
                  }}>
                    {post.status === "found" ? "Found" : "Lost"}
                  </span>
                  
                  <span style={{ 
                    padding: "8px 16px",
                    backgroundColor: post.changeType === "update" ? "#C6F6D5" : "#FED7D7",
                    color: post.changeType === "update" ? "#2F855A" : "#C53030",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    whiteSpace: "nowrap",
                    justifyContent: "flex-end",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                  }}>
                    {post.changeType === "update" ? "✏️ Update" : "❌ Deletion"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ 
                height: "1px", 
                backgroundColor: "#E2E8F0", 
                margin: "20px 0" 
              }}></div>

              {/* Details Section */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "20px"
              }}>
                {/* Left Column */}
                <div style={{ flex: "1", minWidth: "300px" }}>
                  <p style={{ 
                    margin: "0 0 12px 0",
                    color: "#4A5568",
                    fontSize: "15px"
                  }}>
                    <strong style={{ 
                      color: "#2D3748", 
                      fontWeight: "600" 
                    }}>Location:</strong> {post.location}
                  </p>
                  
                  {/* Updated By - Highlighted */}
                  <div style={{ 
                    backgroundColor: "#F7FAFC", 
                    padding: "15px", 
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                    border: "1px solid #E2E8F0"
                  }}>
                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%", 
                      backgroundColor: "#2B6CB0",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "18px"
                    }}>
                      {post.updatedBy?.username ? post.updatedBy.username.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p style={{ 
                        margin: "0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2D3748"
                      }}>
                        {post.updatedBy?.username || "Unknown"}
                      </p>
                      <p style={{ 
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#718096"
                      }}>
                        Changed By User
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div style={{ flex: "1", minWidth: "300px" }}>
                  <p style={{ 
                    margin: "0 0 8px 0",
                    color: "#4A5568",
                    fontSize: "15px"
                  }}>
                    <strong style={{ 
                      color: "#2D3748", 
                      fontWeight: "600" 
                    }}>Change Date:</strong> {formatDate(post.changeDate)}
                  </p>
                  
                  {/* Post ID for reference */}
                  <p style={{ 
                    margin: "8px 0 0 0",
                    color: "#A0AEC0",
                    fontSize: "13px"
                  }}>
                    Post ID: {post._id}
                  </p>
                </div>
              </div>

              {/* Checkbox with animation */}
              <div style={{ 
                position: "absolute", 
                top: "25px", 
                right: "25px", 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                zIndex: 1,
                border: "1px solid #E2E8F0",
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)"
                }
              }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  margin: 0
                }}>
                  <input 
                    type="checkbox" 
                    checked={checkedPosts.includes(post._id)}
                    onChange={(e) => handleCheckPost(e, post._id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      width: "18px", 
                      height: "18px", 
                      cursor: "pointer",
                      marginRight: "10px"
                    }}
                  />
                  <span style={{ 
                    fontSize: "14px", 
                    color: "#4A5568",
                    lineHeight: 1,
                    fontWeight: "500"
                  }}>
                    Mark as checked
                  </span>
                </label>
              </div>

              {/* Delete Icon with animation */}
              {selectedPosts.includes(post._id) && (
                <div style={{ 
                  position: "absolute", 
                  bottom: "25px", 
                  right: "25px", 
                  color: "#E53E3E", 
                  backgroundColor: "rgba(229, 62, 62, 0.1)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "1px solid rgba(229, 62, 62, 0.2)",
                  animation: "fadeIn 0.3s ease-out",
                  transition: "all 0.3s ease"
                }}>
                  <span>Selected for deletion</span>
                  <span 
                    style={{ 
                      marginLeft: "5px",
                      fontSize: "18px", 
                      cursor: "pointer",
                      color: "#C53030"
                    }}
                    onClick={(e) => { 
                      e.stopPropagation();
                      handleSelectPost(post._id);
                    }}
                  >
                    ✕
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add style tag for keyframes */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          @keyframes slideIn {
            0% { transform: translateX(-20px); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default PostHistoryPage;