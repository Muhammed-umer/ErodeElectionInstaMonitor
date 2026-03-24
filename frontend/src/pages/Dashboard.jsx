import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:5000/api/posts/search?q=${encodeURIComponent(query)}`
        : 'http://localhost:5000/api/posts';
      const response = await axios.get(url);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(searchQuery.split(' ').join(','));
  };

  const filteredPosts = posts.filter(post => {
    if (sentimentFilter !== 'All' && post.sentiment !== sentimentFilter) return false;

    if (dateFilter !== 'All') {
      const diffTime = Math.abs(new Date() - new Date(post.timestamp));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (dateFilter === 'Today' && diffDays > 1) return false;
      if (dateFilter === 'Last2Days' && diffDays > 2) return false;
    }
    return true;
  });

  const negativeAlerts = filteredPosts.filter(p => p.sentiment === 'Negative');

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Search keywords (e.g. erode election collection)..."
            className="flex-1 border p-2 rounded focus:ring-blue-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 outline-none text-white px-4 py-2 rounded hover:bg-blue-700">
            Search
          </button>
        </form>

        <div className="flex gap-4">
          <select
            className="border p-2 rounded"
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
          >
            <option value="All">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          <select
            className="border p-2 rounded"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Last2Days">Last 2 Days</option>
          </select>
        </div>
      </div>

      {negativeAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <h3 className="text-red-800 font-bold">Alert: High Risk Content Detected</h3>
          <p className="text-red-700 mt-1">{negativeAlerts.length} posts require immediate review.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map(post => (
                    <tr key={post._id || Math.random()}>
                      <td className="px-6 py-4 font-medium text-sm">@{post.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{post.caption}</td>
                      <td className="px-6 py-4 text-sm">{post.mediaType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${post.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                            post.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {post.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No posts matched the criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
