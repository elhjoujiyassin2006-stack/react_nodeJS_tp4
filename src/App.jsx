import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://tp4-nodejs-rest-api-cvs8.vercel.app";

function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 📌 Inscription
  const register = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!username || !email || !password) {
      setMessage("Tous les champs sont requis");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${API_URL}/register`, { username, email, password });
      setMessage("✅ Inscription réussie ! Vous pouvez vous connecter.");
      setUsername("");
      setEmail("");
      setPassword("");
      setTimeout(() => setIsLoginView(true), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Erreur lors de l'inscription");
    }
    setIsLoading(false);
  };

  // 📌 Connexion
  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (!email || !password) {
      setMessage("Email et mot de passe requis");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const token = res.data.token;
      setToken(token);
      localStorage.setItem("token", token);
      setMessage("✅ Connexion réussie !");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Email ou mot de passe incorrect");
    }
    setIsLoading(false);
  };

  // 📌 Récupérer le profil
  const getProfile = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Accès refusé !");
      if (err.response?.status === 401) {
        logout();
      }
    }
    setIsLoading(false);
  };

  // 📌 Déconnexion
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setProfile(null);
    setMessage("Déconnecté !");
  };

  // Switch between login and register views
  const switchView = () => {
    setIsLoginView(!isLoginView);
    setMessage("");
    setEmail("");
    setPassword("");
    setUsername("");
  };

  return (
    <div className="container">
      <h1>🔐 Authentification JWT</h1>

      {!token ? (
        <div className="auth-container">
          <div className="tabs">
            <button
              className={isLoginView ? "tab active" : "tab"}
              onClick={() => setIsLoginView(true)}
            >
              Connexion
            </button>
            <button
              className={!isLoginView ? "tab active" : "tab"}
              onClick={() => setIsLoginView(false)}
            >
              Inscription
            </button>
          </div>

          {isLoginView ? (
            <form className="form-container" onSubmit={login}>
              <h2>Se connecter</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Connexion..." : "Se connecter"}
              </button>
              <p className="switch-text">
                Pas de compte ? <span onClick={switchView}>S'inscrire</span>
              </p>
            </form>
          ) : (
            <form className="form-container" onSubmit={register}>
              <h2>S'inscrire</h2>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Inscription..." : "S'inscrire"}
              </button>
              <p className="switch-text">
                Déjà un compte ? <span onClick={switchView}>Se connecter</span>
              </p>
            </form>
          )}
        </div>
      ) : (
        <div className="dashboard">
          <div className="dashboard-header">
            <h2>👋 Tableau de bord</h2>
            <button onClick={logout} className="logout-btn">
              🚪 Déconnexion
            </button>
          </div>

          {!profile ? (
            <div className="welcome">
              <h2>Bienvenue !</h2>
              <p>Accédez à votre espace personnel sécurisé.</p>
              <button onClick={getProfile} className="profile-btn" disabled={isLoading}>
                {isLoading ? "⏳ Chargement..." : "📋 Voir mon profil"}
              </button>
            </div>
          ) : (
            <div className="profile">
              <h2>Mon Profil</h2>
              <div className="profile-card">
                <div className="profile-row">
                  <div className="profile-row-icon">👤</div>
                  <div className="profile-row-content">
                    <span className="profile-row-label">Nom d'utilisateur</span>
                    <span className="profile-row-value">{profile.username}</span>
                  </div>
                </div>
                <div className="profile-row">
                  <div className="profile-row-icon">📧</div>
                  <div className="profile-row-content">
                    <span className="profile-row-label">Adresse e-mail</span>
                    <span className="profile-row-value">{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {message && <p className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</p>}
    </div>
  );
}

export default App;
