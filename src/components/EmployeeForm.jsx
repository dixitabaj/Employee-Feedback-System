import { useState, useEffect } from "react";
import { createFeedback } from "../api/frappeApi";

// Frappe backend URL & API credentials
const FRAPPE_BACKEND_URL = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_SECRET = import.meta.env.VITE_API_SECRET;

export default function EmployeeForm({ user }) {
  // Employee & form states
  const [employee, setEmployee] = useState({
    employee_id: "",
    employee_name: "",
    department: "",
    position: "",
    employee_email: "",
  });
  const [employeeData, setEmployeeData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [makePublic, setMakePublic] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [urgency, setUrgency] = useState("");

  // Category & urgency options
  const categoryOptions = [
    "Work Environment",
    "Facilities",
    "IT / Technical Issues",
    "HR / Policies",
    "Training & Development",
    "Process Improvement",
    "Employee Recognition",
    "Health & Safety",
    "Other",
  ];
  const urgencyOptions = ["Low", "Medium", "High", "Critical"];

  // Fetch employee details by ID
  useEffect(() => {
    const fetchEmployee = async () => {
      const employeeId = user?.employee_id || user?.name;
      if (!employeeId) {
        console.log("No employee ID found in user data");
        fallbackUserData();
        return;
      }

      setLoadingEmployee(true);
      try {
        const url = `${FRAPPE_BACKEND_URL}/api/resource/Employee/${employeeId}?fields=["name", "employee_name", "department", "designation", "employee_email", "employee_id"]`;
        console.log("Fetching employee by ID:", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `token ${API_KEY}:${API_SECRET}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            const emp = data.data;
            const mappedEmployee = {
              employee_id: emp.employee_id || emp.name,
              employee_name: emp.employee_name,
              department: emp.department || "",
              position: emp.designation || emp.position || "",
              employee_email: emp.employee_email || "",
            };
            setEmployee(mappedEmployee);
            setEmployeeData(mappedEmployee);
          } else {
            fallbackUserData(); // fallback if no data
          }
        } else {
          fallbackUserData(); // fallback on error status
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        fallbackUserData();
      } finally {
        setLoadingEmployee(false);
      }
    };

    // Use user object as fallback if API fails
    const fallbackUserData = () => {
      const fallback = {
        employee_id: user?.employee_id || user?.name || "",
        employee_name: user?.employee_name || user?.full_name || "Employee",
        department: user?.department || "",
        position: user?.position || "",
        employee_email: user?.employee_email || user?.email || user?.name || "",
      };
      setEmployee(fallback);
      setEmployeeData(fallback);
    };

    fetchEmployee();
  }, [user]);

  // Fetch all departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const url = `${FRAPPE_BACKEND_URL}/api/resource/Department?fields=["name","department_name"]`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `token ${API_KEY}:${API_SECRET}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setDepartments(data.data || []);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Disable fields if employee data exists and not anonymous
  const shouldDisableField = (fieldValue) =>
    !!employeeData && !!fieldValue && !anonymous;

  // Handle anonymous toggle
  const handleAnonymousChange = (isAnonymous) => {
    setAnonymous(isAnonymous);
    if (isAnonymous) {
      setEmployee((prev) => ({
        ...prev,
        employee_name: "",
        department: "",
        position: "",
      }));
      setMakePublic(true);
    } else if (employeeData) {
      setEmployee(employeeData);
      setMakePublic(false);
    }
  };

  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!anonymous && !employee.employee_id) {
      alert("Employee ID missing.");
      return;
    }
    if (!category) {
      alert("Please choose a category.");
      return;
    }
    if (!urgency) {
      alert("Please choose urgency.");
      return;
    }

    const payload = {
      submission_date: new Date().toISOString().split("T")[0],
      anonymous_submission: anonymous ? 1 : 0,
      make_public: anonymous || makePublic ? 1 : 0,
      employee_id: anonymous ? null : employee.employee_id,
      employee_name: anonymous ? null : employee.employee_name,
      employee_email: anonymous ? null : employee.employee_email || "",
      department: anonymous ? null : employee.department,
      designation_role: anonymous ? null : employee.position,
      category: category,
      other: category === "Other" ? otherCategory : "",
      feedback__suggestion: feedback,
      urgency: urgency,
      action_taken__notes: "",
      amended_from: null,
    };

    try {
      const res = await createFeedback(payload);
      alert("Feedback submitted successfully!");
      setCategory("");
      setOtherCategory("");
      setFeedback("");
      setUrgency("");
      setMakePublic(false);
    } catch (err) {
      console.error("Error creating feedback:", err);
      if (err.response) console.error("Frappe API Response:", err.response.data);
    }
  };

  // --- UI ---
  return (
    <div>
      <form onSubmit={handleSubmit} className="employee-form">
        <h2>Employee Feedback Form</h2>

        {/* Logged-in user banner */}
        {user && (
          <div className="user-info-banner">
            <p>
              Logged in as: <strong>{employee.employee_name || "No name available"}</strong>
              {loadingEmployee && " (Refreshing details...)"}
            </p>
          </div>
        )}

        {/* Anonymous toggle */}
        <div className="submit-anonymously">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => handleAnonymousChange(e.target.checked)}
              />
              Submit Anonymously
            </label>
            <small>
              {anonymous
                ? "Your details will be hidden and not visible in 'My Feedback'."
                : "Your details will be attached to this feedback."}
            </small>
          </div>
        </div>

        {/* Employee details (hidden if anonymous) */}
        {!anonymous && (
          <div className="form-section">
            <h3>Employee Details</h3>
            <div className="employee-details">
              {/* Name & ID */}
              <div className="form-row">
                <div className="form-group">
                  <label>Employee Name</label>
                  <input
                    type="text"
                    value={employee.employee_name || ""}
                    onChange={(e) =>
                      setEmployee({ ...employee, employee_name: e.target.value })
                    }
                    required={!anonymous}
                    disabled={shouldDisableField(employee.employee_name)}
                  />
                </div>

                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={employee.employee_id || ""}
                    onChange={(e) =>
                      setEmployee({ ...employee, employee_id: e.target.value })
                    }
                    required={!anonymous}
                    disabled={shouldDisableField(employee.employee_id)}
                  />
                </div>
              </div>

              {/* Department & Position */}
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={employee.department || ""}
                    onChange={(e) =>
                      setEmployee({ ...employee, department: e.target.value })
                    }
                    required={!anonymous}
                    disabled={shouldDisableField(employee.department)}
                  >
                    <option value="">Select Department</option>
                    {loadingDepartments ? (
                      <option>Loading departments…</option>
                    ) : (
                      departments.map((dept) => (
                        <option key={dept.name} value={dept.name}>
                          {dept.department_name || dept.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={employee.position || ""}
                    onChange={(e) =>
                      setEmployee({ ...employee, position: e.target.value })
                    }
                    required={!anonymous}
                    disabled={shouldDisableField(employee.position)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback section */}
        <div className="form-section">
          <h3>Feedback Details</h3>
          <div className="feedback-details">
            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Urgency *</label>
                <select value={urgency} onChange={(e) => setUrgency(e.target.value)} required>
                  <option value="">Select Urgency</option>
                  {urgencyOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {category === "Other" && (
              <div className="form-group">
                <label>Please specify your category here *</label>
                <input
                  type="text"
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Feedback / Suggestion *</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={makePublic}
                  onChange={(e) => setMakePublic(e.target.checked)}
                  disabled={anonymous}
                />
                Make this feedback public
              </label>
              {anonymous && <small>(Anonymous feedbacks are always public)</small>}
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">Submit Feedback</button>
      </form>
    </div>
  );
}
