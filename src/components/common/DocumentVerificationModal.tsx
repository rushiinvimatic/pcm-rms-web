import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { 
  FileText, 
  Download, 
  Eye, 
  X, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Building,
  Maximize2
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  url?: string;
  thumbnailUrl?: string;
}

interface Application {
  id: string;
  applicationNumber: string;
  applicantName: string;
  position: string;
  submissionDate: string;
  documents: Document[];
}

interface DocumentVerificationModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (documentIds: string[], comments?: string) => Promise<void>;
  onReject: (documentIds: string[], reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [verificationMode, setVerificationMode] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (isOpen && application) {
      // Select all pending documents by default
      const pendingDocs = application.documents
        .filter(doc => doc.status === 'pending')
        .map(doc => doc.id);
      setSelectedDocuments(new Set(pendingDocs));
    }
  }, [isOpen, application]);

  const handleDocumentToggle = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    if (!application) return;
    
    const pendingDocs = application.documents
      .filter(doc => doc.status === 'pending')
      .map(doc => doc.id);
    
    if (selectedDocuments.size === pendingDocs.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(pendingDocs));
    }
  };

  const handleApprove = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        variant: "destructive",
        title: "No Documents Selected",
        description: "Please select at least one document to approve.",
      });
      return;
    }

    try {
      await onApprove(Array.from(selectedDocuments), comments);
      toast({
        title: "Documents Approved",
        description: `${selectedDocuments.size} document(s) have been approved.`,
      });
      handleClose();
    } catch (error) {
      console.error('Error approving documents:', error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: "Failed to approve documents. Please try again.",
      });
    }
  };

  const handleReject = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        variant: "destructive",
        title: "No Documents Selected",
        description: "Please select at least one document to reject.",
      });
      return;
    }

    if (!rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection.",
      });
      return;
    }

    try {
      await onReject(Array.from(selectedDocuments), rejectionReason);
      toast({
        title: "Documents Rejected",
        description: `${selectedDocuments.size} document(s) have been rejected.`,
      });
      handleClose();
    } catch (error) {
      console.error('Error rejecting documents:', error);
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: "Failed to reject documents. Please try again.",
      });
    }
  };

  const handleClose = () => {
    setSelectedDocuments(new Set());
    setVerificationMode(null);
    setComments('');
    setRejectionReason('');
    setViewingDocument(null);
    onClose();
  };

  const downloadDocument = async (document: Document) => {
    try {
      // Mock download - replace with actual API call
      toast({
        title: "Download Started",
        description: `Downloading ${document.name}...`,
      });
      
      // Simulate download
      const link = document?.createElement('a');
      link.href = document.url || '#';
      link.download = document.name;
      document.body?.appendChild(link);
      link.click();
      document.body?.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
      });
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  if (!isOpen || !application) return null;

  const pendingDocuments = application.documents.filter(doc => doc.status === 'pending');
  const allSelected = selectedDocuments.size === pendingDocuments.length && pendingDocuments.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Document Verification</h2>
              <p className="text-gray-600 text-sm mt-1">
                Review and verify uploaded documents
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Application Info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Application Number</p>
                <p className="font-medium text-blue-900">{application.applicationNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Applicant Name</p>
                <p className="font-medium text-blue-900">{application.applicantName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">Submission Date</p>
                <p className="font-medium text-blue-900">
                  {new Date(application.submissionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selection Controls */}
          {pendingDocuments.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isLoading}
              >
                {allSelected ? 'Deselect All' : 'Select All Pending'}
              </Button>
              <p className="text-sm text-gray-600">
                {selectedDocuments.size} of {pendingDocuments.length} pending documents selected
              </p>
            </div>
          )}

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {application.documents.map((document) => (
              <Card 
                key={document.id} 
                className={`p-4 cursor-pointer transition-all ${
                  selectedDocuments.has(document.id) 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                } ${document.status !== 'pending' ? 'opacity-75' : ''}`}
                onClick={() => document.status === 'pending' && handleDocumentToggle(document.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(document.status)}
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(document.status)}
                    {document.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(document.id)}
                        onChange={() => handleDocumentToggle(document.id)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 truncate" title={document.name}>
                  {document.name}
                </h3>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Type: {document.type}</p>
                  <p>Size: {document.size}</p>
                  <p>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</p>
                </div>

                {document.status === 'rejected' && document.rejectionReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                    <p className="text-red-800">
                      <strong>Rejection Reason:</strong> {document.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingDocument(document);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadDocument(document);
                    }}
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {application.documents.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
              <p className="text-gray-600">No documents have been uploaded for this application.</p>
            </div>
          )}
        </div>

        {/* Action Panel */}
        {pendingDocuments.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            {verificationMode === 'approve' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments or notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setVerificationMode(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isLoading || selectedDocuments.size === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Approving...' : `Approve ${selectedDocuments.size} Document(s)`}
                  </Button>
                </div>
              </div>
            )}

            {verificationMode === 'reject' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setVerificationMode(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isLoading || selectedDocuments.size === 0 || !rejectionReason.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? 'Rejecting...' : `Reject ${selectedDocuments.size} Document(s)`}
                  </Button>
                </div>
              </div>
            )}

            {!verificationMode && (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Close
                </Button>
                <Button
                  onClick={() => setVerificationMode('reject')}
                  disabled={isLoading || selectedDocuments.size === 0}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Selected
                </Button>
                <Button
                  onClick={() => setVerificationMode('approve')}
                  disabled={isLoading || selectedDocuments.size === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Selected
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{viewingDocument.name}</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDocument(viewingDocument)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingDocument(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                {viewingDocument.url ? (
                  <iframe
                    src={viewingDocument.url}
                    className="w-full h-full"
                    title={viewingDocument.name}
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Document preview not available</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => downloadDocument(viewingDocument)}
                    >
                      Download to View
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};