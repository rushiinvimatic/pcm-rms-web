import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const AuthDebugTest: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const simulateLogin = () => {
    // Simulate the exact response you're getting from the API
    const mockResponse = {
      "success": true,
      "message": "Login successful",
      "token": "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjFhN2ViOTY4LWIzMDUtNDcyYi1hYmQ2LWI2ZmFhZTc1MGU0YiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6Ikp1bmlvclN0cnVjdHVyYWxFbmdpbmVlciIsImV4cCI6MTc2MDUxNzc5MSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMjEvIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NDQzMjEvIn0.VzFxt5hVV-k__8y6_Z7IJ9z2VfA0GJiDT07wL93obg4",
      "refreshToken": null,
      "email": "jr-struct-rushi@yopmail.com",
      "role": "JuniorStructuralEngineer"
    };

    console.log('Simulating login with:', mockResponse);
    
    try {
      login(mockResponse.token, { 
        email: mockResponse.email, 
        role: mockResponse.role 
      });
      
      setDebugInfo({
        loginCalled: true,
        apiResponse: mockResponse,
        expectedRoute: '/officers/junior-structural-engineer/dashboard',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Login simulation error:', error);
      setDebugInfo({
        error: error,
        apiResponse: mockResponse,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Auth Debug Test</CardTitle>
          <CardDescription>
            Test the authentication flow with your actual API response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Current Auth State:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify({ 
                isAuthenticated, 
                user,
                userRole: user?.role,
                userEmail: user?.email 
              }, null, 2)}
            </pre>
          </div>
          
          <Button onClick={simulateLogin} className="w-full">
            Simulate JuniorStructuralEngineer Login
          </Button>
          
          {debugInfo && (
            <div>
              <h3 className="font-medium mb-2">Debug Info:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Expected Flow:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>API returns role: "JuniorStructuralEngineer"</li>
              <li>Role gets mapped to: "juniorstructuralengineer" (lowercase)</li>
              <li>Should redirect to: /officers/junior-structural-engineer/dashboard</li>
              <li>ProtectedRoute should allow access with role: ["juniorstructuralengineer"]</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebugTest;