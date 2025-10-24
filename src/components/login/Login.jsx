import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, User, Lock, Eye, EyeOff, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import authService from '../../services/authService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Nome utente è obbligatorio';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password è obbligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password deve essere di almeno 6 caratteri';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const response = await authService.login(formData.username, formData.password);
      
      console.log('Login successful:', response);
      
      // Naviga alla dashboard dopo login riuscito
      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="login-container">
      {/* Background decoration */}
      <div className="login-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1"></div>
        <div className="login-bg-circle login-bg-circle-2"></div>
        <div className="login-bg-circle login-bg-circle-3"></div>
      </div>

      {/* Main container */}
      <div className="login-main-container">
        {/* Back button */}
        <button 
          onClick={handleBackToHome}
          className="login-back-btn"
        >
          <ArrowLeft className="login-back-icon" />
          <span>Torna alla Home</span>
        </button>

        {/* Login Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-header-icon">
              <div className="login-shield-icon">
                <Shield className="shield-icon" />
              </div>
            </div>
            
            <h1 className="login-title">Portale Rimborsi</h1>
            
            <p className="login-subtitle">
              Accedi al sistema gestionale EasyFlyRefund
            </p>
          </div>

          {/* Brand reminder */}
          <div className="login-brand-reminder">
            <div className="login-brand-icon">
              <Plane className="plane-icon-small" />
            </div>
            <span className="login-brand-text">EasyFlyRefund</span>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="login-error-alert">
              <AlertCircle className="error-alert-icon" />
              <div className="error-alert-content">
                <p className="error-alert-title">Errore di autenticazione</p>
                <p className="error-alert-message">{loginError}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="login-form">
            {/* Username Field */}
            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Nome Utente
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <User className="input-icon" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={`login-input ${errors.username ? 'login-input-error' : ''}`}
                  placeholder="Inserisci il tuo nome utente"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="login-error-message">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-container">
                <div className="login-input-icon">
                  <Lock className="input-icon" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className={`login-input login-input-password ${errors.password ? 'login-input-error' : ''}`}
                  placeholder="Inserisci la tua password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <div className="login-password-toggle">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="toggle-icon" />
                    ) : (
                      <Eye className="toggle-icon" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="login-error-message">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="login-options">
              <div className="login-remember">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="login-checkbox"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="login-checkbox-label">
                  Ricordami
                </label>
              </div>
              <div className="login-forgot">
                <a href="#" className="login-forgot-link">
                  Password dimenticata?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`login-submit-btn ${isLoading ? 'login-submit-loading' : ''}`}
            >
              {isLoading ? (
                <div className="login-loading-content">
                  <div className="login-spinner"></div>
                  <span>Accesso in corso...</span>
                </div>
              ) : (
                <span>Accedi al Portale</span>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p className="login-footer-text">
              Sistema protetto da autenticazione sicura
            </p>
            <div className="login-security-indicator">
              <div className="security-dot"></div>
              <span className="security-text">Connessione sicura</span>
            </div>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="login-security-info">
          <p className="security-info-text">
            Accesso riservato esclusivamente al personale autorizzato
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;