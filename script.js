const products = [
  {
    name: 'Масло молекулярное SMART для полировки',
    description: 'Легкое масло для мгновенного глянца и защиты после полировки. Смягчает кутикулу и закрывает чешуйки ногтевой пластины.',
    tag: 'Блеск и защита',
    price: '30 мл',
    note: 'Для финальной шлифовки и домашнего ухода.',
    image: 'https://optim.tildacdn.com/stor6239-6234-4066-b264-316336383561/-/format/webp/77603545.jpg.webp',
    link: 'https://pollylook.com/catalog/tproduct/818258500-915383082642-maslo-molekulyarnoe-smart-dlya-polirovki'
  },
  {
    name: 'Биовоск регенерирующий',
    description: 'Густой воск с питательными маслами для восстановления кожи и кутикулы. Ускоряет регенерацию и снижает шелушение.',
    tag: 'Восстановление',
    price: '15 мл',
    note: 'Наносите на сухие участки и трещины ежедневно.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-843834728042-biovosk-regeneriruyuschii'
  },
  {
    name: 'Крем от мозолей и натоптышей 150 мл',
    description: 'Смягчает роговой слой, облегчает удаление натоптышей и мозолей, поддерживает гладкость кожи стоп.',
    tag: 'Смягчение',
    price: '150 мл',
    note: 'Курсом 2–3 недели, наносить на локальные зоны.',
    image: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba1?auto=format&fit=crop&w=900&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-329772559592-krem-ot-mozolei-i-natoptishei-150-ml'
  },
  {
    name: 'Крем от трещин с монардой',
    description: 'Антисептический крем с монардой для заживления трещин, устранения стянутости и восстановления барьера кожи.',
    tag: 'Антисептика',
    price: '75 мл',
    note: 'Ночной уход для глубокого восстановления.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-495224069042-krem-ot-treschin-s-monardoi'
  },
  {
    name: 'Сыворотка SOS онихолизис для ногтей',
    description: 'Укрепляющая формула для восстановления сцепления ногтевой пластины с ложем, уменьшает ломкость и расслаивание.',
    tag: 'Онихолизис',
    price: '30 мл',
    note: 'Используйте под окклюзию для усиления эффекта.',
    image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=900&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-559624973012-sivorotka-sos-oniholizis-dlya-nogtei-30'
  },
  {
    name: 'Масло SOS онихолизис для восстановления ногтей',
    description: 'Питательное масло с антисептическими экстрактами, снижает чувствительность и поддерживает рост здоровой пластины.',
    tag: 'Восстановление ногтей',
    price: '15 мл',
    note: 'Наносить ежедневно на ногтевое ложе и свободный край.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-929825269612-maslo-sos-oniholizis-dlya-vosstanovleniy'
  },
  {
    name: 'Лосьон при гипергидрозе 150 мл',
    description: 'Регулирует потоотделение, устраняет запах и поддерживает комфорт стоп в течение дня.',
    tag: 'Контроль потоотделения',
    price: '150 мл',
    note: 'Легкая текстура, быстро впитывается.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-821454515222-loson-pri-gipergidroze-150-ml'
  },
  {
    name: 'Сыворотка восстанавливающая «Терапевт»',
    description: 'Укрепляет поврежденные ногти, работает против ломкости и истончения, поддерживает ровную пластину.',
    tag: 'Регенерация',
    price: '15 мл',
    note: 'Подходит для курсового применения между приемами.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-823285380402-sivorotka-vosstanavlivayuschaya-terapevt'
  },
  {
    name: 'Биовоск терапевтический с противогрибковым комплексом',
    description: 'Создает защитную пленку, смягчает кутикулу и содержит компоненты против грибковой флоры.',
    tag: 'Антигрибковый уход',
    price: '15 мл',
    note: 'Идеален для профилактики после обработки.',
    image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=800&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-238454690072-biovosk-terapevticheskii-s-protivogribko'
  },
  {
    name: 'Лосьон терапевтический с противогрибковыми компонентами',
    description: 'Специальный раствор для обработки кожи и ногтевых валиков, снижает риск повторного инфицирования.',
    tag: 'Антисептика',
    price: '30 мл',
    note: 'Для ухода между процедурами у подолога.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-844988151422-loson-terapevticheskii-s-protivogribkovi'
  },
  {
    name: 'Терапевтический крем для проблемной кожи',
    description: 'Успокаивает раздражения, питает и восстанавливает баланс кожи стоп, подходит для чувствительных клиентов.',
    tag: 'Успокаивающий уход',
    price: '75 мл',
    note: 'Можно использовать ежедневно после душа.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=700&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-540519584802-terapevticheskii-krem-dlya-problemnoi-ko'
  },
  {
    name: 'Сыворотка для укрепления поврежденных ногтей',
    description: 'Уплотняет ногтевую пластину, уменьшает ломкость и улучшает внешний вид после травм или грибковых поражений.',
    tag: 'Укрепление',
    price: '15 мл',
    note: 'Наносить на чистые ногти курсом 4–6 недель.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-545745307272-sivorotka-dlya-ukrepleniya-povrezhdennih'
  },
  {
    name: 'Лосьон Прополисофт Комплекс 15 мл',
    description: 'Прополис в удобной форме: смягчает, обеззараживает и ускоряет заживление нежной кожи и валиков.',
    tag: 'Питание и защита',
    price: '15 мл',
    note: 'Локально на чувствительные зоны или кутикулу.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-386697822432-loson-propolisoft-kompleks-15-ml'
  },
  {
    name: 'Лосьон Прополистронг Интенсив 15 мл',
    description: 'Усиленная концентрация прополиса для проблемных зон: снимает воспаление и защищает от бактерий.',
    tag: 'Интенсивный уход',
    price: '15 мл',
    note: 'Используйте точечно до 2 раз в день.',
    image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=700&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-150897344792-loson-propolistrong-intensiv-15-ml'
  },
  {
    name: 'Биовоск от трещин и шелушений «Безупречный»',
    description: 'Создает защитный барьер, удерживает влагу и смягчает сухие зоны стоп, способствует заживлению трещин.',
    tag: 'Защита кожи',
    price: '15 мл',
    note: 'Наносите на ночь на проблемные участки.',
    image: 'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=820&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-625132833562-biovosk-ot-treschin-i-shelushenii-bezupr'
  },
  {
    name: 'Крем-баттер Эксперт уход с маслом ши',
    description: 'Плотный крем-баттер с ши и растительными маслам для длительного увлажнения и эластичности кожи стоп.',
    tag: 'Питание',
    price: '120 мл',
    note: 'Подходит для ежедневного ухода и массажа.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=820&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-203894539272-krem-batter-ekspert-uhod-s-maslom-shi'
  },
  {
    name: 'Лосьон защищающий для кожи ног',
    description: 'Легкий защитный лосьон с барьерными компонентами, удерживает влагу и предотвращает пересыхание.',
    tag: 'Барьерная защита',
    price: '150 мл',
    note: 'Идеален для завершения домашнего ухода.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=820&q=60',
    link: 'https://pollylook.com/catalog/tproduct/818258500-766442007252-loson-zaschischayuschiy-dlya-kozhi-nog-s'
  }
];

