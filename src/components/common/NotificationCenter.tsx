import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { 
  Bell, 
  X, 
  Check, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  CreditCard,
  Award,
  AlertCircle,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  applicationNumber?: string;
  relatedUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNotificationClick
}) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action-required'>('all');

  // Mock notifications - replace with actual API call
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Application Approved',
        message: 'Your application PMC_APPLICATION_2025_87 has been approved by the Assistant Engineer.',
        timestamp: '2025-01-15T10:30:00Z',
        read: false,
        applicationNumber: 'PMC_APPLICATION_2025_87',
        relatedUrl: '/user/application/PMC_APPLICATION_2025_87'
      },
      {
        id: '2',
        type: 'info',
        title: 'Appointment Scheduled',
        message: 'Your document verification appointment has been scheduled for January 18, 2025 at 10:00 AM.',
        timestamp: '2025-01-15T09:15:00Z',
        read: false,
        actionRequired: true,
        applicationNumber: 'PMC_APPLICATION_2025_87'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Payment Required',
        message: 'Your application is ready for payment. Please complete the payment to proceed.',
        timestamp: '2025-01-14T16:45:00Z',
        read: true,
        actionRequired: true,
        applicationNumber: 'PMC_APPLICATION_2025_87',
        relatedUrl: '/payment/PMC_APPLICATION_2025_87'
      },
      {
        id: '4',
        type: 'error',
        title: 'Document Rejected',
        message: 'Some documents in your application have been rejected. Please review and resubmit.',
        timestamp: '2025-01-13T14:20:00Z',
        read: true,
        actionRequired: true,
        applicationNumber: 'PMC_APPLICATION_2025_87'
      },
      {
        id: '5',
        type: 'success',
        title: 'Certificate Ready',
        message: 'Your certificate is ready for download. You can now access your documents.',
        timestamp: '2025-01-10T11:00:00Z',
        read: true,
        applicationNumber: 'PMC_APPLICATION_2025_87',
        relatedUrl: '/guest/certificates'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'info':
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: Notification['type'], read: boolean) => {
    const baseClass = read ? 'bg-white' : 'bg-blue-50';
    const borderClass = read ? 'border-gray-200' : 'border-blue-200';
    
    switch (type) {
      case 'success':
        return `${baseClass} ${borderClass} ${!read ? 'border-l-4 border-l-green-500' : ''}`;
      case 'warning':
        return `${baseClass} ${borderClass} ${!read ? 'border-l-4 border-l-yellow-500' : ''}`;
      case 'error':
        return `${baseClass} ${borderClass} ${!read ? 'border-l-4 border-l-red-500' : ''}`;
      case 'info':
      default:
        return `${baseClass} ${borderClass} ${!read ? 'border-l-4 border-l-blue-500' : ''}`;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification center has been updated.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    onNotificationClick(notification);
    if (notification.relatedUrl) {
      // Handle navigation to related URL
      console.log('Navigate to:', notification.relatedUrl);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'action-required':
        return notification.actionRequired;
      case 'all':
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <Badge className="bg-red-100 text-red-800">{unreadCount} unread</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1"
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="flex-1"
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'action-required' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('action-required')}
              className="flex-1"
            >
              Action Required ({actionRequiredCount})
            </Button>
          </div>

          {/* Action Buttons */}
          {unreadCount > 0 && (
            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all as read
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'action-required'
                  ? "No actions required at this time."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationBg(notification.type, notification.read)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {notification.actionRequired && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              Action Required
                            </Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                            {new Date(notification.timestamp).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {notification.applicationNumber && (
                            <span>#{notification.applicationNumber}</span>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Stay updated with email and SMS notifications
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};