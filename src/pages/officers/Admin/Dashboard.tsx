import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../context/AuthContext';
import { adminService } from '../../../services/admin.service';
import { applicationService } from '../../../services/application.service';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  AlertCircle, 
  UserPlus,
  Search,
  Filter,
  Mail,
  Eye,
  MoreHorizontal,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { enumMappings } from '../../../utils/enumMappings';

interface DashboardStats {
  totalApplications: number;
  activeOfficers: number;
  pendingApprovals: number;
  completedApplications: number;
}

interface Officer {
  id: string;
  email: string;
  role: string;
  name?: string;
  isActive: boolean;
  lastLogin?: string;
  createdDate: string;
}

interface Application {
  id: string;
  applicationNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  positionType: number;
  submissionDate: string;
  status: number;
  currentStage: number;
}

type TabType = 'overview' | 'officers' | 'applications';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    activeOfficers: 0,
    pendingApprovals: 0,
    completedApplications: 0,
  });
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Roles list from the provided data
  const roles = [
    { id: "f1198913-abb3-430b-ba07-4cccbe79d0d9", name: "Admin", normalizedName: "ADMIN" },
    { id: "c2a146fd-3595-45d9-acad-548d79fcbfc5", name: "User", normalizedName: "USER" },
    { id: "2298198b-95fd-4284-91ff-b63161f5fa76", name: "JuniorArchitect", normalizedName: "JUNIORARCHITECT" },
    { id: "4068f790-4302-46ec-906c-f8114d2ddb8a", name: "AssistantArchitect", normalizedName: "ASSISTANTARCHITECT" },
    { id: "eca06d3f-6938-41d3-92c9-5836a79a44ce", name: "JuniorLicenceEngineer", normalizedName: "JUNIORLICENCEENGINEER" },
    { id: "1b6ff706-08db-463a-8fab-f6e41df71061", name: "AssistantLicenceEngineer", normalizedName: "ASSISTANTLICENCEENGINEER" },
    { id: "c4d9a0d8-b747-49d7-bb6b-b8ec72fa2915", name: "JuniorStructuralEngineer", normalizedName: "JUNIORSTRUCTURALENGINEER" },
    { id: "de1ef152-b7ed-41b8-934e-788da040e9bf", name: "AssistantStructuralEngineer", normalizedName: "ASSISTANTSTRUCTURALENGINEER" },
    { id: "5660f301-3be4-4380-ba95-92ce6273c91d", name: "JuniorSupervisor1", normalizedName: "JUNIORSUPERVISOR1" },
    { id: "3553a81e-a5fe-4cf1-b79f-554e7d3ec6f0", name: "AssistantSupervisor1", normalizedName: "ASSISTANTSUPERVISOR1" },
    { id: "06d9fcde-590a-45ef-8786-e2b82c2147d5", name: "JuniorSupervisor2", normalizedName: "JUNIORSUPERVISOR2" },
    { id: "4f08e88f-f62a-458a-bd88-c1966931486c", name: "AssistantSupervisor2", normalizedName: "ASSISTANTSUPERVISOR2" },
    { id: "6e0c76c1-dfdf-401e-bd2d-e345802c004f", name: "ExecutiveEngineer", normalizedName: "EXECUTIVEENGINEER" },
    { id: "fa4394c3-ecb6-4343-960d-67f0eeda4354", name: "CityEngineer", normalizedName: "CITYENGINEER" },
    { id: "df53f98f-b2d8-4e7b-9288-ba23fdae2e37", name: "Clerk", normalizedName: "CLERK" }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'officers') {
      fetchOfficers();
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Use mock data as fallback
      setStats({
        totalApplications: 1247,
        activeOfficers: 23,
        pendingApprovals: 45,
        completedApplications: 1089,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true);
      const data = await adminService.getOfficers();
      setOfficers(data);
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch officers list",
        variant: "destructive",
      });
    } finally {
      setLoadingOfficers(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const response = await applicationService.fetchOfficerApplications(statusFilter, 1, 50);
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleInviteOfficer = async () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setInviteLoading(true);
      await adminService.inviteOfficer(inviteEmail, inviteRole);
      toast({
        title: "Success",
        description: "Officer invitation sent successfully",
      });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('');
      fetchOfficers();
    } catch (error) {
      console.error('Error inviting officer:', error);
      toast({
        title: "Error",
        description: "Failed to send officer invitation",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : value.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusBadge = (status: number) => {
    const statusText = enumMappings.getStatusText(status);
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Completed': 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[statusText] || 'bg-gray-100 text-gray-800'}>
        {statusText}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      'Admin': 'bg-purple-100 text-purple-800',
      'ExecutiveEngineer': 'bg-blue-100 text-blue-800',
      'CityEngineer': 'bg-green-100 text-green-800',
      'JuniorArchitect': 'bg-orange-100 text-orange-800',
      'AssistantArchitect': 'bg-yellow-100 text-yellow-800',
      'Clerk': 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(app => {
    const searchMatch = searchTerm === '' || 
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === undefined || app.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome, {user?.email}. System administration and oversight.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'officers', name: 'Officers', icon: Users },
                { id: 'applications', name: 'Applications', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Applications"
                value={stats.totalApplications}
                icon={FileText}
                color="bg-blue-500"
              />
              <StatCard
                title="Active Officers"
                value={stats.activeOfficers}
                icon={Users}
                color="bg-green-500"
              />
              <StatCard
                title="Pending Approvals"
                value={stats.pendingApprovals}
                icon={AlertCircle}
                color="bg-yellow-500"
              />
              <StatCard
                title="Completed Applications"
                value={stats.completedApplications}
                icon={BarChart3}
                color="bg-purple-500"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    System Administration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('officers')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Officers
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Officer
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Role Permissions
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Reports & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('applications')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View All Applications
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Performance Analytics
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Officer Performance
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New application submitted', user: 'John Doe', time: '2 hours ago', status: 'info' },
                    { action: 'Certificate issued', user: 'Jane Smith', time: '4 hours ago', status: 'success' },
                    { action: 'Application rejected', user: 'Bob Johnson', time: '6 hours ago', status: 'warning' },
                    { action: 'Officer login', user: 'Admin User', time: '8 hours ago', status: 'info' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <Badge
                          className={
                            activity.status === 'success' ? 'bg-green-100 text-green-800' :
                            activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {activity.status}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">by {activity.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Officers Tab */}
        {activeTab === 'officers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Officers Management</h2>
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Officer
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Officers List</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOfficers ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading officers...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Officer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {officers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              No officers found. Click "Invite Officer" to add officers.
                            </td>
                          </tr>
                        ) : (
                          officers.map((officer) => (
                            <tr key={officer.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {officer.name || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500">{officer.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getRoleBadge(officer.role)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={officer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {officer.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {officer.lastLogin ? new Date(officer.lastLogin).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Applications</h2>
              <Button onClick={fetchApplications} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select
                      value={statusFilter?.toString() || ''}
                      onChange={(e) => setStatusFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <option value="">All Status</option>
                      <option value="0">Draft</option>
                      <option value="1">Submitted</option>
                      <option value="2">In Review</option>
                      <option value="3">Approved</option>
                      <option value="4">Rejected</option>
                      <option value="5">Completed</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            <Card>
              <CardHeader>
                <CardTitle>Applications ({filteredApplications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading applications...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Application
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applicant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApplications.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              No applications found.
                            </td>
                          </tr>
                        ) : (
                          filteredApplications.map((application) => (
                            <tr key={application.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {application.applicationNumber}
                                </div>
                                <div className="text-sm text-gray-500">ID: {application.id.slice(0, 8)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {`${application.firstName} ${application.middleName || ''} ${application.lastName}`}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="bg-blue-100 text-blue-800">
                                  {enumMappings.getPositionTypeText(application.positionType)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(application.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(application.submissionDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invite Officer Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Invite Officer</CardTitle>
                <p className="text-sm text-gray-600">
                  Send an invitation to a new officer to join the system.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="officer@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="">Select a role</option>
                    {roles
                      .filter(role => role.name !== 'User') // Exclude User role
                      .map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))
                    }
                  </Select>
                </div>
              </CardContent>
              <div className="flex justify-end space-x-2 p-6 pt-0">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteRole('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleInviteOfficer} disabled={inviteLoading}>
                  {inviteLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export { AdminDashboard };
export default AdminDashboard;