const grid = document.getElementById('product-grid');
if (grid) {
  grid.innerHTML = products.map(item => `
    <article class="product-card">
      <div class="product-thumb">
        <span class="product-tag">${item.tag}</span>
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
      </div>
      <div class="product-body">
        <h3 class="product-title">${item.name}</h3>
        <p class="product-desc">${item.description}</p>
        <div class="product-meta">
          <span>${item.price}</span>
          <span>${item.note}</span>
        </div>
        <div class="product-actions">
          <a class="ghost-btn" href="${item.link}" target="_blank" rel="noopener">Подробнее</a>
          <button class="primary-btn" data-product="${item.name}">Купить у Марии</button>
        </div>
      </div>
    </article>
  `).join('');
}

const form = document.getElementById('tg-form');
const statusEl = document.getElementById('status');
const productField = document.getElementById('product-field');

if (grid && form) {
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-product]');
    if (!btn) return;
    const productName = btn.getAttribute('data-product');
    productField.value = productName;
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    productField.focus();
  });
}

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = this.name.value.trim();
    const phone = this.phone.value.trim();
    const preferredDay = this.preferred_day.value.trim();
    const product = this.product.value.trim();
    const comment = this.comment.value.trim();

    if (!name || !phone) {
      statusEl.textContent = '❌ Укажите имя и телефон.';
      return;
    }

    const lines = [
      '🦶 Новая заявка',
      `👤 Имя: ${name}`,
      `📞 Телефон: ${phone}`,
      preferredDay ? `🗓 Предпочтительный день: ${preferredDay}` : null,
      product ? `🛍 Продукт: ${product}` : '🛍 Продукт: консультация/запись',
      comment ? `💬 Комментарий: ${comment}` : null
    ].filter(Boolean);

    const message = lines.join('\n');

    fetch('https://api.telegram.org/bot7673985541:AAH2PnkO-TW1i09ZSHFwMLa7Gj8NghOZi14/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: '2091631815',
        text: message
      })
    })
    .then(res => {
      if (res.ok) {
        statusEl.textContent = '✅ Заявка отправлена! Я свяжусь с вами.';
        this.reset();
      } else {
        statusEl.textContent = '❌ Ошибка при отправке. Попробуйте ещё раз.';
      }
    })
    .catch(() => {
      statusEl.textContent = '❌ Не удалось отправить сообщение.';
    });
  });
}

const burger = document.getElementById('burger');
const nav = document.getElementById('main-nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}
