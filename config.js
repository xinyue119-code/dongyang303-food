// 东阳303 设置：Firebase 网页配置 + 谁能修改
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyC79kynXY6JbaLIaDzdXq9HWsiLbXm35cU",
  authDomain: "dongyang303-f377d.firebaseapp.com",
  projectId: "dongyang303-f377d",
  storageBucket: "dongyang303-f377d.firebasestorage.app",
  messagingSenderId: "508776532029",
  appId: "1:508776532029:web:f8ad2f1e4736f7802f4254"
};
// 只有这个邮箱登录时可以录入和修改；其他被允许的账号只能查看
window.OWNER_EMAIL = "yangxinyue119@gmail.com";
// 这些账号都能录入和修改（数据库规则 firestore.rules 里也要是同一份名单）；不在名单里的只能看
window.EDITOR_EMAILS = ["yangxinyue119@gmail.com", "zhangluxin08@gmail.com"];
