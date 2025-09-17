// 檔案位置: frontend/js/global.js (已更新，會自動產生頁腳)

// 更新購物車圖示數量的通用函數
function updateCartIcon() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartIcon = document.querySelector("#cart-count");
    if (cartIcon) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartIcon.textContent = totalItems;
            cartIcon.style.display = 'flex';
        } else {
            cartIcon.style.display = 'none';
        }
    }
}

// 產生並插入頁腳的函數
function injectFooter() {
    const footerHTML = `
        <footer class="main-footer">
            <p>&copy; 2025 ROSA. All Rights Reserved.</p>
            <p><a href="/pages/admin.html">後台管理</a></p>
        </footer>
    `;
    // 將頁腳插入到 body 的結尾
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

document.addEventListener("DOMContentLoaded", () => {
    // --- 處理導覽列 ---
    const navContainer = document.querySelector("#navbar-container");
    const user = JSON.parse(localStorage.getItem('user'));
    let navHTML = '';
    if (user) {
        navHTML = `
            <nav class="main-nav">
                <div class="nav-logo"><a href="/index.html">ROSA</a></div>
                <ul class="nav-links">
                    <li><a href="/pages/user.html">Hi, ${user.name}</a></li>
                    <li class="cart-icon-wrapper">
                        <a href="/pages/shoppingcart.html">購物車</a>
                        <span id="cart-count">0</span>
                    </li>
                    <li><a href="#" id="logout-button">登出</a></li>
                </ul>
            </nav>
        `;
    } else {
        navHTML = `
             <nav class="main-nav">
                <div class="nav-logo"><a href="/index.html">ROSA</a></div>
                <ul class="nav-links">
                    <li><a href="/pages/login.html">登入</a></li>
                    <li><a href="/pages/register.html">註冊</a></li>
                </ul>
            </nav>
        `;
    }
    if (navContainer) {
        navContainer.innerHTML = navHTML;
    }
    
    updateCartIcon();

    const logoutButton = document.querySelector("#logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            alert("您已成功登出！");
            window.location.href = '/pages/login.html';
        });
    }

    // --- 處理頁腳 ---
    injectFooter();
});