import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api, processImage } from '../services/api';
import { NewsItem, NewsStatus, User, Promotion } from '../types';
import { useSiteConfig } from '../context/SiteConfigContext';
import { Check, X, Trash2, Loader, Eye, UserPlus, FileText, Settings, Users, Lock, Unlock, Edit, Shield, Layout, Image as ImageIcon, Link as LinkIcon, Phone, Mail, AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { config, updateConfig } = useSiteConfig();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [siteName, setSiteName] = useState(config.siteName);
  const [promoLink, setPromoLink] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'reporter' });
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [n, u] = await Promise.all([Api.getAllNewsAdmin(), Api.getAllUsers()]);
      setNews(n || []);
      setUsers(u || []);
    } catch (error) {
      console.error("Error loading admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSiteName(config.siteName);
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (window.confirm("क्या आप इस खबर को हमेशा के लिए डिलीट करना चाहते हैं?")) {
        setLoading(true);
        try {
            await Api.deleteNews(id);
            setNews(prev => prev.filter(n => n.id !== id));
            alert("खबर सफलतापूर्वक डिलीट कर दी गई।");
        } catch (err) {
            alert("डिलीट करने में विफल: " + (err as Error).message);
        } finally {
            setLoading(false);
        }
    }
  };

  const handleStatus = async (id: string, status: NewsStatus) => {
    try {
        await Api.updateNewsStatus(id, status);
        setNews(prev => prev.map(n => n.id === id ? { ...n, status } : n));
    } catch (err) {
        alert("स्थिति अपडेट करने में विफल।");
    }
  };

  const handleEdit = (id: string) => { navigate(`/reporter/edit/${id}`); };

  const handleView = (id: string) => {
    if (!id) return;
    // HashRouter compatibility
    window.open(`/#/news/${id}`, '_blank');
  };

  const toggleBlock = async (u: User) => {
    await Api.updateUserFields(u.id, { isBlocked: !u.isBlocked });
    setUsers(prev => prev.map(user => user.id === u.id ? { ...user, isBlocked: !user.isBlocked } : user));
  };

  const togglePost = async (u: User) => {
    await Api.updateUserFields(u.id, { canPost: !u.canPost });
    setUsers(prev => prev.map(user => user.id === u.id ? { ...user, canPost: !user.canPost } : user));
  };

  const handleUserApproval = async (u: User, status: 'active' | 'rejected') => {
    if (status === 'rejected' && !window.confirm(`Are you sure you want to reject ${u.name}?`)) return;
    await Api.updateUserStatus(u.id, status);
    setUsers(prev => prev.map(user => user.id === u.id ? { ...user, status: status, canPost: status === 'active' } : user));
    if (selectedUser?.id === u.id) setSelectedUser(null);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await Api.createUserAdmin({ ...newUser, id: Date.now().toString(), status: 'active', isBlocked: false, canPost: true, role: newUser.role as any });
        setMsg('User created successfully');
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'reporter' });
        loadData();
    } catch (err: any) { setMsg(err.message); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const base64 = await processImage(e.target.files[0]);
        await updateConfig({ ...config, logoUrl: base64 });
    }
  };

  const saveSettings = async () => {
    await updateConfig({ ...config, siteName });
    alert("Settings Saved");
  };

  const addPromotion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && promoLink) {
        const base64 = await processImage(e.target.files[0]);
        const newPromo: Promotion = { id: Date.now().toString(), imageUrl: base64, linkUrl: promoLink, active: true };
        await updateConfig({ ...config, promotions: [...config.promotions, newPromo] });
        setPromoLink('');
    } else {
        alert("Please enter a link first, then upload banner.");
    }
  };

  const removePromotion = async (id: string) => {
      const filtered = config.promotions.filter(p => p.id !== id);
      await updateConfig({ ...config, promotions: filtered });
  };

  const pendingUsersCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 -m-6 relative">
      <aside className="w-full lg:w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Shield className="text-blue-700" /> Admin
        </h2>
        <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-lg text-left flex items-center gap-3 font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><Layout size={18} /> News Manager</button>
        <button onClick={() => setActiveTab('users')} className={`p-3 rounded-lg text-left flex items-center justify-between font-medium transition ${activeTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3"><Users size={18} /> User Control</div>
            {pendingUsersCount > 0 && <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{pendingUsersCount}</span>}
        </button>
        <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-lg text-left flex items-center gap-3 font-medium transition ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}><Settings size={18} /> Site Settings</button>
      </aside>

      <div className="flex-1 p-6 md:p-10">
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">News Management</h1>
                    <button onClick={loadData} className="text-sm bg-white border px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-2">
                        {loading ? <Loader size={14} className="animate-spin" /> : "Refresh"}
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr><th className="p-4">Title</th><th className="p-4">Author</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y">
                            {news.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4 min-w-[300px] max-w-md">
                                        <div className="font-medium truncate" title={item.title}>{item.title || <span className="text-red-400 italic">Untitled</span>}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">ID: {item.id}</div>
                                    </td>
                                    <td className="p-4">{item.authorName || 'System'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'approved' ? 'bg-green-100 text-green-800' : item.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>{item.status || 'pending'}</span>
                                    </td>
                                    <td className="p-4 flex justify-end gap-1.5">
                                        <button onClick={() => handleView(item.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Eye size={18}/></button>
                                        <button onClick={() => handleEdit(item.id)} className="p-2 text-gray-600 hover:bg-gray-50 rounded"><Edit size={18}/></button>
                                        {item.status !== 'approved' && <button onClick={() => handleStatus(item.id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded"><Check size={18}/></button>}
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && news.length === 0 && <div className="p-12 text-center text-gray-500 italic">कोई खबर नहीं मिली।</div>}
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center"><h3 className="font-bold text-lg">User List</h3></div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 border-b text-xs"><tr><th className="p-4">Details</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Permissions</th><th className="p-4 text-right">Manage</th></tr></thead>
                        <tbody className="divide-y">
                            {users.sort((a,b) => (a.status==='pending' ? -1 : 1)).map(u => (
                                <tr key={u.id} className={`${u.status === 'pending' ? 'bg-yellow-50' : u.isBlocked ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                    <td className="p-4"><div className="font-bold text-blue-700">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                                    <td className="p-4 capitalize">{u.role}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{u.status}</span></td>
                                    <td className="p-4">
                                        {u.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleUserApproval(u, 'active')} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                                                <button onClick={() => handleUserApproval(u, 'rejected')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                                            </div>
                                        ) : <button onClick={() => togglePost(u)} className={`px-2 py-1 rounded text-[10px] border font-bold ${u.canPost ? 'bg-green-100' : 'bg-gray-100'}`}>{u.canPost ? 'CAN POST' : 'DISABLED'}</button>}
                                    </td>
                                    <td className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setSelectedUser(u)} className="p-1.5 text-blue-600"><Eye size={16}/></button>{u.id !== 'master-admin' && u.status !== 'pending' && <button onClick={() => toggleBlock(u)} className={`px-2 py-1 rounded text-[10px] text-white ${u.isBlocked ? 'bg-green-600' : 'bg-red-600'}`}>{u.isBlocked ? 'Unblock' : 'Block'}</button>}</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserPlus size={20}/> Create User</h3>
                    <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <input type="text" placeholder="Name" required className="p-2 border rounded" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                        <input type="email" placeholder="Email" required className="p-2 border rounded" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        <input type="password" placeholder="Password" required className="p-2 border rounded" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        <select className="p-2 border rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}><option value="reporter">Reporter</option><option value="admin">Admin</option></select>
                        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Create</button>
                    </form>
                    {msg && <p className="mt-2 text-green-600 font-bold">{msg}</p>}
                </div>
            </div>
        )}

        {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Settings size={20}/> General Settings</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div><label className="block text-sm font-bold mb-2">Logo</label><div className="flex items-center gap-4">{config.logoUrl && <img src={config.logoUrl} className="h-16 w-auto border rounded" />}<label className="cursor-pointer bg-gray-100 px-4 py-2 rounded border text-sm">Change Logo<input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} /></label></div></div>
                        <div><label className="block text-sm font-bold mb-2">Site Name</label><div className="flex gap-2"><input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="flex-1 border rounded px-3 py-2" /><button onClick={saveSettings} className="bg-blue-600 text-white px-4 py-2 rounded font-bold">Save</button></div></div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
                <div className="bg-blue-700 p-4 text-white flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Details</h3><button onClick={() => setSelectedUser(null)}><X size={20}/></button></div>
                <div className="p-6">
                    <div className="flex items-center gap-4 pb-4 border-b">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center"><Users size={32} /></div>
                        <div><h2 className="text-xl font-bold">{selectedUser.name}</h2><span className="text-xs uppercase font-bold">{selectedUser.status}</span></div>
                    </div>
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3"><Mail className="text-blue-600" size={18}/><span className="text-sm">{selectedUser.email}</span></div>
                        <div className="flex items-center gap-3"><Phone className="text-blue-600" size={18}/><span className="text-sm">{selectedUser.phone || 'N/A'}</span></div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;