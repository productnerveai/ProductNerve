import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, X, FileText, Download, Trash2, FolderOpen } from "lucide-react";

interface RAGFile {
  _id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  file_url: string;
  content_summary: string;
}

interface RAGFolderProps {
  projectId: string;
}

export default function RAGFolder({ projectId }: RAGFolderProps) {
  const [files, setFiles] = useState<RAGFile[]>([]);
  const [folderStats, setFolderStats] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadRAGFolder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/rag`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.data.files);
        setFolderStats(data.data.folderStats);
      }
    } catch (error) {
      toast.error("Failed to load RAG folder");
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length === 0) return;

    const currentTotalSize = folderStats?.totalSize ? parseInt(folderStats.totalSize.replace(/[^\d]/g, '')) : 0;
    const newFilesSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const newTotalSize = currentTotalSize + newFilesSize;

    if (newTotalSize > 50 * 1024 * 1024) {
      toast.error("Files would exceed 50MB limit");
      return;
    }

    // Upload each file
    setUploading(true);
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/rag/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(`${file.name} uploaded successfully`);
        } else {
          const error = await response.json();
          toast.error(error.message || `Failed to upload ${file.name}`);
        }
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    // Reload folder after upload
    await loadRAGFolder();
    setUploading(false);
    
    // Clear input
    if (event.target) {
      event.target.value = '';
    }
  };

  const deleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/rag/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success(`${fileName} deleted successfully`);
        await loadRAGFolder();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete file");
      }
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Create a synthetic event to reuse the upload logic
    const syntheticEvent = {
      target: { files: droppedFiles }
    } as any;
    await handleFileSelect(syntheticEvent);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    }
    if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    }
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-4 w-4 text-green-600" />;
    }
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="h-4 w-4 text-orange-600" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  useEffect(() => {
    loadRAGFolder();
  }, [projectId]);

  if (!folderStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project Knowledge Base
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Project Knowledge Base
          </div>
          <div className="text-sm text-muted-foreground">
            {folderStats.totalFiles} files • {folderStats.totalSize}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif"
            onChange={handleFileSelect}
            className="hidden"
            id="rag-upload"
            disabled={uploading}
          />
          <label 
            htmlFor="rag-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              PDF, Word, Excel, PowerPoint, Text, CSV, and images
            </span>
          </label>
        </div>

        {/* Storage Usage */}
        <div className="bg-muted/30 rounded p-3">
          <div className="flex justify-between items-center text-sm mb-2">
            <span>Storage Used</span>
            <span className={`font-medium ${
              folderStats.usagePercentage > 80 ? 'text-red-600' : 
              folderStats.usagePercentage > 60 ? 'text-orange-600' : ''
            }`}>
              {folderStats.totalSize} / 50MB
            </span>
          </div>
          <Progress 
            value={folderStats.usagePercentage} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {folderStats.remaining} available
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div key={file._id} className="flex items-center justify-between bg-card border rounded p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.original_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                      </div>
                      {file.content_summary && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {file.content_summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.file_url, '_blank')}
                      className="h-8 w-8 p-0"
                      title="Download"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file._id, file.original_name)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No files uploaded yet</p>
            <p className="text-xs mt-1">
              Upload project-related documents to provide better context for AI analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
