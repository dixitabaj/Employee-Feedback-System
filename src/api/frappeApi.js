// frappeApi.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE; // Frappe site URL
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN; // API token

// Axios instance with default headers
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "Authorization": AUTH_TOKEN,
  },
});


// Get logged-in employee info
export const getLoggedInEmployee = async () => {
  try {
    const res = await api.get(
      "/method/project.project.doctype.employee.employee.get_logged_in_employee"
    );
    return res.data.message;
  } catch (error) {
    console.error("Error fetching logged-in employee:", error.response?.data || error);
    return null;
  }
};

// Get employee by ID
export const getEmployeeById = async (employeeId) => {
  try {
    const res = await api.get(`/resource/Employee/${employeeId}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching employee by ID:", error.response?.data || error);
    return null;
  }
};

// Get all departments
export const getDepartments = async () => {
  try {
    const res = await api.get("/resource/Department", {
      params: { fields: JSON.stringify(["name", "department_name"]) },
    });
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching departments:", error.response?.data || error);
    return [];
  }
};

// Get all feedbacks (up to 1000)
export const getFeedbacks = () => {
  return api.get("/api/resource/Employee%20Feedback%20and%20Suggestions", {
    params: {
      fields: JSON.stringify(["*"]),
      limit_page_length: 1000
    }
  });
};

// Get feedbacks by employee (non-anonymous)
export const getFeedbacksByEmployeeId = async (employeeId) => {
  try {
    const res = await api.get("/resource/Employee Feedback and Suggestions", {
      params: {
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify([
          ["employee_id", "=", employeeId],
          ["anonymous_submission", "=", 0],
        ]),
      },
    });
    return res.data.data || [];
  } catch (error) {
    console.error("Error fetching employee feedbacks:", error.response?.data || error);
    return [];
  }
};

// Create new feedback
export const createFeedback = async (payload) => {
  try {
    const res = await api.post("/resource/Employee Feedback and Suggestions", payload);
    return res.data;
  } catch (error) {
    console.error("Error creating feedback:", error.response?.data || error);
    throw error;
  }
};

// Update feedback by name
export const updateFeedback = async (name, payload) => {
  try {
    const res = await api.put(`/resource/Employee Feedback and Suggestions/${name}`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating feedback:", error.response?.data || error);
    throw error;
  }
};

// Delete feedback by name
export const deleteFeedback = async (name) => {
  try {
    const res = await api.delete(`/resource/Employee Feedback and Suggestions/${name}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting feedback:", error.response?.data || error);
    throw error;
  }
};

export default api;
