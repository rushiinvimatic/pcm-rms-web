import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle,
  Search,
  Send
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'application' | 'documents' | 'fees' | 'process' | 'technical';
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdDate: string;
  lastReply: string;
}

const faqCategories = {
  application: { label: 'Application Process', color: 'bg-blue-100 text-blue-800' },
  documents: { label: 'Documents', color: 'bg-green-100 text-green-800' },
  fees: { label: 'Fees & Payments', color: 'bg-purple-100 text-purple-800' },
  process: { label: 'Approval Process', color: 'bg-orange-100 text-orange-800' },
  technical: { label: 'Technical Issues', color: 'bg-red-100 text-red-800' }
};

const statusConfig = {
  open: { color: 'bg-blue-100 text-blue-800', label: 'Open', icon: MessageCircle },
  in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Clock },
  resolved: { color: 'bg-green-100 text-green-800', label: 'Resolved', icon: CheckCircle },
  closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed', icon: CheckCircle }
};

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  high: { color: 'bg-red-100 text-red-800', label: 'High' }
};

export const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  // Mock data - replace with actual API calls
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How long does it take to process a building permit application?',
      answer: 'The processing time varies depending on the type and complexity of the project. Generally, residential projects take 15-30 days, while commercial projects may take 30-60 days.',
      category: 'process'
    },
    {
      id: '2',
      question: 'What documents are required for a building permit application?',
      answer: 'Required documents include: Property documents, Building plans, Structural drawings, NOC from relevant authorities, Identity and address proof, and Fee payment receipt.',
      category: 'documents'
    },
    {
      id: '3',
      question: 'How can I check the status of my application?',
      answer: 'You can check your application status by logging into your account and visiting the "My Applications" section. You will receive email and SMS notifications for status updates.',
      category: 'application'
    },
    {
      id: '4',
      question: 'What are the fees for different types of permits?',
      answer: 'Fees vary based on project type, area, and location. Residential permits start from ₹5,000, while commercial permits start from ₹15,000. Check the fee calculator on our website.',
      category: 'fees'
    }
  ];

  const supportTickets: SupportTicket[] = [
    {
      id: '1',
      subject: 'Application PMC/2024/001 - Document Verification Issue',
      status: 'in_progress',
      priority: 'medium',
      createdDate: '2024-01-18',
      lastReply: '2024-01-19'
    },
    {
      id: '2',
      subject: 'Payment Gateway Error',
      status: 'resolved',
      priority: 'high',
      createdDate: '2024-01-15',
      lastReply: '2024-01-16'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission - replace with actual API call
    console.log('New ticket:', { subject: newTicketSubject, message: newTicketMessage });
    setNewTicketSubject('');
    setNewTicketMessage('');
    alert('Support ticket submitted successfully!');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h2>
        <p className="text-gray-600">Get help with your applications and technical issues</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'faq', label: 'FAQ', icon: HelpCircle },
            { key: 'contact', label: 'Contact Us', icon: Phone },
            { key: 'tickets', label: 'Support Tickets', icon: MessageCircle }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(faqCategories).map(([key, category]) => (
                <option key={key} value={key}>{category.label}</option>
              ))}
            </select>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map(faq => (
              <div key={faq.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                        <Badge className={faqCategories[faq.category].color}>
                          {faqCategories[faq.category].label}
                        </Badge>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Phone Support</h4>
                  <p className="text-gray-600">+91 20 2612 2380</p>
                  <p className="text-sm text-gray-500">Mon-Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Email Support</h4>
                  <p className="text-gray-600">support@pmc.gov.in</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Live Chat</h4>
                  <p className="text-gray-600">Available on website</p>
                  <p className="text-sm text-gray-500">Mon-Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
            <form onSubmit={handleNewTicketSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Subject"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  placeholder="Describe your issue or question..."
                  value={newTicketMessage}
                  onChange={(e) => setNewTicketMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Your Support Tickets</h3>
            <Button onClick={() => setActiveTab('contact')}>
              <MessageCircle className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {supportTickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
              <p className="text-gray-600">You haven't created any support tickets yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supportTickets.map(ticket => {
                const StatusIcon = statusConfig[ticket.status].icon;
                return (
                  <div key={ticket.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{ticket.subject}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>Created: {new Date(ticket.createdDate).toLocaleDateString('en-IN')}</span>
                            <span>•</span>
                            <span>Last reply: {new Date(ticket.lastReply).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={statusConfig[ticket.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[ticket.status].label}
                          </Badge>
                          <Badge className={priorityConfig[ticket.priority].color}>
                            {priorityConfig[ticket.priority].label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};