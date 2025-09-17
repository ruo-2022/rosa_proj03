// 檔案位置: frontend/js/shoppingcart.js

document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("請先登入！");
        window.location.href = '/pages/login.html';
        return;
    }

    const cartContainer = document.querySelector("#cart-container");
    const cartSummary = document.querySelector("#cart-summary");

    async function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>您的購物車是空的。</p>";
            cartSummary.innerHTML = '';
            return;
        }

        try {
            const productIds = cart.map(item => item.productId);
            const response = await fetch("http://localhost:3007/products/batch", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: productIds }),
            });
            const products = await response.json();

            let total = 0;
            const cartHTML = products.map(product => {
                const cartItem = cart.find(item => item.productId === product.id);
                total += product.price * cartItem.quantity;
                return `
                    <div class="cart-item" data-product-id="${product.id}">
                        <img src="http://localhost:3007${product.image}" alt="${product.name}">
                        <div class="item-details">
                            <h4>${product.name}</h4>
                            <p>數量: ${cartItem.quantity}</p>
                            <p>單價: $${product.price}</p>
                        </div>
                        <button class="remove-item-btn">移除</button>
                    </div>
                `;
            }).join('');
            
            cartContainer.innerHTML = cartHTML;
            cartSummary.innerHTML = `
                <h3>總計: $${total}</h3>
                <button id="checkout-btn">前往結帳</button>
            `;

        } catch (error) {
            console.error("無法載入購物車:", error);
            cartContainer.innerHTML = "<p>無法載入購物車，請稍後再試。</p>";
        }
    }
    
    // 移除商品
    cartContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item-btn')) {
            const productId = parseInt(event.target.closest('.cart-item').dataset.productId);
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart = cart.filter(item => item.productId !== productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartIcon();
            renderCart();
        }
    });

    // 結帳
    cartSummary.addEventListener('click', async (event) => {
        if (event.target.id === 'checkout-btn') {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                alert("購物車是空的！");
                return;
            }

            try {
                const response = await fetch("http://localhost:3007/orders", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, items: cart }),
                });

                const result = await response.json();
                if (response.ok) {
                    alert("訂單已成功建立！");
                    localStorage.removeItem('cart'); // 清空購物車
                    updateCartIcon();
                    renderCart();
                } else {
                    throw new Error(result.error || "建立訂單失敗");
                }
            } catch (error) {
                alert(`結帳失敗: ${error.message}`);
            }
        }
    });

    renderCart(); // 初始渲染
});