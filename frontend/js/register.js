// 檔案位置: frontend/js/register.js (已修正跳轉路徑)

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector("#register-form");
    const messageContainer = document.querySelector("#message-container");

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault(); 
            messageContainer.textContent = '';
            messageContainer.style.color = 'black';
            const name = document.querySelector("#name").value;
            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;
            const formData = { name, email, password };

            try {
                const response = await fetch("http://localhost:3007/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();
                if (response.ok) {
                    messageContainer.textContent = "註冊成功！2秒後將自動跳轉至登入頁面...";
                    messageContainer.style.color = 'green';
                    setTimeout(() => {
                        // 【已修正】這裡的路徑加上了 /pages/
                        window.location.href = '/pages/login.html'; 
                    }, 2000);
                } else {
                    messageContainer.textContent = `註冊失敗：${result.error}`;
                    messageContainer.style.color = 'red';
                }
            } catch (error) {
                console.error("註冊請求失敗:", error);
                messageContainer.textContent = "發生錯誤，請稍後再試。";
                messageContainer.style.color = 'red';
            }
        });
    }
});