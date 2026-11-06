import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px' }}>
      <div className="animate-in">
        <div className="text-center" style={{ marginBottom: '48px' }}>
          <h1>Get In Touch</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1.1rem' }}>
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
          {/* Contact Info */}
          <div>
            {[
              { icon: <FiMail />, title: 'Email', info: 'admin@examportal.com', color: '#6366f1' },
              { icon: <FiPhone />, title: 'Phone', info: '+91 9876543210', color: '#10b981' },
              { icon: <FiMapPin />, title: 'Address', info: 'Computer Science Dept, University Campus, India', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className="card" style={{ marginBottom: '16px' }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9375rem' }}>{item.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.info}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="card">
            <div className="card-header"><h3>Send us a message</h3></div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="Your email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-input" placeholder="Message subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows="5" placeholder="Your message..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                  <FiSend /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
