'use client';

import { useState } from 'react';
import { apiService } from '@/services/api.service';
import { CreateProfileData } from '@/types';
import { X, User, Check, AlertCircle } from 'lucide-react';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  onProfileCreated: (profile: any) => void;
}

export default function ProfileCreationModal({ 
  isOpen, 
  onClose, 
  userAddress, 
  onProfileCreated 
}: ProfileCreationModalProps) {
  const [formData, setFormData] = useState<CreateProfileData>({
    address: userAddress,
    username: '',
    displayName: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const handleInputChange = (field: keyof CreateProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username' && value.length >= 3) {
      checkUsernameAvailability(value);
    } else if (field === 'username') {
      setUsernameAvailable(null);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      setCheckingUsername(true);
      const response = await apiService.checkUsernameAvailability(username);
      setUsernameAvailable(response.available);
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameAvailable(false);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.displayName) {
      setError('Username and display name are required');
      return;
    }

    if (usernameAvailable === false) {
      setError('Username is not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.createProfile(formData);
      onProfileCreated(response.profile);
      onClose();
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl shadow-white/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Profile</h2>
              <p className="text-silver/70 text-sm">Set up your TipStream profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white p-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Username *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
              />
              {checkingUsername && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              )}
              {usernameAvailable === true && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
              )}
              {usernameAvailable === false && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-silver/70">
              {formData.username.length < 3 && formData.username.length > 0 && (
                <span className="text-red-400">Username must be at least 3 characters</span>
              )}
              {formData.username.length >= 3 && usernameAvailable === true && (
                <span className="text-green-400">Username is available</span>
              )}
              {usernameAvailable === false && (
                <span className="text-red-400">Username is not available</span>
              )}
              {formData.username.length === 0 && (
                <span>Only letters, numbers, and underscores allowed</span>
              )}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Enter display name"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
              required
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 resize-none"
              maxLength={500}
            />
            <div className="mt-1 text-xs text-silver/70 text-right">
              {formData.bio.length}/500
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.username || !formData.displayName || usernameAvailable === false}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Profile...</span>
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                <span>Create Profile</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-silver/70 text-sm">
            You can edit your profile later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
