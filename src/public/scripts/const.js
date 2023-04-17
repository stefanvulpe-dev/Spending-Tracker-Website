const iconSources = [
  'fa-solid fa-house',
  'fa-regular fa-envelope',
  'fa-solid fa-basket-shopping',
  'fa-solid fa-user',
  'fa-solid fa-gift',
  'fa-solid fa-gifts',
  'fa-solid fa-hand-holding-heart',
  'fa-solid fa-cart-shopping',
  'fa-solid fa-star',
];

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function get_random_color() {
  const h = Math.round(rand(1, 360));
  const s = Math.round(rand(0, 100));
  const l = Math.round(rand(0, 65));
  return `${h}, ${s}%, ${l}%`;
}

function get_random_src() {
  return iconSources[Math.round(rand(0, 8))];
}

const walletInputs = [
  {
    id: 'walletName',
    name: 'walletName',
    type: 'text',
    label: 'Wallet',
    placeholder: 'Enter a wallet name',
  },
  {
    id: 'walletAmount',
    name: 'walletAmount',
    type: 'number',
    label: 'Amount',
    placeholder: 'Enter wallet amount',
  },
];

const categoryInputs = [
  {
    id: 'category',
    name: 'category',
    type: 'text',
    label: 'Category',
    placeholder: 'Enter a category name',
  },
];

const logExpenseInputs = [
  {
    id: 'categoriesSelect',
    name: 'selectedCategory',
    label: 'Category',
    type: 'select',
    placeholder: '--Please select a category--',
  },
  {
    id: 'name',
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter expense name',
  },
  {
    id: 'amount',
    name: 'amount',
    label: 'Amount',
    type: 'number',
    placeholder: 'e.g. -250',
  },
  {
    id: 'date',
    name: 'date',
    label: 'Date',
    type: 'date',
    placeholder: 'Pick up a date',
  },
];

const editExpenseInputs = [
  {
    id: 'name',
    name: 'name',
    type: 'text',
    label: 'Name',
    placeholder: 'Enter another name',
  },
  {
    id: 'amount',
    name: 'amount',
    label: 'Amount',
    type: 'number',
    placeholder: 'e.g. 275',
  },
  {
    id: 'date',
    name: 'date',
    label: 'Date',
    type: 'date',
    placeholder: 'Pick up another date',
  },
];

const getLogCategories = async () => {
  const response = await fetch(`/categories`, {
    method: 'GET',
  });
  const result = await response.json();
  return Promise.resolve(result);
};

const renderSelectOptions = async () => {
  const options = [];

  const categories = await getLogCategories();

  let option = document.createElement('option');
  option.value = '--Please select a category--';
  option.textContent = '--Please select a category--';
  option.selected = 'true';
  option.disabled = 'true';
  option.hidden = 'true';
  options.push(option);

  categories.forEach(category => {
    option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name;
    options.push(option);
  });

  return Promise.resolve(options);
};

const toggleElement = id => {
  const element = document.querySelector(`#${id}`);
  const overlay = document.querySelector('.overlay');
  element.classList.toggle('visible');
  overlay.classList.toggle('visible');
};

const toggleLog = async id => {
  const select = document.querySelector(`#${id} form select`);
  select.innerHTML = '';
  const newOptions = await renderSelectOptions();
  newOptions.forEach(element => select.append(element));
  toggleElement(id);
};

const clearInputs = id => {
  const form = document.querySelector(`#${id} form`);
  form.reset();
  if (id === 'logPopup') {
    const select = document.querySelector(`#${id} select`);
    select.value = '--Please select a category--';
  }
};

const getCurrentWalletId = () => {
  const wallet = document.querySelector('[data-selected]');
  return wallet.id;
};
