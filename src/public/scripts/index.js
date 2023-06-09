const renderHeader = (firstName, lastName) => {
  return `<div class="header__title">
            <h2 class="clr-primary-dark fs-regular-200 fw-600">Hi, ${firstName} ${lastName}!             
            <span class="logout">
              <span class="v-bar"></span><span class="v-bar"></span>
            </span>
            </h2>
            <p class="clr-secondary-gray fs-regular-100 fw-400">
                How much did you spend today?
            </p>
            <div class="logout__button fs-small-200 fw-600"> Sign Out <i class="fa-solid fa-arrow-right-from-bracket"></i> </div>
          </div>
          <button class="clr-primary-white fs-regular-100 fw-500 | header__button">
          + Log Expense
          </button>`;
};

const renderItem = (item, title) => {
  let { id, name, amount, iconTag, color, backgroundColor, backgroundOpacity } =
    item;
  id = title === 'Wallets' ? 'wallet' + id : 'category' + id;

  const span = title === 'Wallets' ? `<span class=active-dot></span>` : '';
  const onclick =
    title === 'Wallets' ? `onclick="renderWalletData('${id}')"` : '';

  return `<li class="section__container-component" id="${id}" ${onclick}>
              <i class="wallet-logo ${iconTag} fs-regular-100" alt="wallet-logo" style="background-color: hsla(${backgroundColor}, ${backgroundOpacity}); color: hsl(${color}); border: 2px solid hsl(${color})"></i>
              <div>
                  <p class="clr-primary-dark fs-regular-100 fw-600">${name}</p>
                  <p class="clr-secondary-gray fs-small-200 fw-400">${(+amount).toFixed(
                    2
                  )} RON</p>
              </div>
              ${span}
          </li>`;
};

const renderWidget = (title, items) => {
  const renderedItems = items.reduce((acc, item) => {
    return acc + renderItem(item, title);
  }, '');
  const content = `
        <section class="aside-bar__section">
            <header class="section__header">
                <h2 class="clr-primary-dark fs-regular-200 fw-700">${title}</h2>
                <button id="add${title}" class="section__header-button | clr-primary-dark fs-small-200 fw-600">+</button>
            </header>
            <ul id="${title.toLowerCase()}List" class="section__container">
                ${renderedItems}
            </ul>
        </section>
    `;
  return content;
};

const renderStats = expenses => {
  let totalIncomes = 0;
  let totalExpenses = 0;

  expenses.forEach(expense => {
    if (expense.amount > 0) {
      totalIncomes += +expense.amount;
    } else {
      totalExpenses += -expense.amount;
    }
  });

  return `<div class="main__stats">
                <div class="main__stats-card">
                <img src="assets/trending-up.svg" alt="trending-up-logo">
                <div class="card__description">
                    <p class="card__info | clr-secondary-gray fs-small-100 fw-400">Total Incomes</p>
                    <p class="card__amount | clr-secondary-gray fs-regular-100 fw-700">${totalIncomes.toFixed(
                      2
                    )} RON</p>
                </div>
                </div>
                <div class="main__stats-card">
                <img src="assets/trending-down.svg" alt="trending-down-logo">
                <div class="card__description">
                    <p class="card__info | clr-secondary-gray fs-small-100 fw-400">Total Expenses</p>
                    <p class="card__amount | clr-secondary-gray fs-regular-100 fw-700">${totalExpenses.toFixed(
                      2
                    )} RON</p>
                </div>
                </div>
            </div>`;
};

