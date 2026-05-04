import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, AlertCircle, Clock, User, Building2, FileText, Phone, Mail, Globe, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ProfileCompletionData {
  profile_completion_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  profile_submission_date?: string;
  profile_review_date?: string;
  profile_review_notes?: string;
}

export default function ProfileCompletionNotification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileCompletionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileCompletionData();
    }
  }, [user]);

  const loadProfileCompletionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile-completion`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.data);
      }
    } catch (error) {
      console.error('Failed to load profile completion data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || !user) {
    return null;
  }

  // Don't show notification if profile is completed, pending review, or rejected
  if (profileData?.profile_completion_status === 'approved' || profileData?.profile_completion_status === 'pending' || profileData?.profile_completion_status === 'rejected') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_submitted':
        return 'Profile Not Complete';
      case 'rejected':
        return 'Profile Rejected';
      default:
        return 'Profile Status Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_submitted':
        return <AlertCircle className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCompletionPercentage = () => {
    if (!user) return 0;
    
    let completed = 0;
    const total = 6;
    
    if (user.first_name && user.last_name) completed++;
    if (user.email) completed++;
    if (user.company_name) completed++;
    // Add other profile fields when available
    // if (user.phone) completed++;
    // if (user.website) completed++;
    // if (user.official_company_name) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  const handleCompleteProfile = () => {
    // Navigate to profile completion page
    navigate('/app/settings?tab=kyc');
    setDismissed(true);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="bg-white border shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <h3 className="text-sm font-medium">Complete Your Profile</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {completionPercentage}% complete
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div 
                  className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleCompleteProfile} size="sm" className="flex-1 text-xs">
              Complete Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
