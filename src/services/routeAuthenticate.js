import userpool from '../userpool';
import React from 'react';
import Login from '../components/Login';
import { Route, Navigate } from 'react-router-dom';

export const navigateIfAuthenticated = async (route) => {
  try {
    const user = await userpool.getCurrentUser();

    if (user) {
      // If the user is authenticated, navigate to the specified route
      return route
    } else {
      // If the user is not authenticated, redirect to the login page
      return "/login";
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
};


export const AuthenticatedRoute = ({ path, element: Element }) => {
  const authenticatedPath = navigateIfAuthenticated(path);

  return (
    <Route
      path={authenticatedPath}
      element={userpool.getCurrentUser()? <Element /> : <Login />}
    />
  );
};
