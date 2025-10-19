// Translations (unchanged)
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
        logout: "تسجيل الخروج",
        commentPlaceholder: "اكتب تعليقك...",
        sendComment: "إرسال",
        delete: "حذف",
        makePrivate: "جعل خاص",
        block: "حظر",
        unblock: "إلغاء الحظر"
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
        logout: "Logout",
        commentPlaceholder: "Write your comment...",
        sendComment: "Send",
        delete: "Delete",
        makePrivate: "Make Private",
        block: "Block",
        unblock: "Unblock"
    }
};

let currentLang = 'ar';
let currentTheme = 'dark';

// Language Toggle
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.setAttribute('data-lang', currentLang);
    document.documentElement.setAttribute('lang', currentLang);
    updateTexts();
}

// Update Texts
function updateTexts() {
    const t = translations[currentLang];
    document.getElementById('app-title').textContent = t.appTitle;
    document.getElementById('auth-title').textContent = t.authTitle;
    document.getElementById('login-btn').textContent = t.loginBtn;
    document.getElementById('google-btn').textContent = t.googleBtn;
    document.getElementById('auth-switch').innerHTML = t.authSwitch.replace('إنشاء حساب', `<a href="#" onclick="showSignup()">${t.signupBtn}</a>`);
    document.getElementById('signup-btn').textContent = t.signupBtn;
    document.getElementById('signup-switch').innerHTML = t.signupSwitch.replace('تسجيل الدخول', `<a href="#" onclick="showLogin()">${t.loginBtn}</a>`);
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

// Auth State Listener
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        showFeed();
    } else {
        showAuth();
    }
});

// Auth Functions
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        alert('Logged in successfully!');
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        alert('Account created successfully!');
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
});

document.getElementById('google-btn').addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await firebase.auth().signInWithPopup(provider);
        alert('Signed in with Google!');
    } catch (error) {
        alert('Google sign-in failed: ' + error.message);
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
    firebase.auth().signOut();
    showAuth();
}

// Section Navigation
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
    document.getElementById('personal-link').textContent = `${window.location.origin}/message/${firebase.auth().currentUser.uid}`;
}

// Modal Functions
function openModal() {
    document.getElementById('new-post-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('new-post-modal').style.display = 'none';
    document.getElementById('post-text').value = '';
    document.getElementById('image-upload').value = '';
    document.getElementById('text-on-image-canvas').style.display = 'none';
}

// Post Functions
async function publishPost() {
    const text = document.getElementById('post-text').value;
    const file = document.getElementById('image-upload').files[0];
    let imageUrl = null;

    if (file) {
        const canvas = document.getElementById('text-on-image-canvas');
        if (canvas.style.display !== 'none') {
            // Upload canvas as image
            canvas.toBlob(async (blob) => {
                const ref = firebase.storage().ref().child(`posts/${Date.now()}.png`);
                await ref.put(blob);
                imageUrl = await ref.getDownloadURL();
                await savePost(text, imageUrl);
            });
        } else {
            // Upload original image
            const ref = firebase.storage().ref().child(`posts/${Date.now()}.png`);
            await ref.put(file);
            imageUrl = await ref.getDownloadURL();
            await savePost(text, imageUrl);
        }
    } else {
        await savePost(text, imageUrl);
    }
    closeModal();
    loadPosts();
}

async function savePost(text, imageUrl) {
    await firebase.firestore().collection('posts').add({
        text,
        imageUrl,
        userId: firebase.auth().currentUser.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        private: false
    });
    alert('Post published!');
}

function addTextToImage() {
    const file = document.getElementById('image-upload').files[0];
    if (!file) return alert('Select an image first.');
    const canvas = document.getElementById('text-on-image-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(document.getElementById('post-text').value, 50, 50);
        canvas.style.display = 'block';
    };
    img.src = URL.createObjectURL(file);
}

// Load Posts
async function loadPosts() {
    const postsRef = firebase.firestore().collection('posts').where('private', '==', false).orderBy('timestamp', 'desc');
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
            <button onclick="viewComments('${doc.id}')">${translations[currentLang].commentPlaceholder.replace('Write', 'View')}</button>
        `;
        container.appendChild(card);
    });
}

// Load User Posts
async function loadUserPosts() {
    const userId = firebase.auth().currentUser.uid;
    const postsRef = firebase.firestore().collection('posts').where('userId', '==', userId).orderBy('timestamp', 'desc');
    const snapshot = await postsRef.get();
    const container = document.getElementById('user-posts');
    container.innerHTML = '';
    snapshot.forEach(doc => {
        const post = doc.data();
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <p>${post.text}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" style="max-width: 100%;">` : ''}
            <button onclick="deletePost('${doc.id}')">${translations[currentLang].delete}</button>
            <button onclick="togglePrivate('${doc.id}', ${post.private})">${post.private ? translations[currentLang].unblock : translations[currentLang].makePrivate}</button>
        `;
        container.appendChild(card);
    });
}

// View Comments (Private to post creator)
async function viewComments(postId) {
    const userId = firebase.auth().currentUser.uid;
    const postDoc = await firebase.firestore().collection('posts').doc(postId).get();
    if (postDoc.data().userId !== userId) return alert('Access denied.');
    const commentsRef = firebase.firestore().collection('posts').doc(postId).collection('comments');
    const snapshot = await commentsRef.get();
    let commentsHtml = '<h3>Comments</h3>';
    snapshot.forEach(doc => {
        const comment = doc.data();
        commentsHtml += `<p>${comment.text} <button onclick="deleteComment('${postId}', '${doc.id}')">${translations[currentLang].delete}</button></p>`;
    });
    commentsHtml += `<textarea placeholder="${translations[currentLang].commentPlaceholder}"></textarea><button onclick="sendComment('${postId}')">${translations[currentLang].sendComment}</button>`;
    document.getElementById('posts-container').innerHTML = commentsHtml; // Simple overlay; can be improved with a modal
}

// Send Comment
async function sendComment(postId) {
    const text = document.querySelector('textarea').value;
    await firebase.firestore().collection('posts').doc(postId).collection('comments').add({
        text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    viewComments(postId);
}

// Delete Post
async function deletePost(postId) {
    await firebase.firestore().collection('posts').doc(postId).delete();
    loadUserPosts();
}

// Toggle Private
async function togglePrivate(postId, isPrivate) {
    await firebase.firestore().collection('posts').doc(postId).update({ private: !isPrivate });
    loadUserPosts();
}

// Delete Comment
async function deleteComment(postId, commentId) {
    await firebase.firestore().collection('posts').doc(postId).collection('comments').doc(commentId).delete();
    viewComments(postId);
}

// Copy Link
function copyLink() {
    const link = document.getElementById('personal-link').textContent;
    navigator.clipboard.writeText(link);
    alert('Link copied!');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    currentTheme = 'dark';
    document.documentElement.setAttribute('data-theme', 'dark');
    updateTexts();
});
