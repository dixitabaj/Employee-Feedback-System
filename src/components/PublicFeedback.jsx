import { useState, useEffect } from 'react';
import { getFeedbacks } from "../api/frappeApi";

const PublicFeedback = () => {
  // State
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [actionTakenOnly, setActionTakenOnly] = useState(false); // show only feedbacks with action

  // Fetch public feedbacks on mount
  useEffect(() => {
    const fetchPublicFeedback = async () => {
      try {
        const response = await getFeedbacks();
        console.log("All feedbacks:", response.data.data);

        // Keep only public feedbacks
        const publicFeedbacks = response.data.data.filter(fb => fb.make_public === 1);
        setFeedbacks(publicFeedbacks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching public feedback:', error);
        setLoading(false);
      }
    };

    fetchPublicFeedback();
  }, []);

  // Apply filters
  const filteredFeedbacks = feedbacks.filter(fb => {
    const categoryMatch = categoryFilter === 'all' || fb.category === categoryFilter;
    const urgencyMatch = urgencyFilter === 'all' || fb.urgency === urgencyFilter;
    const actionTakenMatch = !actionTakenOnly || fb.action_taken__notes;
    return categoryMatch && urgencyMatch && actionTakenMatch;
  });

  // Unique filter options
  const categories = [...new Set(feedbacks.map(fb => fb.category))];
  const urgencies = [...new Set(feedbacks.map(fb => fb.urgency))];

  // Loading state
  if (loading) return <div className="loading">Loading public feedback...</div>;

  return (
    <div className="employee-form">
      <h2>Public Feedbacks</h2>

      {/* Filters */}
      <div className="filter-section" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Category */}
        <div>
          <label>Filter by Category:</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label>Filter by Urgency:</label>
          <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
            <option value="all">All Levels</option>
            {urgencies.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Action Taken */}
        <div className="checkbox-label-my-feedback" style={{ alignItems: 'center' }}>
          <input
            type="checkbox"
            id="actionTaken"
            checked={actionTakenOnly}
            onChange={(e) => setActionTakenOnly(e.target.checked)}
          />
          <span className='action-taken-label'>Action Taken</span>
        </div>
      </div>

      {/* Feedback count */}
      <span className="feedback-count">
        {filteredFeedbacks.length} public feedback(s) found
      </span>

      <div className='my-feedback-section'>
        {/* Feedback list */}
        {filteredFeedbacks.length === 0 ? (
          <div className="empty-state">
            <h3>No Public Feedback Available</h3>
          </div>
        ) : (
          <div className="feedback-list">
            {filteredFeedbacks.map(feedback => (
              <div key={feedback.name} className="feedback-item public-feedback">
                {/* Header */}
                <div className="feedback-header">
                  <h3>{feedback.category}</h3>
                  <span className={`urgency-badge urgency-${feedback.urgency?.toLowerCase()}`}>
                    {feedback.urgency}
                  </span>
                </div>

                {/* Feedback content */}
                <p className="feedback-content">{feedback.feedback__suggestion}</p>

                {/* Meta info */}
                <div className="feedback-meta">
                  <span>Submitted on: {new Date(feedback.creation).toLocaleDateString()}</span>

                  {feedback.department && !feedback.anonymous_submission ? (
                    <span className="department">
                      {feedback.employee_name && (
                        <div className='employee-label'>
                          Employee: {feedback.employee_name} ({feedback.department})
                        </div>
                      )}
                      {feedback.designation_role && (
                        <div className='employee-label'>
                          Position: {feedback.designation_role}
                        </div>
                      )}
                    </span>
                  ) : (
                    <span className="anonymous-badge">Anonymous</span>
                  )}

                  {/* Action Taken Notes */}
                  {feedback.action_taken__notes && (
                    <div className="action-notes">
                      <strong>Action Taken:</strong> {feedback.action_taken__notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicFeedback;
