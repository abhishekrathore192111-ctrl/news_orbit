
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
// Add AlertCircle to the list of imported icons from lucide-react to fix the "Cannot find name 'AlertCircle'" error
import { Eye, EyeOff, Shield, User, UserPlus, Lock, Clipboard, Check, HelpCircle, AlertCircle } from 'lucide-react';
import { auth as firebaseAuth } from '../firebase';

type AuthMode = 'login' | 'register' | 'admin';

const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registeredUid, setRegisteredUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await Api.login(identifier, password);
      login(user);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'reporter' || user.canPost) navigate('/reporter/add');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await Api.register({
        name,
        email: regEmail,
        phone,
        password: regPassword
      });
      
      const currentUid = firebaseAuth.currentUser?.uid || '';
      setRegisteredUid(currentUid);
      setSuccess('अकाउंट सफलतापूर्वक बन गया है!');

      setName('');
      setRegEmail('');
      setPhone('');
      setRegPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyUid = () => {
    navigator.clipboard.writeText(registeredUid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHeader = () => {
    switch (mode) {
      case 'admin':
        return (
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
              <Shield className="text-red-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">एडमिन लॉगिन (Admin)</h2>
            <p className="text-sm text-gray-500">केवल अधिकृत व्यक्तियों के लिए</p>
          </div>
        );
      case 'register':
        return (
          <div className="text-center mb-6">
             <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <UserPlus className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">नया अकाउंट बनाएँ</h2>
            <p className="text-sm text-gray-500">न्यूज़ ऑर्बिट से जुड़ने के लिए रजिस्टर करें</p>
          </div>
        );
      default:
        return (
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <User className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">सदस्य लॉगिन</h2>
            <p className="text-sm text-gray-500">न्यूज़ ऑर्बिट इंडिया में आपका स्वागत है</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        
        {renderHeader()}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm font-medium border border-red-200 flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded mb-4 text-sm border border-green-200">
            <p className="font-bold mb-2 flex items-center gap-2 text-base"><Check className="bg-green-600 text-white rounded-full p-0.5" size={20} /> {success}</p>
            <div className="space-y-3 mt-4 text-gray-700">
                <p className="font-semibold">अपना एडमिन अकाउंट चालू करने के लिए:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>नीचे दी गई अपनी <b>User ID</b> को कॉपी करें।</li>
                    <li>Firebase Console खोलें और <b>Users</b> कलेक्शन में जाएँ।</li>
                    <li>अपनी ID वाला डॉक्यूमेंट खोलें और <b>role</b> को बदलकर <b>"admin"</b> लिख दें।</li>
                    <li><b>status</b> को बदलकर <b>"active"</b> कर दें।</li>
                </ol>
            </div>
            
            <div className="flex items-center gap-2 bg-white p-3 border rounded my-4 shadow-inner">
              <code className="text-xs flex-1 truncate font-mono">{registeredUid}</code>
              <button onClick={copyUid} className="p-1.5 hover:bg-gray-100 rounded text-blue-600 transition" title="Copy ID">
                {copied ? <Check size={18} /> : <Clipboard size={18} />}
              </button>
            </div>

            <button 
              onClick={() => { setMode('login'); setSuccess(''); }}
              className="w-full bg-blue-700 text-white py-2.5 rounded font-bold hover:bg-blue-800 transition"
            >
              लॉगिन पेज पर जाएँ
            </button>
          </div>
        )}

        {!success && (mode === 'login' || mode === 'admin') && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {mode === 'admin' ? 'एडमिन ईमेल' : 'ईमेल या फोन नंबर'}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder={mode === 'admin' ? 'admin@newsorbit.com' : 'अपना ईमेल डालें'}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-700 mb-1">पासवर्ड</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="पासवर्ड डालें"
              />
               <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-white transition disabled:opacity-50 shadow-md ${
                mode === 'admin' ? 'bg-red-700 hover:bg-red-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {loading ? 'प्रोसेसिंग...' : (mode === 'admin' ? 'एडमिन लॉगिन' : 'सुरक्षित लॉगिन')}
            </button>
            
            {mode === 'admin' && (
                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[10px] text-gray-500 flex gap-2">
                    <HelpCircle size={14} className="shrink-0 text-blue-500" />
                    <span><b>ध्यान दें:</b> अगर आप एडमिन हैं और लॉगिन नहीं कर पा रहे, तो सुनिश्चित करें कि आपका 'status' active है और 'role' admin है।</span>
                </div>
            )}
          </form>
        )}

        {!success && mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">पूरा नाम</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="अपना पूरा नाम लिखें"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ईमेल आईडी</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">फोन नंबर</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="10 अंकों का मोबाइल नंबर"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">पासवर्ड</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="नया पासवर्ड"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">पुष्टि करें</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="दोबारा डालें"
                />
              </div>
            </div>

             <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'अकाउंट बन रहा है...' : 'अकाउंट बनाएँ'}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-4 text-center">
            {mode === 'login' && (
              <>
                <button 
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-sm text-blue-700 hover:text-blue-800 font-bold transition"
                >
                  नया अकाउंट बनाना चाहते हैं? यहाँ क्लिक करें
                </button>
                <button 
                  onClick={() => { setMode('admin'); setError(''); setIdentifier(''); setPassword(''); }}
                  className="text-xs text-gray-400 hover:text-red-600 flex items-center justify-center gap-1 transition"
                >
                  <Lock size={12} /> एडमिन लॉगिन पेज
                </button>
              </>
            )}

            {mode === 'register' && (
               <button 
                 onClick={() => { setMode('login'); setError(''); }}
                 className="text-sm text-blue-700 hover:text-blue-800 font-bold transition"
               >
                 पहले से अकाउंट है? लॉगिन करें
               </button>
            )}

            {mode === 'admin' && (
               <button 
                 onClick={() => { setMode('login'); setError(''); setIdentifier(''); setPassword(''); }}
                 className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
               >
                 &larr; वापस सदस्य लॉगिन पर जाएँ
               </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
