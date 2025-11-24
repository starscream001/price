const form = document.getElementById("tg-form");
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".menu-toggle");
const commentField = form?.querySelector("textarea[name='comment']");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function scrollToForm() {
  const formBlock = document.getElementById("contact");
  if (formBlock) {
    formBlock.scrollIntoView({ behavior: "smooth" });
  }
}

// Prefill comment with product name
const productButtons = document.querySelectorAll(".js-buy");
productButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const card = e.currentTarget.closest(".product");
    const name = card?.dataset.product;
    if (commentField && name) {
      commentField.value = `Хочу заказать: ${name}`;
    }
    scrollToForm();
  });
});

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = this.name.value.trim();
    const phone = this.phone.value.trim();
    const preferredDay = this.preferred_day.value.trim();
    const comment = this.comment.value.trim();

    if (!name || !phone) {
      document.getElementById("status").textContent = "❌ Укажите имя и телефон.";
      return;
    }

    const lines = [
      "🦶 Новая заявка",
      `👤 Имя: ${name}`,
      `📞 Телефон: ${phone}`,
      preferredDay ? `🗓 Предпочтительный день: ${preferredDay}` : null,
      comment ? `💬 Комментарий: ${comment}` : null,
    ].filter(Boolean);

    const message = lines.join("\n");

    fetch("https://api.telegram.org/bot7673985541:AAH2PnkO-TW1i09ZSHFwMLa7Gj8NghOZi14/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "2091631815",
        text: message,
      }),
    })
      .then((res) => {
        if (res.ok) {
          document.getElementById("status").textContent = "✅ Заявка отправлена! Я свяжусь с вами.";
          this.reset();
        } else {
          document.getElementById("status").textContent = "❌ Ошибка при отправке. Попробуйте ещё раз.";
        }
      })
      .catch(() => {
        document.getElementById("status").textContent = "❌ Не удалось отправить сообщение.";
      });
  });
}
