const BASE_URL = "http://127.0.0.1:8000/api";
// django server address \

import { jwtDecode } from "jwt-decode";


async function registerUser(username, email, password) {

    // fetch - sends https request to url(does task of postman) returns promise(unitll it runs across django for response) and awaits poses function until promise fulfilled
    // res stores response
    const res = await fetch(`${BASE_URL}/accounts/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

    // reading response
    const data = await res.json();


    // res.ok is a built in boolean decide whether response is ok(200 - success) or not(400 - validation error
    //  401-unauthorized, 403 - forbidden, 404 - not found, 500 - internal server error) if false 
    // throw data - stops function and returns something went wrong (handled in try/catch block during form)
    if (!res.ok) {
        throw data;
    }

    return data;
}

async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  // store the access and refresh tokens in local storage for making sure user is logged in and can access protected routes
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
}

async function getProfile() {
  const token = localStorage.getItem("access");

  const res = await fetch(`${BASE_URL}/accounts/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

async function updateProfile(formData) {
  let token = localStorage.getItem("access");

  let res = await fetch(`${BASE_URL}/accounts/me/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await fetch(`${BASE_URL}/accounts/me/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  }

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await res.json();
  if (!res.ok) throw data;

  localStorage.setItem("access", data.access);
  return data.access;
}

function decodeToken(token){
  //task :takes the raw token string, decodes its middle (payload) section from Base64 into a real JS object 
  try {
    return jwtDecode(token);
  } catch (error) {
    console.log("Invalid token:", error);
    return null;
  }
}


async function getUserStats() {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/stats/user/`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function getAdminStats() {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/stats/admin/`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function getMyPayouts() {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/payouts/`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function requestPayout(amount) {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/payouts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function adminGetAllPayouts() {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/admin/payouts/`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function adminUpdatePayout(payoutId, statusValue) {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/admin/payouts/${payoutId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: statusValue }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function fileReport(payload) {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/reports/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function adminGetAllReports() {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/admin/reports/`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

async function adminUpdateReport(reportId, statusValue) {
  const token = localStorage.getItem("access");
  const res = await fetch(`${BASE_URL}/resources/admin/reports/${reportId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: statusValue }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export {
  registerUser, loginUser, getProfile, updateProfile, decodeToken,
  getUserStats, getAdminStats,
  getMyPayouts, requestPayout, adminGetAllPayouts, adminUpdatePayout,
  fileReport, adminGetAllReports, adminUpdateReport
};