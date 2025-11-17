import { useState, useEffect } from 'react';
import '../styles.css'; // CSS for styling

const MyFeedback = ({ user }) => {
  // State variables
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // category filter
  const [actionTakenOnly, setActionTakenOnly] = useState(false); // show only feedbacks with action

  // API credentials
  const API_BASE = import.meta.env.VITE_API_BASE;
  const apiKey = import.meta.env.VITE_API_KEY;
  const apiSecret = import.meta.env.VITE_API_SECRET;

  // Fetch feedbacks for the logged-in employee
  useEffect(() => {
    const fetchEmployeeFeedback = async () => {
      const employeeId = user?.name || user?.employee_id;
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch feedbacks for this employee
        const filters = JSON.stringify([["employee_id", "=", employeeId]]);
        const url = `${API_BASE}/api/resource/Employee%20Feedback%20and%20Suggestions?filters=${encodeURIComponent(filters)}&fields=${encodeURIComponent('["*"]')}`;

        const res = await fetch(url, {
          headers: {
            "Authorization": `token ${apiKey}:${apiSecret}`,
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        let employeeFeedbacks = data.data || [];

        // Fallback: fetch all feedbacks and filter manually if none found
        if (employeeFeedbacks.length === 0) {
          const allUrl = `${API_BASE}/api/resource/Employee%20Feedback%20and%20Suggestions?fields=${encodeURIComponent('["*"]')}`;
          const allRes = await fetch(allUrl, {
            headers: {
              "Authorization": `token ${apiKey}:${apiSecret}`,
              "Content-Type": "application/json"
            }
          });

          const allData = await allRes.json();
          employeeFeedbacks = allData.data?.filter(fb =>
            fb.employee_id === employeeId ||
            fb.submitted_by === employeeId ||
            fb.name === employeeId
          ) || [];
        }

        setFeedbacks(employeeFeedbacks);

      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.name || user?.employee_id) fetchEmployeeFeedback();
    else setLoading(false);

  }, [user]);

  // Apply filters for category and action taken
  const filteredFeedbacks = feedbacks.filter(fb => {
    const categoryMatch = filter === 'all' || fb.category === filter;
    const actionTakenMatch = !actionTakenOnly || fb.action_taken__notes;
    return categoryMatch && actionTakenMatch;
  });

  // Extract unique categories for filter dropdown
  const categories = [...new Set(feedbacks.map(fb => fb.category).filter(Boolean))];
  const employeeId = user?.name || user?.employee_id;

  // Loading state
  if (loading) return <div className="loading">Loading feedback...</div>;

  // No feedback found
  if (filteredFeedbacks.length === 0) {
    return (
      <div className="employee-form">
        <h2>My Feedback</h2>
        <p>No feedback found for employee ID: <strong>{employeeId}</strong></p>
      </div>
    );
  }

  // Render feedback list
  return (
    <div className="employee-form">
      <h2>My Feedback</h2>

      {/* Filter section */}
      <div className="filter-section">
        <div className="category-filter">
          <label>Filter by Category:</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <label className="checkbox-label-my-feedback" style={{ marginLeft: '390px' }}>
          <input
            type="checkbox"
            checked={actionTakenOnly}
            onChange={e => setActionTakenOnly(e.target.checked)}
          />
          <span className='action-taken-label'>Action Taken</span>
        </label>
      </div>

      <span className="feedback-count">{filteredFeedbacks.length} feedback(s) found</span>

      {/* Feedback list */}
      <div className='my-feedback-section'>
        <div className="feedback-list">
          {filteredFeedbacks.map(fb => {
            const creationDate = fb.creation || fb.submission_date || fb.modified || '';
            const formattedDate = creationDate ? new Date(creationDate).toLocaleDateString() : 'Date not available';

            return (
              <div key={fb.name} className="feedback-item">
                <div className="feedback-header">
                  <h3>{fb.category || 'Uncategorized'}</h3>
                  <span className={`urgency-badge urgency-${(fb.urgency || 'medium').toLowerCase()}`}>
                    {fb.urgency || 'Not Specified'}
                  </span>
                </div>
                <p>{fb.feedback__suggestion || fb.feedback_suggestion || fb.feedback || 'No feedback content'}</p>
                <div className="feedback-meta">
                  <span>Submitted on: {formattedDate}</span>
                  {fb.anonymous_submission ? (
                    <span className="anonymous-tag">Submitted Anonymously</span>
                  ) : fb.department ? (
                    <span>Department: {fb.department}</span>
                  ) : null}
                  {fb.make_public && <span className="public-badge">Public</span>}
                  {fb.action_taken__notes && (
                    <div className="action-notes">
                      <strong>Action Taken:</strong> {fb.action_taken__notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyFeedback;