const renderHistoryItem = item => {
  let {
    id,
    name,
    amount,
    date,
    iconTag,
    color,
    backgroundColor,
    backgroundOpacity,
  } = item;
  id = 'expense' + id;
  date = new Date(date);
  date = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
  const amountColor =
    amount < 0 ? 'hsla(0, 79%, 63%, 1)' : 'hsla(146, 64%, 36%, 1)';
  const amountSign = amount < 0 ? '' : '+';
  return `<li class="history__card" id="${id}">
                <div class="history__card-component">
                    <i class="wallet-logo ${iconTag} fs-regular-100" alt="wallet-logo" style="background-color: hsla(${backgroundColor}, ${backgroundOpacity}); color: hsl(${color}); border: 2px solid hsl(${color})"></i>
                    <div class="card__description">
                        <p class="component__title | clr-primary-dark fs-regular-100 fw-600">${name}</p>
                        <p class="component__date | clr-secondary-gray fs-small-200 fw-400">${date}</p>
                    </div>
                </div>
                <div class="history__card-options">
                    <p class="fs-regular-100 fw-600" style="color: ${amountColor};">${amountSign}${(+amount).toFixed(
    2
  )} RON</p>
                    <button class="edit-button" onclick="showEditExpense('${id}')">
                        <img src="assets/edit.svg" alt="edit-logo">
                    </button>
                    <button class="edit-button" onclick="showDeleteExpense('${id}')">
                        <img src="assets/trash.svg" alt="trash-logo">
                    </button>
                </div>
            </li>`;
};

const renderHistory = expenses => {
  const listItems = expenses.reduce(
    (acc, expense) => acc + renderHistoryItem(expense),
    ''
  );

  return `<section class="history">
                <h3 class="history__title clr-primary-dark fs-regular-100 fw-600">History</h3>
                <ul class="main__expenses"> 
                    ${listItems}
                </ul>
            </section>`;
};

const renderMain = (wallet, expenses) => {
  return (
    `<div class="main__title">
        <i class="wallet-logo fa-solid fa-wallet fs-large-100" alt="wallet-logo" style="background-color: hsla(${wallet.backgroundColor}, ${wallet.backgroundOpacity}); color: hsl(${wallet.color}); border: 2px solid hsla(${wallet.backgroundColor}, 1)"></i>
        <h2 class="clr-primary-dark fs-large-100 fw-600">${wallet.name}</h2>
      </div>` +
    renderStats(expenses) +
    renderHistory(expenses)
  );
};

(async function () {
  let response = await fetch('/users', { method: 'GET' });
  let result = await response.json();

  const header = document.querySelector('.header');
  const headerItems = renderHeader(result.firstName, result.lastName);
  header.innerHTML += headerItems;

  const toggle_button = document.querySelector('.aside__toggle');
  const aside = document.querySelector('.aside-bar');

  toggle_button.addEventListener('click', () => {
    aside.classList.toggle('active');
    toggle_button.classList.toggle('active');
  });

  const logout_toggle = document.querySelector('.logout');
  const logoutButton = document.querySelector('.logout__button');

  logout_toggle.addEventListener('click', () => {
    logout_toggle.classList.toggle('active');
    logoutButton.classList.toggle('visible');
  });

  logoutButton.addEventListener('click', async () => {
    await fetch('/logout', { method: 'GET' });
    location.assign('/login');
  });

  const wallets = renderWidget('Wallets', result.wallets);
  aside.innerHTML += wallets;
  aside.innerHTML += `<hr>`;

  const categories = renderWidget('Categories', result.categories);
  aside.innerHTML += categories;

  const currentWalletId = result.mainWallet;

  if (currentWalletId !== null) {
    const currentWallet = document.querySelector(`#wallet${currentWalletId}`);
    currentWallet.setAttribute('data-selected', true);

    response = await fetch(`/wallets/?walletId=${currentWalletId}`, {
      method: 'GET',
    });
    result = await response.json();

    const main = document.querySelector('.main');
    main.innerHTML += renderMain(result.wallet, result.expenses);
  }

  const addWalletButton = document.querySelector('#addWallets');
  const addCategoryButton = document.querySelector('#addCategories');

  addWalletButton.addEventListener('click', () =>
    showAddModal('walletsModal', 'Wallet details', walletInputs)
  );

  addCategoryButton.addEventListener('click', () =>
    showAddModal('categoriesModal', 'Category details', categoryInputs)
  );

  const logExpenseButton = document.querySelector('.header__button');
  logExpenseButton.addEventListener('click', () =>
    showLogModal('logPopup', logExpenseInputs)
  );
})();
