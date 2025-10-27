import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Debug component to test officer login and role mapping
 */
export const AuthDebugComponent: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Auth Debug Info</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Authentication Status:</h3>
          <p className="text-sm">
            <span className="font-medium">Is Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">User Info:</h3>
          {user ? (
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID:</span> {user.id || 'N/A'}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Role:</span> {user.role}</p>
              <p><span className="font-medium">Name:</span> {user.name || 'N/A'}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No user logged in</p>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Token Info:</h3>
          {token ? (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Has Token:</span> Yes
              </p>
              <details>
                <summary className="cursor-pointer text-sm font-medium">Show Token (click to expand)</summary>
                <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded mt-2 overflow-auto max-h-32">
                  {token}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No token present</p>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Expected Officer Login Response:</h3>
          <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-auto">
{JSON.stringify({
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": null,
  "email": "jr-arch-rushi@yopmail.com",
  "role": "JuniorArchitect"
}, null, 2)}
          </pre>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Role Mappings:</h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">JuniorEngineer:</span> /officers/junior-engineer/dashboard</p>
            <p><span className="font-medium">JuniorArchitect:</span> /officers/junior-engineer/dashboard</p>
            <p><span className="font-medium">AssistantEngineer:</span> /officers/assistant-engineer/dashboard</p>
            <p><span className="font-medium">ChiefEngineer:</span> /officers/chief-engineer/dashboard</p>
            <p><span className="font-medium">ExecutiveEngineer:</span> /officers/chief-engineer/dashboard</p>
            <p><span className="font-medium">CityEngineer:</span> /officers/city-engineer/dashboard</p>
            <p><span className="font-medium">Clerk:</span> /officers/clerk/dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugComponent;