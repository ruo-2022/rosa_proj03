// 檔案位置: frontend/js/login.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login-form");
    const messageContainer = document.querySelector("#message-container");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            messageContainer.textContent = '';
            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;

            try {
                const response = await fetch("http://localhost:3007/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    // 登入成功
                    messageContainer.textContent = "登入成功！正在跳轉至首頁...";
                    messageContainer.style.color = 'green';
                    // 這裡可以將用戶資訊存起來，例如存到 localStorage
                    localStorage.setItem('user', JSON.stringify(result));
                    
                    setTimeout(() => {
                        // 成功後跳轉到首頁，請確認您的首頁路徑
                        window.location.href = '/index.html'; 
                    }, 1500);

                } else {
                    // 登入失敗
                    messageContainer.textContent = `登入失敗：${result.error}`;
                    messageContainer.style.color = 'red';
                }
            } catch (error) {
                console.error("登入請求失敗:", error);
                messageContainer.textContent = "發生錯誤，請稍後再試。";
                messageContainer.style.color = 'red';
            }
        });
    }
});