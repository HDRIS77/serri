// Translations
const translations = {
    ar: {
        appTitle: "Serri",
        authTitle: "تسجيل الدخول",
        loginBtn: "تسجيل الدخول",
        googleBtn: "تسجيل الدخول بـ Google",
        authSwitch: "ليس لديك حساب؟ إنشاء حساب",
        signupBtn: "إنشاء حساب",
        signupSwitch: "لديك حساب؟ تسجيل الدخول",
        profileTitle: "ملفي الشخصي",
        profileLink: "رابطك الشخصي:",
        copy: "نسخ",
        newPostTitle: "منشور جديد",
        postText: "اكتب منشورك...",
        addTextBtn: "إضافة نص على الصورة",
        publish: "نشر",
        feed: "المنشورات",
        profile: "الملف الشخصي",
        logout: "تسجيل الخروج"
    },
    en: {
        appTitle: "Serri",
        authTitle: "Login",
        loginBtn: "Login",
        googleBtn: "Sign in with Google",
        authSwitch: "No account? Sign up",
        signupBtn: "Sign Up",
        signupSwitch: "Have an account? Login",
        profileTitle: "My Profile",
        profileLink: "Your personal link:",
        copy: "Copy",
        newPostTitle: "New Post",
        postText: "Write your post...",
        addTextBtn: "Add text to image",
        publish: "Publish",
        feed: "Feed",
        profile: "Profile",
        logout: "Logout"
    }
};

let currentLang = 'ar';
let currentTheme = 'light';

// Language Toggle
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.setAttribute('data-lang', currentLang);
    document.documentElement.setAttribute('lang', currentLang);
    updateTexts();
}

function updateTexts() {
    const t = translations[currentLang];
    document.getElementById('app-title').textContent = t.appTitle;
    document.getElementById('auth-title').textContent = t.authTitle;
    document.getElementById('login-btn').textContent = t.loginBtn;
    document.getElementById('google-btn').textContent = t.googleBtn;
    document.getElementById('auth-switch').innerHTML = t.authSwitch;
    document.getElementById('signup-btn').textContent = t.signupBtn;
    document.getElementById('signup-switch').innerHTML = t.signupSwitch;
    document.getElementById('profile-title').textContent = t.profileTitle;
    document.getElementById('profile-link').textContent = t.profileLink;
    document.querySelector('#profile-link button').textContent = t.copy;
    document.getElementById('new-post-title').textContent = t.newPostTitle;
    document.getElementById('post-text').placeholder = t.postText;
    document.getElementById('add-text-btn').textContent = t.addTextBtn;
    document.querySelector('#new-post-modal button:last-child').textContent = t.publish;
    document.querySelector('nav button:nth-child(1)').textContent = t.feed;
    document.querySelector('nav button:nth-child(2)').textContent = t.profile;
    document.querySelector('nav button:nth-child(3)').textContent = t.logout;
}

// Theme Toggle
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.getElementById('theme-toggle').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// Auth
auth.onAuthStateChanged(user => {
    if (user) {
        showFeed();
    } else {
        showAuth();
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('google-btn').addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        alert(error.message);
    }
});

function showSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function logout() {
    auth.signOut();
    showAuth();
}

// Sections
function showAuth() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('feed-section').style.display = 'none';
    document.getElementById('profile-section').style.display = 'none';
}

function showFeed() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('feed-section').style.display = 'block';
    document.getElementById('profile-section').style.display = 'none';
    loadPosts();
}

function showProfile() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('feed-section').style.display = 'none';
    document.getElementById('profile-section').style.display = 'block';
    loadUserPosts();
    document.getElementById('personal-link').textContent = `${window.location.origin}/message/${auth.currentUser.uid}`;
}

// Posts
async function loadPosts() {
    const postsRef = db.collection('posts').where('private', '==', false);
    const snapshot = await postsRef.get();
    const container = document.getElementById('posts-container');
    container.innerHTML = '';
    snapshot.forEach(doc => {
        const post = doc.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <p>${post.text}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" style="max-width: 100%;">` : ''}
            <button onclick="viewComments('${doc.id}')">عرض التعليقات</button