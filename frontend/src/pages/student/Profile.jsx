import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiBook, FiLock, FiSave } from 'react-icons/fi';
import FaceRegistration from '../../components/proctoring/FaceRegistration';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', course: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', course: user.course || '' });
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentService.updateProfile(form);
      toast.success('Profile updated');
      fetchUser();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    setChangingPassword(true);
    try {
      await studentService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setChangingPassword(false); }
  };

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Profile Settings</h1><p>Manage your account details</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-body text-center">
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, margin: '0 auto 16px' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <h3>{user?.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
            <span className="badge badge-primary" style={{ marginTop: '12px' }}>Student</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Edit Profile */}
          <div className="card">
            <div className="card-header"><h4><FiUser style={{ marginRight: '8px' }} /> Edit Profile</h4></div>
            <div className="card-body">
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Course</label>
                    <select className="form-select" value={form.course} onChange={e => setForm({...form, course: e.target.value})}>
                      <option value="">Select</option>
                      <option value="B.Tech CSE">B.Tech CSE</option><option value="B.Tech IT">B.Tech IT</option>
                      <option value="B.Tech ECE">B.Tech ECE</option><option value="BCA">BCA</option><option value="MCA">MCA</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}><FiSave /> {saving ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header"><h4><FiLock style={{ marginRight: '8px' }} /> Change Password</h4></div>
            <div className="card-body">
              <form onSubmit={handleChangePassword}>
                <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required minLength="6" /></div>
                  <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required /></div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={changingPassword}><FiLock /> {changingPassword ? 'Changing...' : 'Change Password'}</button>
              </form>
            </div>
          </div>

          {/* Face Registration */}
          <FaceRegistration user={user} onUpdate={fetchUser} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
