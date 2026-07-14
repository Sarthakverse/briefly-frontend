import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import SearchableDropdown from '../components/SearchableDropdown';

const DEPARTMENTS = [
  'Smart Integration (API) - Delivery',
  'Cloud Development Delivery',
  // Add more as needed
];

const DESIGNATIONS = [
  'Trainee (TR)',
  'Associate (AC)',
  'Associate Specialist (ASP)',
  'Specialist (SP)',
  'Senior Specialist (SS)',
  'Lead (LD)',
  'Associate Manager (AMG)',
  'Manager (MG)',
  'Senior Manager (SM)',
  'Director (DR)',
  'Senior Director (SD)',
  'Vice President (VP)',
  'Software Engineer (SWE)',
  'Senior Software Engineer (SSWE)',
  // Add more as needed
];

const OFFICE_LOCATIONS = [
  'San Jose',
  'Dallas',
  'Vancouver',
  'Bangalore',
  'Noida',
  'Mumbai',
  'Pune',
  'London',
  'Frankfurt',
  'Dubai',
  'Singapore',
  'Kuala Lumpur',
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    designation: '',
    phone: '',
    officeLocation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateName = (val: string) => {
    if (!val.trim()) return 'Full name is required';
    return '';
  };

  const validateEmail = (val: string) => {
    if (!val) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email';
    return '';
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'At least 8 characters';
    if (!/[A-Z]/.test(val)) return 'Must contain an uppercase letter';
    if (!/[a-z]/.test(val)) return 'Must contain a lowercase letter';
    if (!/[0-9]/.test(val)) return 'Must contain a digit';
    return '';
  };

  const validateConfirmPassword = (val: string) => {
    if (!val) return 'Please confirm your password';
    if (val !== formData.password) return 'Passwords do not match';
    return '';
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Run validation for the field
    let error = '';
    switch (field) {
      case 'name': error = validateName(value); break;
      case 'email': error = validateEmail(value); break;
      case 'password':
        error = validatePassword(value);
        // Also re‑validate confirm password if it's set
        if (formData.confirmPassword) {
          const confirmErr = validateConfirmPassword(formData.confirmPassword);
          setErrors(prev => ({ ...prev, confirmPassword: confirmErr }));
        }
        break;
      case 'confirmPassword': error = validateConfirmPassword(value); break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');

    // Run all validations
    const newErrors: Record<string, string> = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
        officeLocation: formData.officeLocation,
      });
      navigate('/');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Briefly AI</h1>
          <p className="text-gray-500">Create your account</p>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md mb-4 text-sm">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Password *</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.password ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button type="button" className="absolute right-2 top-2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Confirm Password *</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button type="button" className="absolute right-2 top-2 text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Department (searchable dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Department</label>
            <SearchableDropdown
              options={DEPARTMENTS}
              value={formData.department}
              onChange={(val) => handleChange('department', val)}
              placeholder="Search department..."
            />
          </div>

          {/* Designation (simple dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Designation</label>
            <select
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select designation</option>
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Office Location (dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Office Location</label>
            <select
              value={formData.officeLocation}
              onChange={(e) => handleChange('officeLocation', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select location</option>
              {OFFICE_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 active:scale-[0.98] transform"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}