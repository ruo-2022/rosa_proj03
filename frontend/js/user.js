// 檔案位置: frontend/js/user.js (已升級)

document.addEventListener("DOMContentLoaded", async () => {
    const userNameEl = document.querySelector("#user-name");
    const userEmailEl = document.querySelector("#user-email");
    const signinButton = document.querySelector("#signin-button");
    const signinMessage = document.querySelector("#signin-message");
    const checkinGrid = document.querySelector("#checkin-grid");

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert("請先登入！");
        window.location.href = '/pages/login.html';
        return;
    }

    if (userNameEl) userNameEl.textContent = user.name;
    if (userEmailEl) userEmailEl.textContent = user.email;

    // --- 新的簽到邏輯 ---
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    
    // 獲取簽到歷史並渲染日曆
    async function renderCheckinGrid() {
        try {
            const response = await fetch(`http://localhost:3007/signin/history/${user.id}`);
            const checkedDates = await response.json(); // ['2025-09-15', '2025-09-17']

            checkinGrid.innerHTML = ''; // 清空
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                
                const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
                const day = date.getDate();
                const weekday = weekdays[date.getDay()];
                
                const isChecked = checkedDates.includes(dateString);
                const isToday = i === 0;

                const cell = document.createElement('div');
                cell.className = 'day-cell';
                cell.dataset.date = dateString;
                if (isChecked) cell.classList.add('checked');
                if (isToday) cell.classList.add('today');

                cell.innerHTML = `
                    <span class="weekday">${weekday}</span>
                    <span class="date-num">${day}</span>
                    <div class="stamp">👍</div>
                `;
                checkinGrid.appendChild(cell);

                // 如果今天已簽到，禁用按鈕
                if (isToday && isChecked) {
                    signinButton.disabled = true;
                    signinButton.textContent = '今日已簽到';
                }
            }
        } catch (error) {
            console.error("無法獲取簽到紀錄:", error);
            checkinGrid.innerHTML = "無法載入紀錄";
        }
    }

    // 簽到按鈕點擊事件
    if (signinButton) {
        signinButton.addEventListener('click', async () => {
            try {
                signinButton.disabled = true;
                signinMessage.textContent = '簽到中...';
                
                const response = await fetch("http://localhost:3007/signin", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user.id }),
                });

                const result = await response.json();

                if (response.ok) {
                    signinMessage.textContent = result.message || "簽到成功！";
                    signinMessage.style.color = 'green';
                    // 找到今天的格子並加上印章特效
                    const todayString = new Date().toISOString().split('T')[0];
                    const todayCell = document.querySelector(`.day-cell[data-date="${todayString}"]`);
                    if (todayCell) {
                        todayCell.classList.add('checked');
                    }
                    signinButton.textContent = '今日已簽到';
                } else {
                    throw new Error(result.error || '簽到失敗');
                }
            } catch (error) {
                console.error("簽到失敗:", error);
                signinMessage.textContent = error.message;
                signinMessage.style.color = 'red';
                signinButton.disabled = false;
            }
        });
    }

    // 初始渲染
    await renderCheckinGrid();
});