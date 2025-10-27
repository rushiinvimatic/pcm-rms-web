import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { dashboardService } from '../../services/dashboard.service';
import { applicationService } from '../../services/application.service';
import { authService } from '../../services/auth.service';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  data?: any;
  error?: string;
}

export const OfficersFlowTest: React.FC = () => {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addResult = (result: ApiTestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testOfficerLogin = async () => {
    const result: ApiTestResult = {
      endpoint: 'Officer Login',
      status: 'pending'
    };
    addResult(result);

    try {
      // Test with mock officer credentials
      const response = await authService.officerLogin({
        email: 'officer@pmc.gov.in',
        password: 'test123'
      });
      
      result.status = 'success';
      result.data = { 
        token: response.token ? 'Token received' : 'No token',
        user: response.user
      };
      toast({
        title: 'Officer Login Test',
        description: 'Login successful',
      });
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message || 'Login failed';
      toast({
        title: 'Officer Login Test',
        description: 'Login failed - using mock token for testing',
        variant: 'destructive'
      });
      
      // Set a mock token for testing other endpoints
      localStorage.setItem('token', 'mock-officer-token-for-testing');
    }
    
    setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r));
  };

  const testApplicationsList = async () => {
    const result: ApiTestResult = {
      endpoint: 'Applications List API',
      status: 'pending'
    };
    addResult(result);

    try {
      // Test the actual API endpoint
      const response = await applicationService.fetchOfficerApplications(1, 1, 10);
      
      result.status = 'success';
      result.data = {
        success: response.success || false,
        count: response.data?.length || 0,
        totalCount: response.totalCount || 0,
        sample: response.data?.[0] || 'No applications'
      };
      
      toast({
        title: 'Applications List Test',
        description: `Found ${response.data?.length || 0} applications`,
      });
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message || 'API call failed';
      
      toast({
        title: 'Applications List Test',
        description: 'API call failed - check network and authentication',
        variant: 'destructive'
      });
    }
    
    setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r));
  };

  const testJuniorEngineerAPI = async () => {
    const result: ApiTestResult = {
      endpoint: 'Junior Engineer Dashboard API',
      status: 'pending'
    };
    addResult(result);

    try {
      const response = await dashboardService.getJEApplications(1, 10);
      
      result.status = 'success';
      result.data = {
        success: response.success || false,
        applications: response.applications?.length || 0,
        statusFilter: 'Status 1,2 (Submitted, Assigned to JE)'
      };
      
      toast({
        title: 'JE Dashboard Test',
        description: `Found ${response.applications?.length || 0} applications for JE`,
      });
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message || 'JE API call failed';
    }
    
    setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r));
  };

  const testAssistantEngineerAPI = async () => {
    const result: ApiTestResult = {
      endpoint: 'Assistant Engineer Dashboard API',
      status: 'pending'
    };
    addResult(result);

    try {
      const response = await dashboardService.getAEApplications(1, 10);
      
      result.status = 'success';
      result.data = {
        success: response.success || false,
        applications: response.applications?.length || 0,
        statusFilter: 'Status 3,4 (Documents Verified, Under AE Review)'
      };
      
      toast({
        title: 'AE Dashboard Test',
        description: `Found ${response.applications?.length || 0} applications for AE`,
      });
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message || 'AE API call failed';
    }
    
    setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r));
  };

  const testCityEngineerAPI = async () => {
    const result: ApiTestResult = {
      endpoint: 'City Engineer Dashboard API',
      status: 'pending'
    };
    addResult(result);

    try {
      const response = await dashboardService.getEEApplications(1, 10);
      
      result.status = 'success';
      result.data = {
        success: response.success || false,
        applications: response.applications?.length || 0,
        statusFilter: 'Status 5,7 (Forwarded to EE Stage 1&2)'
      };
      
      toast({
        title: 'EE Dashboard Test',
        description: `Found ${response.applications?.length || 0} applications for EE`,
      });
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message || 'EE API call failed';
    }
    
    setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r));
  };

  const testChiefEngineerAPI = async () => {
    const result: ApiTestResult = {
      endpoint: 'Chief Engineer Dashboard API',
      status: 'pending'
    };
    addResult(result);

    try {
      const response = await dashboardService.getCEApplications(1, 10);
      
      result.status = 'success';
      result.data = {
        success: response.success || false,
        applications: response.applications?.length || 0,
        statusFilter: 'Status 6,8 (Signed by EE Stage 1&2)'
      };
      
      toast({
        title: 'CE Dashboard Test',
        description: `Found ${response.applications?.length || 0} applications for CE`,
      });
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message || 'CE API call failed';
    }
    
    setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r));
  };

  const testClerkAPI = async () => {
    const result: ApiTestResult = {
      endpoint: 'Clerk Dashboard API',
      status: 'pending'
    };
    addResult(result);

    try {
      const response = await dashboardService.getClerkApplications(1, 10);
      
      result.status = 'success';
      result.data = {
        success: response.success || false,
        applications: response.applications?.length || 0,
        statusFilter: 'Status 9,10 (Payment Completed, Ready for Certificate)'
      };
      
      toast({
        title: 'Clerk Dashboard Test',
        description: `Found ${response.applications?.length || 0} applications for Clerk`,
      });
    } catch (error: any) {
      result.status = 'error';
      result.error = error.message || 'Clerk API call failed';
    }
    
    setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r));
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    
    try {
      await testOfficerLogin();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between calls
      
      await testApplicationsList();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testJuniorEngineerAPI();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testAssistantEngineerAPI();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testCityEngineerAPI();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testChiefEngineerAPI();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testClerkAPI();
      
      toast({
        title: 'API Testing Complete',
        description: 'All officer dashboard APIs have been tested',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':  
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Officers Flow API Integration Test</h1>
          <p className="text-gray-600">Test the API integration for all officer dashboards</p>
        </div>
        <div className="space-x-2">
          <Button onClick={clearResults} variant="outline" disabled={isLoading}>
            Clear Results
          </Button>
          <Button onClick={runAllTests} disabled={isLoading}>
            {isLoading ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">API Endpoints</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button onClick={testOfficerLogin} disabled={isLoading} variant="outline">
            Test Officer Login
          </Button>
          <Button onClick={testApplicationsList} disabled={isLoading} variant="outline">
            Test Applications List
          </Button>
          <Button onClick={testJuniorEngineerAPI} disabled={isLoading} variant="outline">
            Test JE Dashboard  
          </Button>
          <Button onClick={testAssistantEngineerAPI} disabled={isLoading} variant="outline">
            Test AE Dashboard
          </Button>
          <Button onClick={testCityEngineerAPI} disabled={isLoading} variant="outline">
            Test EE Dashboard
          </Button>
          <Button onClick={testChiefEngineerAPI} disabled={isLoading} variant="outline">
            Test CE Dashboard
          </Button>
          <Button onClick={testClerkAPI} disabled={isLoading} variant="outline">
            Test Clerk Dashboard
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Test Results</h2>
        
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{result.endpoint}</h3>
                  {getStatusBadge(result.status)}
                </div>
                
                {result.data && (
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {result.error && (
                  <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Integration Status</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">✅</Badge>
            <span>Application Service Enhanced - Officer methods added</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">✅</Badge>
            <span>Dashboard Service Updated - Status-based filtering</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">✅</Badge>
            <span>Authentication Context - Officer roles supported</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-yellow-100 text-yellow-800">🔄</Badge>
            <span>Dashboard UIs - Basic structure created</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">📝</Badge>
            <span>API Documentation - Implementation guide created</span>
          </div>
        </div>
      </Card>
    </div>
  );
};