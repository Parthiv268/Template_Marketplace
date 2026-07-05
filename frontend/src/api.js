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
  // getting token from local storage for authoriztion in header to ensure user logged in and can access route
  const token = localStorage.getItem("access");

  // method patch to partially update profile data(put would require all fields to be sent)
  // body formdata which allows sending files(jpeg) and other data
  const res = await fetch(`${BASE_URL}/accounts/me/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
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

export {registerUser, loginUser, getProfile, updateProfile,decodeToken};