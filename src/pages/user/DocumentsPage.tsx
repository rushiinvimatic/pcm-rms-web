import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { FileText, Download, Eye, Trash2, Search, Plus } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'identity' | 'address' | 'property' | 'technical' | 'other';
  size: number;
  uploadDate: string;
  status: 'uploaded' | 'verified' | 'rejected';
  applicationId?: string;
  applicationNumber?: string;
}

const documentTypes = {
  identity: { label: 'Identity Documents', color: 'bg-blue-100 text-blue-800' },
  address: { label: 'Address Proof', color: 'bg-green-100 text-green-800' },
  property: { label: 'Property Documents', color: 'bg-purple-100 text-purple-800' },
  technical: { label: 'Technical Drawings', color: 'bg-orange-100 text-orange-800' },
  other: { label: 'Other Documents', color: 'bg-gray-100 text-gray-800' }
};

const statusConfig = {
  uploaded: { color: 'bg-yellow-100 text-yellow-800', label: 'Uploaded' },
  verified: { color: 'bg-green-100 text-green-800', label: 'Verified' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Simulate API call - replace with actual API call
    const fetchDocuments = async () => {
      try {
        // Mock data - replace with actual API call
        const mockDocuments: Document[] = [
          {
            id: '1',
            name: 'Aadhar_Card_Front.pdf',
            type: 'identity',
            size: 245760, // bytes
            uploadDate: '2024-01-15',
            status: 'verified',
            applicationId: '1',
            applicationNumber: 'PMC/2024/001'
          },
          {
            id: '2',
            name: 'Property_Documents.pdf',
            type: 'property',
            size: 1048576, // 1MB
            uploadDate: '2024-01-15',
            status: 'verified',
            applicationId: '1',
            applicationNumber: 'PMC/2024/001'
          },
          {
            id: '3',
            name: 'Building_Plan.dwg',
            type: 'technical',
            size: 2097152, // 2MB
            uploadDate: '2024-01-16',
            status: 'uploaded',
            applicationId: '1',
            applicationNumber: 'PMC/2024/001'
          },
          {
            id: '4',
            name: 'PAN_Card.pdf',
            type: 'identity',
            size: 153600,
            uploadDate: '2024-01-10',
            status: 'verified'
          }
        ];
        
        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add uploaded files to documents list (mock)
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `new_${Date.now()}_${index}`,
        name: file.name,
        type: 'other' as const,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'uploaded' as const
      }));
      
      setDocuments(prev => [...prev, ...newDocuments]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Documents</h2>
        <p className="text-gray-600">Manage and organize your uploaded documents</p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {Object.entries(documentTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Upload Button */}
        <div className="relative">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <Button disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? "No documents match your search criteria." 
              : "Upload your first document to get started."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(document => (
            <div key={document.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate" title={document.name}>
                      {document.name}
                    </h3>
                    <p className="text-sm text-gray-500">{formatFileSize(document.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className={documentTypes[document.type].color}>
                    {documentTypes[document.type].label}
                  </Badge>
                  <Badge className={statusConfig[document.status].color}>
                    {statusConfig[document.status].label}
                  </Badge>
                </div>

                {document.applicationNumber && (
                  <p className="text-xs text-gray-500 mb-3">
                    Application: {document.applicationNumber}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString('en-IN')}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};