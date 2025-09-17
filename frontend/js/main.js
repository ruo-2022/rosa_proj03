// 檔案位置: frontend/js/main.js (已更新)

document.addEventListener("DOMContentLoaded", async () => {
    const productListContainer = document.querySelector("#product-list");

    // "加入購物車" 的處理邏輯
    function handleAddToCart(productId) {
        console.log(`Adding product ${productId} to cart`);
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // 檢查商品是否已在購物車中
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            // 如果在，數量+1
            existingItem.quantity++;
        } else {
            // 如果不在，新增商品
            cart.push({ productId: productId, quantity: 1 });
        }
        
        // 將更新後的購物車存回 localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // 彈出提示
        alert("商品已加入購物車！");
        
        // 更新導覽列上的購物車圖示
        // 確保 global.js 中的 updateCartIcon 函數是可訪問的
        if (typeof updateCartIcon === 'function') {
            updateCartIcon();
        }
    }

    if (productListContainer) {
        // 監聽整個列表的點擊事件 (事件委派)
        productListContainer.addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('add-to-cart-btn')) {
                const user = localStorage.getItem('user');
                if (!user) {
                    alert('請先登入會員！');
                    window.location.href = '/pages/login.html';
                    return;
                }
                const productId = parseInt(event.target.dataset.productId);
                handleAddToCart(productId);
            }
        });
        
        // 從後端載入商品
        try {
            const response = await fetch("http://localhost:3007/products");
            if (!response.ok) throw new Error('無法獲取商品列表');
            const products = await response.json();
            if (products.length === 0) {
                productListContainer.innerHTML = "<p>目前沒有任何商品。</p>";
                return;
            }

            const productsHTML = products.map(product => `
                <div class="product-card">
                    <img src="http://localhost:3007${product.image}" alt="${product.name}" class="product-image">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <p class="product-price">$${product.price}</p>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">加入購物車</button>
                </div>
            `).join('');

            productListContainer.innerHTML = productsHTML;
        } catch (error) {
            console.error("載入商品失敗:", error);
            productListContainer.innerHTML = "<p>載入商品失敗，請稍後再試。</p>";
        }
    }
});