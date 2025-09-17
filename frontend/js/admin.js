// 檔案位置: frontend/js/admin.js (已增加登入檢查)

document.addEventListener("DOMContentLoaded", () => {
    // 【新功能】檢查登入狀態
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("您沒有權限訪問此頁面，請先登入！");
        window.location.href = '/pages/login.html';
        return; // 中斷後續程式碼執行
    }
    
    // 原有的程式碼繼續...
    const productForm = document.querySelector("#product-form");
    const productTableBody = document.querySelector("#product-table-body");
    // ... (後續所有程式碼不變，我只貼出開頭的改動)

    const formTitle = document.querySelector("#form-title");
    const submitButton = document.querySelector("#submit-button");
    const cancelEditButton = document.querySelector("#cancel-edit-button");
    const productIdInput = document.querySelector("#product-id");

    const API_URL = "http://localhost:3007";

    // 獲取並顯示所有商品
    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            const products = await response.json();
            productTableBody.innerHTML = ''; // 清空列表
            products.forEach(product => {
                const row = `
                    <tr data-id="${product.id}">
                        <td><img src="${API_URL}${product.image}" alt="${product.name}" width="50"></td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>
                            <button class="edit-btn">編輯</button>
                            <button class="delete-btn">刪除</button>
                        </td>
                    </tr>
                `;
                productTableBody.innerHTML += row;
            });
        } catch (error) {
            console.error("無法獲取商品:", error);
        }
    }

    // 重設表單至「新增」狀態
    function resetForm() {
        productForm.reset();
        productIdInput.value = '';
        formTitle.textContent = "新增商品";
        submitButton.textContent = "新增商品";
        cancelEditButton.style.display = "none";
    }

    // 表單提交處理 (新增或更新)
    productForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const id = productIdInput.value;
        const isEditing = !!id; 

        const formData = new FormData();
        formData.append('name', document.querySelector("#name").value);
        formData.append('price', document.querySelector("#price").value);
        formData.append('description', document.querySelector("#description").value);
        const imageFile = document.querySelector("#image").files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        const url = isEditing ? `${API_URL}/products/${id}` : `${API_URL}/products`;
       
        try {
            let response;
            if (isEditing) {
                const updateData = {
                    name: formData.get('name'),
                    price: formData.get('price'),
                    description: formData.get('description'),
                };
                 response = await fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData),
                });
            } else {
                response = await fetch(url, {
                    method: 'POST',
                    body: formData, 
                });
            }

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '操作失敗');
            }

            alert(`商品已成功${isEditing ? '更新' : '新增'}！`);
            resetForm();
            fetchAndRenderProducts(); 

        } catch (error) {
            alert(`錯誤: ${error.message}`);
        }
    });

    // 處理編輯和刪除按鈕的點擊
    productTableBody.addEventListener("click", async (e) => {
        const target = e.target;
        const row = target.closest("tr");
        if (!row) return; // 如果點擊的不是 row 裡面的東西就忽略
        const id = row.dataset.id;

        // 刪除按鈕
        if (target.classList.contains("delete-btn")) {
            if (confirm(`確定要刪除 ID 為 ${id} 的商品嗎？`)) {
                try {
                    const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('刪除失敗');
                    alert("刪除成功！");
                    fetchAndRenderProducts();
                } catch (error) {
                    alert(`錯誤: ${error.message}`);
                }
            }
        }

        // 編輯按鈕
        if (target.classList.contains("edit-btn")) {
            const name = row.children[1].textContent;
            const price = row.children[2].textContent;
            document.querySelector("#name").value = name;
            document.querySelector("#price").value = price;
            document.querySelector("#description").value = ''; 
            productIdInput.value = id;
            formTitle.textContent = `正在編輯商品 #${id}`;
            submitButton.textContent = "更新商品";
            cancelEditButton.style.display = "inline-block";
            window.scrollTo(0, 0); 
        }
    });
    
    cancelEditButton.addEventListener("click", resetForm);

    fetchAndRenderProducts();
});