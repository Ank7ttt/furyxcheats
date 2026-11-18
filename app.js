// =============================================
//  CONFIG
// =============================================
const ADMIN_USER = "ANKIT";
const ADMIN_PASS = "ANKIT@1234@0055";

// =============================================
//  USER STORAGE
// =============================================
function getUsers() { return JSON.parse(localStorage.getItem('portalUsers') || '[]'); }
function saveUsers(u) { localStorage.setItem('portalUsers', JSON.stringify(u)); }
function userExists(uname) { return getUsers().some(u => u.username.toLowerCase() === uname.toLowerCase()); }

// =============================================
//  PAGE SWITCHER
// =============================================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  if (pageId === 'adminPage') loadAdminTable();
}

// =============================================
//  INIT
// =============================================
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('loggedIn') === 'true') {
    showDashboard(sessionStorage.getItem('currentUser') || 'User');
    return;
  }
  const saved = localStorage.getItem('rememberedUser');
  if (saved) {
    document.getElementById('username').value = saved;
    document.getElementById('rememberMe').checked = true;
  }
});

// =============================================
//  LOGIN
// =============================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const uname = document.getElementById('username').value.trim();
  const pass  = document.getElementById('password').value;
  const rem   = document.getElementById('rememberMe').checked;
  const err   = document.getElementById('loginError');
  const btn   = document.querySelector('#loginForm .btn-login');

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  btn.disabled  = true;

  setTimeout(() => {
    // Admin check
    if (uname === ADMIN_USER && pass === ADMIN_PASS) {
      if (rem) localStorage.setItem('rememberedUser', uname);
      else localStorage.removeItem('rememberedUser');
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('currentUser', uname);
      sessionStorage.setItem('isAdmin', 'true');
      showDashboard(uname);
      return;
    }
    // User check
    const found = getUsers().find(u => u.username === uname && u.password === pass);
    if (found) {
      err.textContent = '';
      if (rem) localStorage.setItem('rememberedUser', uname);
      else localStorage.removeItem('rememberedUser');
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('currentUser', uname);
      sessionStorage.setItem('isAdmin', 'false');
      showDashboard(uname);
    } else {
      err.textContent = '❌ Wrong username or password!';
      btn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
      btn.disabled  = false;
      shake('#loginPage .login-box');
    }
  }, 800);
});

// =============================================
//  REGISTER
// =============================================
document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const uname   = document.getElementById('regUsername').value.trim();
  const pass    = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const msg     = document.getElementById('regMsg');
  const btn     = document.querySelector('#registerForm .btn-login');

  msg.style.color = '#ef4444';
  if (uname.toLowerCase() === ADMIN_USER.toLowerCase()) { msg.textContent = '❌ Yeh username reserved hai!'; return; }
  if (pass.length < 4) { msg.textContent = '❌ Password kam se kam 4 characters ka hona chahiye!'; return; }
  if (pass !== confirm) { msg.textContent = '❌ Passwords match nahi kar rahe!'; return; }
  if (userExists(uname)) { msg.textContent = '❌ Username pehle se le liya gaya hai!'; return; }

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
  btn.disabled  = true;

  setTimeout(() => {
    const users = getUsers();
    users.push({ username: uname, password: pass });
    saveUsers(users);
    msg.style.color = '#22c55e';
    msg.textContent = '✅ Account ban gaya! Login karo.';
    btn.innerHTML   = '<span>Register</span><i class="fas fa-user-plus"></i>';
    btn.disabled    = false;
    setTimeout(() => {
      showPage('loginPage');
      document.getElementById('username').value = uname;
    }, 1200);
  }, 800);
});

// =============================================
//  SHOW DASHBOARD
// =============================================
function showDashboard(username) {
  showPage('dashboardPage');
  document.getElementById('welcomeText').textContent = `Welcome, ${capitalize(username)}! 👋`;
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  document.getElementById('adminBtn').classList.toggle('hidden', !isAdmin);
  const btn = document.querySelector('#loginForm .btn-login');
  btn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
  btn.disabled  = false;
}

// =============================================
//  LOGOUT
// =============================================
function logout() {
  sessionStorage.clear();
  document.getElementById('loginForm').reset();
  document.getElementById('loginError').textContent = '';
  showPage('loginPage');
}

// =============================================
//  ADMIN — TABLE
// =============================================
function loadAdminTable() {
  const tbody = document.getElementById('usersTableBody');
  const users = getUsers();
  tbody.innerHTML = `<tr>
    <td>1</td>
    <td><i class="fas fa-crown" style="color:#f59e0b;"></i> ${ADMIN_USER}</td>
    <td><span class="badge-admin">Admin</span></td>
    <td>—</td>
  </tr>`;
  if (!users.length) {
    tbody.innerHTML += `<tr><td colspan="4" style="text-align:center;color:#555;padding:16px;">Koi user registered nahi hai abhi</td></tr>`;
    return;
  }
  users.forEach((u, i) => {
    tbody.innerHTML += `<tr>
      <td>${i + 2}</td>
      <td><i class="fas fa-user" style="color:#818cf8;margin-right:6px;"></i>${u.username}</td>
      <td><span class="badge-user">User</span></td>
      <td><button class="btn-delete" onclick="adminDeleteUser('${u.username}')"><i class="fas fa-trash"></i> Delete</button></td>
    </tr>`;
  });
}

// =============================================
//  ADMIN — ADD USER
// =============================================
function adminAddUser() {
  const uname = document.getElementById('adminNewUser').value.trim();
  const pass  = document.getElementById('adminNewPass').value;
  const msg   = document.getElementById('adminMsg');
  msg.style.color = '#ef4444';
  if (!uname || !pass) { msg.textContent = '❌ Dono fields bharo!'; return; }
  if (uname.toLowerCase() === ADMIN_USER.toLowerCase()) { msg.textContent = '❌ Reserved username!'; return; }
  if (userExists(uname)) { msg.textContent = '❌ Username pehle se exist karta hai!'; return; }
  const users = getUsers(); users.push({ username: uname, password: pass }); saveUsers(users);
  msg.style.color = '#22c55e';
  msg.textContent = `✅ User "${uname}" add ho gaya!`;
  document.getElementById('adminNewUser').value = '';
  document.getElementById('adminNewPass').value = '';
  loadAdminTable();
}

// =============================================
//  ADMIN — DELETE USER
// =============================================
function adminDeleteUser(username) {
  if (!confirm(`"${username}" ko delete karna chahte ho?`)) return;
  saveUsers(getUsers().filter(u => u.username !== username));
  loadAdminTable();
}

// =============================================
//  UTILS
// =============================================
function togglePassword(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (input.type === 'password') { input.type = 'text'; icon.classList.replace('fa-eye', 'fa-eye-slash'); }
  else { input.type = 'password'; icon.classList.replace('fa-eye-slash', 'fa-eye'); }
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function shake(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'shake 0.4s ease';
}

const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}
    40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}
  }`;
document.head.appendChild(style);
