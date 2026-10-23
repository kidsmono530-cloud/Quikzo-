import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateCustomerProfile } from '../../lib/api';
import { uploadCustomerProfileImage } from '../../lib/firebaseStorage';
import {
  User,
  MapPin,
  ShoppingBag,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  Bike,
  Lock,
  Camera,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  X,
  Upload,
  Loader2
} from 'lucide-react';

interface AccountViewProps {
  onOpenAddresses: () => void;
  onNavigateOrders: () => void;
  onOpenAuth: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onOpenAddresses,
  onNavigateOrders,
  onOpenAuth
}) => {
  const { user, logout, updateUser } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // Profile Edit modal
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const currentAvatar = user?.avatar || user?.profileImage;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image (JPG, JPEG, PNG, or WEBP).');
      setIsPhotoModalOpen(true);
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      setIsPhotoModalOpen(true);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsPhotoModalOpen(true);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // 1. Upload to Firebase Storage in customer-profiles/{userId}/
      const result = await uploadCustomerProfileImage(user.id, selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      // 2. Persist download URL in authenticated customer profile
      const res = await updateCustomerProfile({
        avatar: result.url,
        profileImage: result.url
      });

      // 3. Synchronize context state immediately
      updateUser({
        avatar: res.user.avatar || result.url,
        profileImage: res.user.profileImage || result.url
      });

      setUploadSuccess('Profile photo updated successfully!');
      setTimeout(() => {
        setIsPhotoModalOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }, 1000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    try {
      await updateCustomerProfile({
        avatar: '',
        profileImage: ''
      });
      updateUser({
        avatar: '',
        profileImage: ''
      });
    } catch (err: any) {
      alert(err.message || 'Failed to remove photo');
    }
  };

  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!editName.trim()) {
      setEditError('Name cannot be empty.');
      return;
    }

    setEditSaving(true);
    setEditError(null);

    try {
      const res = await updateCustomerProfile({
        name: editName.trim(),
        email: editEmail.trim()
      });
      updateUser({
        name: res.user.name,
        email: res.user.email
      });
      setShowEditProfileModal(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile details.');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto pb-24 text-xs">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 1. Main Profile Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Circular Profile Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-4 border-[#FFCD00] bg-amber-50 shadow-md flex items-center justify-center">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={user?.name || 'Customer'}
                    className="w-full h-full object-cover"
                  />
                ) : user ? (
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 uppercase">
                    {user.name.slice(0, 2)}
                  </span>
                ) : (
                  <User className="w-8 h-8 text-gray-500" />
                )}
              </div>

              {/* Camera Icon Overlay */}
              {user && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-[#FFCD00] hover:bg-[#ffc200] text-gray-950 rounded-full shadow-md active:scale-90 transition-transform cursor-pointer border-2 border-white"
                  title="Upload / Change Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Customer Details */}
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-gray-950 leading-tight">
                {user ? user.name : 'Welcome to Quikzo'}
              </h2>
              <p className="text-xs text-gray-600 font-mono flex items-center justify-center sm:justify-start gap-1">
                <Phone className="w-3 h-3 text-amber-600" />
                <span>{user ? `+91 ${user.phone}` : 'Fast Shopping, Faster Delivery!'}</span>
              </p>
              {user?.email && (
                <p className="text-[11px] text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span>{user.email}</span>
                </p>
              )}
              {user && (
                <span className="inline-block mt-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                  Verified Customer Account
                </span>
              )}
            </div>
          </div>

          {!user ? (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 bg-[#FFCD00] text-gray-950 font-black rounded-xl shadow-xs hover:bg-[#ffc200] transition-colors"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => {
                setEditName(user.name);
                setEditEmail(user.email || '');
                setShowEditProfileModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 transition-colors shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {/* Photo Management Quick Actions for logged-in user */}
        {user && (
          <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl flex items-center gap-1.5 transition-colors text-[11px]"
            >
              <Upload className="w-3.5 h-3.5 text-amber-700" />
              <span>{currentAvatar ? 'Change Photo' : 'Add Profile Photo'}</span>
            </button>

            {currentAvatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Navigation Actions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs divide-y divide-gray-100 overflow-hidden font-semibold text-gray-800">
        <button
          onClick={onNavigateOrders}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block">My Orders &amp; Live Status</span>
              <span className="text-[11px] text-gray-400 font-normal">Track past deliveries, items and COD invoices</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={onOpenAddresses}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block">Saved Delivery Addresses</span>
              <span className="text-[11px] text-gray-400 font-normal">Manage home and work delivery locations</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={() => setShowSupportModal(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block">24x7 Help &amp; Support</span>
              <span className="text-[11px] text-gray-400 font-normal">FAQs, returns, and grocery support assistance</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={() => setShowLegalModal('privacy')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block">Privacy Policy</span>
              <span className="text-[11px] text-gray-400 font-normal">How your data and transactions are protected</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          onClick={() => setShowLegalModal('terms')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block">Terms &amp; Conditions</span>
              <span className="text-[11px] text-gray-400 font-normal">Store policies and service agreements</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Staff & Owner Quick Portals */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-orange-500/10 p-4 rounded-3xl border border-orange-500/20 space-y-3">
        <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider px-1">
          Staff &amp; Store Management Portals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => {
              window.location.hash = '#/delivery';
            }}
            className="p-3 bg-slate-900 hover:bg-slate-950 text-white rounded-2xl flex items-center justify-between transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <Bike className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold block text-xs">Delivery Partner Portal</span>
                <span className="text-[10px] text-orange-400">Login for delivery staff</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => {
              window.location.hash = '#/admin';
            }}
            className="p-3 bg-[#0A192F] hover:bg-gray-900 text-white rounded-2xl flex items-center justify-between transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFCD00] text-gray-950 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="font-bold block text-xs">Store Admin Panel</span>
                <span className="text-[10px] text-amber-300">Owner dashboard &amp; inventory</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Logout */}
      {user && (
        <button
          onClick={logout}
          className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      )}

      {/* 3. Photo Upload & Preview Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-gray-950">Upload Profile Photo</h3>
              <button
                onClick={() => {
                  if (!uploading) {
                    setIsPhotoModalOpen(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }
                }}
                disabled={uploading}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Circular Preview Container */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#FFCD00] shadow-md bg-gray-50 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                {selectedFile ? `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)` : 'Preview'}
              </p>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-gray-700">
                  <span>Uploading to Firebase Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FFCD00] h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
              >
                Choose Another
              </button>

              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={uploading || !selectedFile}
                className="py-2.5 px-3 bg-[#FFCD00] hover:bg-[#ffc200] text-gray-950 font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Photo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Profile Details Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-sm text-gray-950">Edit Profile Details</h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileDetails} className="space-y-3">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-amber-400 focus:outline-hidden"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-amber-400 focus:outline-hidden"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Registered Phone</label>
                <input
                  type="text"
                  disabled
                  value={`+91 ${user?.phone || ''}`}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Phone number is verified and tied to this account.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="w-full py-2.5 bg-[#FFCD00] hover:bg-[#ffc200] text-gray-950 font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Support & Legal Modals */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-black text-base text-gray-900">24x7 Customer Support</h3>
            <p className="text-gray-600">
              Need assistance with an ongoing order, delivery partner query, or return?
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-bold text-gray-900">Toll-Free Helpline</div>
                  <div className="text-gray-500 font-mono">+91 98765 43210 (6 AM - 11 PM)</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-700" />
                <div>
                  <div className="font-bold text-gray-900">Email Support</div>
                  <div className="text-gray-500 font-mono">support@quikzo.com</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 bg-gray-950 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-3">
            <h3 className="font-black text-base text-gray-900">
              {showLegalModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed max-h-60 overflow-y-auto">
              Quikzo respects your personal data and privacy. We use standard encryption and data safeguards for customer transactions, order addresses, and contact numbers. All orders placed are subject to our 10-15 minute delivery SLA during operating hours. Prices are displayed in Indian Rupees (₹) inclusive of GST.
            </p>
            <button
              onClick={() => setShowLegalModal(null)}
              className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
