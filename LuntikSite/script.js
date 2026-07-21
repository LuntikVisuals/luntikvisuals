document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("sendBtn");
    const userInput = document.getElementById("userInput");
    const chatArea = document.getElementById("chatArea");
    const downloadBtn = document.getElementById("downloadBtn");
    const timerText = document.getElementById("rouletteTimerText");
    const resultBox = document.getElementById("rouletteResult");

    // --- ЛОГИКА СКАЧИВАНИЯ ---
    downloadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Запуск скачивания лаунчера Luntik Visuals v1.0.0!");
    });

    // --- БАЗА ДАННЫХ НАГРАД И РЕДКОСТЕЙ ---
    const rewards = [
        { name: "Бета на навсегда", rarity: "легендарная", class: "rarity-legendary", chance: 1 },
        { name: "Бета на 180 дней", rarity: "мифическая", class: "rarity-mythic", chance: 5 },
        { name: "Бета на 30 дней", rarity: "эпическая", class: "rarity-epic", chance: 10 },
        { name: "Титул \"Luntik\"", rarity: "секретная", class: "rarity-secret", chance: 10 },
        { name: "Титул \"ht1\"", rarity: "легендарная", class: "rarity-legendary", chance: 10 },
        { name: "Титул \"wardeen\"", rarity: "секретная", class: "rarity-secret", chance: 10 },
        { name: "Титул \"тень\"", rarity: "мифическая", class: "rarity-mythic", chance: 10 },
        { name: "Бета на 10 дней", rarity: "редкая", class: "rarity-rare", chance: 20 },
        { name: "Титул \"горила\"", rarity: "эпическая", class: "rarity-epic", chance: 20 },
        { name: "Упс, не повезло :( Попробуй через 24 часа...", rarity: "обычная", class: "rarity-common", chance: 60 }
    ];

    // --- ПРОВЕРКА БЛОКИРОВКИ 24 ЧАСА ---
    function checkRouletteStatus() {
        const lastClick = localStorage.getItem("luntik_last_spin");
        if (lastClick) {
            const timePassed = Date.now() - parseInt(lastClick);
            const timeLeft = (24 * 60 * 60 * 1000) - timePassed;

            if (timeLeft > 0) {
                disableCards();
                startTimerCountdown(timeLeft);
                const savedReward = JSON.parse(localStorage.getItem("luntik_saved_reward"));
                if (savedReward) {
                    showFinalResult(savedReward);
                }
                return true;
            }
        }
        return false;
    }

    // --- АЛГОРИТМ ДЛЯ ОТКРЫТИЯ КАРТОЧКИ ---
    window.openLotteryCard = function(cardNumber) {
        if (checkRouletteStatus()) return;

        // Фиксируем время нажатия карточки
        localStorage.setItem("luntik_last_spin", Date.now().toString());

        // Расчёт выпадения по шансам
        let roll = Math.random() * 100;
        let selectedReward = rewards[rewards.length - 1]; // По умолчанию неудача
        let currentWeight = 0;

        for (let i = 0; i < rewards.length; i++) {
            currentWeight += rewards[i].chance;
            if (roll <= currentWeight) {
                selectedReward = rewards[i];
                break;
            }
        }

        // Сохраняем выигрыш, чтобы он отображался при обновлении страницы
        localStorage.setItem("luntik_saved_reward", JSON.stringify(selectedReward));

        // Визуальное открытие выбранной карточки
        const clickedCard = document.getElementById(`card${cardNumber}`);
        clickedCard.innerText = selectedReward.name.includes("Упс") ? "❌" : "🎁";
        clickedCard.classList.add("opened", selectedReward.class);

        // Открываем остальные карточки случайными заглушками
        for (let i = 1; i <= 3; i++) {
            if (i !== cardNumber) {
                const fakeCard = document.getElementById(`card${i}`);
                const fakeReward = rewards[Math.floor(Math.random() * rewards.length)];
                fakeCard.innerText = fakeReward.name.includes("Упс") ? "❌" : "🎁";
                fakeCard.classList.add("opened", "rarity-common");
                fakeCard.style.opacity = "0.4";
            }
        }

        showFinalResult(selectedReward);
        checkRouletteStatus();
    };

    function showFinalResult(reward) {
        if (reward.name.includes("Упс")) {
            resultBox.innerHTML = `<span class="${reward.class}">${reward.name}</span>`;
        } else {
            resultBox.innerHTML = `Выигрыш: <span class="${reward.class}">${reward.name} (${reward.rarity})</span>`;
        }
    }

    function disableCards() {
        for (let i = 1; i <= 3; i++) {
            const card = document.getElementById(`card${i}`);
            card.classList.add("opened");
            if (!card.classList.contains("rarity-common") && !localStorage.getItem("luntik_saved_reward")) {
                card.innerText = "🔒";
            }
        }
    }

    function startTimerCountdown(duration) {
        function updateTimer() {
            let seconds = Math.floor((duration / 1000) % 60);
            let minutes = Math.floor((duration / (1000 * 60)) % 60);
            let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

            timerText.innerText = `Следующая прокрутка доступна через: ${hours}ч ${minutes}м ${seconds}с`;
            duration -= 1000;

            if (duration <= 0) {
                clearInterval(timerInterval);
                timerText.innerText = "Испытай свою удачу! Выбери одну из трех закрытых карточек раз в 24 часа и выиграй уникальный титул или подписку.";
                resetRouletteVisuals();
            }
        }
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    }

    function resetRouletteVisuals() {
        localStorage.removeItem("luntik_last_spin");
        localStorage.removeItem("luntik_saved_reward");
        resultBox.innerText = "";
        for (let i = 1; i <= 3; i++) {
            const card = document.getElementById(`card${i}`);
            card.className = "case-card";
            card.innerText = "?";
            card.style.opacity = "1";
        }
    }

    // --- ВЕБ ЧАТ-БОТ ПОДДЕРЖКИ ---
    function sendMessage() {
        const text = userInput.value.trim();
        if (text === "") return;

        appendMessage(`👤 Вы: ${text}`, "user");
        userInput.value = "";

        setTimeout(() => {
            const lowerText = text.toLowerCase();
            let reply = "🤖 Бот: Хм, я не совсем понял твой вопрос. Попробуй использовать ключевые слова: ошибка, вылет, память, привет.";

            if (lowerText.includes("ошибка") || lowerText.includes("main") || lowerText.includes("class") || lowerText.includes("запуск")) {
                reply = "🤖 Бот: Похоже на ошибку ClassNotFound (Fabric)! Это потому, что в сборке .jar не хватает библиотек Fabric. Сейчас мы настраиваем Shadow JAR сборку в Gradle в проекте чит-клиента, скоро это починим!";
            } else if (lowerText.includes("память") || lowerText.includes("ram") || lowerText.includes("лагов") || lowerText.includes("лаг")) {
                reply = "🤖 Бот: Если у тебя лагает игра или вылетает из-за памяти, зайди во вкладку ⚙ Настройки слева в лаунчере и выдели больше оперативной памяти (рекомендуется 4-6 GB).";
            } else if (lowerText.includes("чит") || lowerText.includes("функции") || lowerText.includes("меню")) {
                reply = "🤖 Бот: Чтобы открыть меню визуалов прямо в игре, нажми клавишу Правый Shift (Right Shift) на клавиатуре после загрузки мира.";
            } else if (lowerText.includes("привет") || lowerText.includes("ку") || lowerText.includes("здарова")) {
                reply = "🤖 Бот: Привет, бро! Рад видеть тебя на официальном сайте Luntik Visuals. Скачивай софт выше!";
            }

            appendMessage(reply, "bot");
        }, 400); 
    }

    function appendMessage(text, className) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `msg ${className}`;
        msgDiv.innerText = text;
        chatArea.appendChild(msgDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    // Запускаем первичную проверку таймера при загрузке страницы
    const currentReward = localStorage.getItem("luntik_saved_reward");
    if (currentReward) {
        const rewardObj = JSON.parse(currentReward);
        const lastClick = localStorage.getItem("luntik_last_spin");
        const cardNum = 1; 
        const activeCard = document.getElementById(`card${cardNum}`);
        activeCard.innerText = rewardObj.name.includes("Упс") ? "❌" : "🎁";
        activeCard.classList.add("opened", rewardObj.class);
    }
    checkRouletteStatus();
});
