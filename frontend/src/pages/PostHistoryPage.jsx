import React, { useState, useEffect } from "react";
import axios from "axios";

const PostHistoryPage = () => {
  const [postHistory, setPostHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [checkedPosts, setCheckedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // "all", "update", "delete"

  useEffect(() => {
    // Fetch post history from the backend
    setIsLoading(true);
    axios.get("http://localhost:5000/api/posthistory/all")
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

    // Call the backend to delete selected posts
    axios.delete("http://localhost:5000/api/posthistory/delete", { data: { postIds: selectedPosts } })
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
      padding: "30px", 
      maxWidth: "1000px", 
      margin: "0 auto",
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      color: "#333",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      boxShadow: "0 0 20px rgba(0,0,0,0.05)"
    }}>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "25px", 
        color: "#1a3e72",
        fontSize: "32px",
        fontWeight: "600",
        letterSpacing: "0.5px"
      }}>Post History</h2>

      {/* Search and Filter Section */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "10px", 
        alignItems: "center", 
        marginBottom: "25px",
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
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
            flex: "1",
            minWidth: "200px",
            padding: "12px 15px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
            fontSize: "16px",
            transition: "border 0.3s ease",
            outline: "none"
          }}
        />
        <button 
          onClick={handleSearch}
          style={{
            padding: "12px 20px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "16px",
            transition: "background 0.3s ease",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}
        >
          Search
        </button>

        {/* Filter Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          marginLeft: "auto"
        }}>
          <button 
            onClick={() => handleFilterChange("all")}
            style={{
              padding: "8px 15px",
              backgroundColor: filterType === "all" ? "#1a3e72" : "#e0e0e0",
              color: filterType === "all" ? "white" : "#333",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px"
            }}
          >
            All
          </button>
          <button 
            onClick={() => handleFilterChange("update")}
            style={{
              padding: "8px 15px",
              backgroundColor: filterType === "update" ? "#4CAF50" : "#e0e0e0",
              color: filterType === "update" ? "white" : "#333",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px"
            }}
          >
            Updates
          </button>
          <button 
            onClick={() => handleFilterChange("delete")}
            style={{
              padding: "8px 15px",
              backgroundColor: filterType === "delete" ? "#F44336" : "#e0e0e0",
              color: filterType === "delete" ? "white" : "#333",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px"
            }}
          >
            Deletions
          </button>
        </div>
      </div>

      {/* Delete Button */}
      {selectedPosts.length > 0 && (
        <div style={{ 
          marginBottom: "20px", 
          textAlign: "right",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ color: "#666", fontWeight: "500" }}>
            {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
          </span>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#F44336",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "500",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
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
          padding: "40px", 
          color: "#666",
          fontSize: "18px" 
        }}>
          Loading post history...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          color: "#666",
          fontSize: "18px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
        }}>
          No posts found matching your criteria
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredHistory.map(post => (
            <div 
              key={post._id} 
              style={{
                border: "1px solid #e0e0e0", 
                padding: "20px", 
                borderRadius: "10px", 
                backgroundColor: selectedPosts.includes(post._id) ? "#f0f7ff" : "white",
                cursor: "pointer",
                position: "relative",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
                transition: "all 0.2s ease"
              }}
              onClick={() => handleSelectPost(post._id)}
            >
              {/* Top Section - Title and Status */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "15px"
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    color: "#1a3e72", 
                    margin: "0 0 10px 0",
                    fontSize: "20px",
                    fontWeight: "600"
                  }}>
                    {post.title}
                  </h3>
                  <p style={{ 
                    margin: "0 0 10px 0",
                    color: "#555",
                    fontSize: "15px",
                    lineHeight: "1.5"
                  }}>
                    {post.description}
                  </p>
                </div>
                
                <div style={{ 
                  marginLeft: "20px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-end",
                  gap: "10px"
                }}>
                  {/* Status Badge */}
                  <span style={{ 
                    padding: "5px 12px",
                    backgroundColor: post.status === "Resolved" ? "#DCEDC8" : "#FFF9C4",
                    color: post.status === "Resolved" ? "#33691E" : "#F57F17",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    {post.status}
                  </span>
                  
                  {/* Change Type Badge */}
                  <span style={{ 
                    padding: "5px 12px",
                    backgroundColor: post.changeType === "update" ? "#E8F5E9" : "#FFEBEE",
                    color: post.changeType === "update" ? "#2E7D32" : "#C62828",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    {post.changeType === "update" ? "✏️ Update" : "❌ Deletion"}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ 
                height: "1px", 
                backgroundColor: "#e0e0e0", 
                margin: "15px 0" 
              }}></div>

              {/* Details Section */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "15px"
              }}>
                {/* Left Column */}
                <div style={{ flex: "1", minWidth: "250px" }}>
                  <p style={{ 
                    margin: "0 0 10px 0",
                    color: "#666",
                    fontSize: "14px"
                  }}>
                    <strong style={{ 
                      color: "#1a3e72", 
                      fontWeight: "600" 
                    }}>Location:</strong> {post.location}
                  </p>
                  
                  {/* Updated By - Highlighted */}
                  <div style={{ 
                    backgroundColor: "#f5f5f5", 
                    padding: "10px 15px", 
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px"
                  }}>
                    <div style={{ 
                      width: "30px", 
                      height: "30px", 
                      borderRadius: "50%", 
                      backgroundColor: "#1a3e72",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "16px"
                    }}>
                      {post.updatedBy?.username ? post.updatedBy.username.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <p style={{ 
                        margin: "0",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#333"
                      }}>
                        {post.updatedBy?.username || "Unknown"}
                      </p>
                      <p style={{ 
                        margin: "0",
                        fontSize: "12px",
                        color: "#666"
                      }}>
                        Changed By User
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div style={{ flex: "1", minWidth: "250px" }}>
                  <p style={{ 
                    margin: "0 0 5px 0",
                    color: "#666",
                    fontSize: "14px"
                  }}>
                    <strong style={{ 
                      color: "#1a3e72", 
                      fontWeight: "600" 
                    }}>Change Date:</strong> {formatDate(post.changeDate)}
                  </p>
                  
                  {/* Post ID for reference */}
                  <p style={{ 
                    margin: "5px 0 0 0",
                    color: "#999",
                    fontSize: "12px"
                  }}>
                    Post ID: {post._id}
                  </p>
                </div>
              </div>

              {/* Checkbox for marking as checked */}
              <div style={{ 
                position: "absolute", 
                top: "20px", 
                right: "20px", 
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none"
                }}>
                  <input 
                    type="checkbox" 
                    checked={checkedPosts.includes(post._id)}
                    onChange={(e) => handleCheckPost(e, post._id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      width: "18px", 
                      height: "18px", 
                      cursor: "pointer" 
                    }}
                  />
                  <span style={{ 
                    marginLeft: "5px", 
                    fontSize: "14px", 
                    color: "#666" 
                  }}>
                    Mark as checked
                  </span>
                </label>
              </div>

              {/* Delete Icon (displayed only if selected) */}
              {selectedPosts.includes(post._id) && (
                <div style={{ 
                  position: "absolute", 
                  bottom: "20px", 
                  right: "20px", 
                  color: "#F44336", 
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                  borderRadius: "20px",
                  padding: "5px 12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}>
                  <span>Selected for deletion</span>
                  <span 
                    style={{ 
                      marginLeft: "5px",
                      fontSize: "20px", 
                      cursor: "pointer" 
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
    </div>
  );
};

export default PostHistoryPage;