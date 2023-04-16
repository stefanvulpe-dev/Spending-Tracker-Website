const onSubmit = async (formElements, id) => {
  let location, title;

  if (id === 'walletsModal') {
    location = document.querySelector('#walletsList');
    title = 'Wallets';
  } else {
    location = document.querySelector('#categoriesList');
    title = 'Categories';
  }

  let [name, amount] = [formElements['0'].value, formElements['1'].value];
  const backgroundOpacity = id === 'walletsModal' ? 1 : 0.1;

  let color, iconSrc, backgroundColor;

  if (id === 'walletsModal') {
    color = '0, 0%, 100%';
    iconSrc = 'fa-solid fa-wallet';
    backgroundColor = get_random_color();
  } else {
    color = get_random_color();
    iconSrc = get_random_src();
    backgroundColor = color;
    amount = 0;
  }

  const itemData = {
    name: name,
    amount: amount,
    iconTag: iconSrc,
    color: color,
    backgroundColor: backgroundColor,
    backgroundOpacity: backgroundOpacity,
  };

  let response;
  if (id === 'walletsModal') {
    response = await fetch('wallets/add-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
  } else {
    response = await fetch('categories/add-category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
  }
  const result = await response.json();
  location.innerHTML += renderItem(result, title);
};

const renderAddModal = (id, title, formInput, onClose) => {
  const fragment = new DocumentFragment();

  const dialogWindow = document.createElement('dialog');
  dialogWindow.classList.add('dialog__form');
  dialogWindow.id = id;

  const dialogTitle = document.createElement('h2');
  dialogTitle.textContent = title;
  dialogTitle.classList.add('dialog__title');

  const dialogForm = document.createElement('form');

  dialogForm.addEventListener('submit', e => {
    e.preventDefault();
    onSubmit(e.target.elements, id);
    onClose();
  });

  dialogWindow.append(dialogTitle, dialogForm);

  formInput.forEach(element => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('fields-wrapper');
    const formInput = document.createElement('input');
    const inputLabel = document.createElement('label');
    for (const field of Object.keys(element)) {
      if (field === 'label') {
        inputLabel.textContent = element[field];
        inputLabel.htmlFor = element['id'];
      } else {
        formInput[field] = element[field];
      }
      if (element[field] === 'number') {
        formInput.step = 'any';
      }
    }
    wrapper.append(inputLabel, formInput);
    fragment.append(wrapper);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = '\u002B Add';
  submitButton.type = 'submit';

  const closeButton = document.createElement('button');
  closeButton.textContent = `\u2715 Close`;
  closeButton.type = 'button';
  closeButton.addEventListener('click', onClose);

  const wrapper = document.createElement('div');
  wrapper.classList.add('fields-wrapper');
  wrapper.append(submitButton, closeButton);

  fragment.append(wrapper);
  dialogForm.append(fragment);

  document.body.append(dialogWindow);
};

const showAddModal = (id, title, formInput) => {
  const isModalCreated = !!document.querySelector(`#${id}`);

  if (!isModalCreated) {
    renderAddModal(id, title, formInput, () => {
      clearInputs(id);
      toggleElement(id);
    });
  }
  toggleElement(id);
};

const updateStatsSection = amount => {
  let element, number;
  if (amount < 0) {
    element = document.querySelector(
      '.main__stats-card:nth-child(2) .card__amount'
    );
    number = element.textContent.split(' ', 1).join();
    element.textContent = Number(+number + -amount) + ' RON';
  } else {
    element = document.querySelector(
      '.main__stats-card:first-child .card__amount'
    );
    number = element.textContent.split(' ', 1).join();
    element.textContent = Number(+number + amount) + ' RON';
  }
};

const updateCategoriesSection = expense => {
  const currentCategory = document.querySelector(
    `#category${expense.categoryId} div p:nth-child(2)`
  );
  const currentAmount = currentCategory.textContent.split(' ', 1).join();
  if (expense.amount < 0) {
    currentCategory.textContent =
      Number(+currentAmount + -expense.amount) + ' RON';
  } else {
    currentCategory.textContent =
      Number(+currentAmount + expense.amount) + ' RON';
  }
};

const updateWalletBalance = amount => {
  const walletBallance = document.querySelector(
    `#${getCurrentWalletId()} div p:nth-child(2)`
  );
  const number = walletBallance.textContent.split(' ', 1).join();
  walletBallance.textContent = Number(+number + amount) + ' RON';
};

const submitExpenseDetails = async formData => {
  const [categoryId, name, amount, date] = [
    formData['0'].value,
    formData['1'].value,
    +formData['2'].value,
    formData['3'].value,
  ];

  /* TO DO: Form validation */

  const walletId = getCurrentWalletId().substring(6);
  let response, expense;
  try {
    response = await fetch(
      `wallets/add-expense/?walletId=${walletId}&categoryId=${categoryId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, name, amount, date }),
      }
    );
    expense = await response.json();
  } catch (err) {
    console.log(err);
    return;
  }

  const expenseList = document.querySelector('.history ul');
  expenseList.innerHTML += renderHistoryItem(expense);

  updateStatsSection(amount);
  updateCategoriesSection(expense);
  updateWalletBalance(amount);
};

const renderLogModal = async (id, formInputs, onClose) => {
  const fragment = new DocumentFragment();

  let categories;

  try {
    categories = await getLogCategories();
  } catch (err) {
    console.log(err);
    return;
  }

  popupWindow = document.createElement('dialog');
  popupWindow.classList.add('popup');
  popupWindow.id = id;

  const popupTitle = document.createElement('h2');
  popupTitle.textContent = 'Expense details';
  popupTitle.classList.add('popup__title');

  const logForm = document.createElement('form');
  logForm.classList.add('popup__form');

  formInputs.forEach(formInput => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('popup__form-element');

    const { id, name, label, type, placeholder } = formInput;

    const formLabel = document.createElement('label');
    formLabel.textContent = label;
    formLabel.htmlFor = id;

    let formField;
    if (type === 'select') {
      formField = document.createElement('select');

      /* Create a default option placeholder */
      let option = document.createElement('option');
      option.value = placeholder;
      option.textContent = placeholder;
      option.selected = 'true';
      option.disabled = 'true';
      option.hidden = 'true';
      formField.append(option);

      categories.forEach(category => {
        option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        formField.append(option);
      });
    } else {
      formField = document.createElement('input');
      formField.type = type;
      formField.placeholder = placeholder;
    }

    formField.id = id;
    formField.name = name;
    formField.required = true;

    wrapper.append(formLabel, formField);
    fragment.append(wrapper);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = '\u002B Add';
  submitButton.type = 'submit';
  submitButton.classList.add('fs-regular-100', 'fw-600');

  const closeButton = document.createElement('button');
  closeButton.textContent = '\u2715 Close';
  closeButton.type = 'button';
  closeButton.classList.add('fs-regular-100', 'fw-600');

  closeButton.addEventListener('click', onClose);

  const wrapper = document.createElement('div');
  wrapper.classList.add('popup__form-element');
  wrapper.append(submitButton, closeButton);

  fragment.append(wrapper);

  logForm.addEventListener('submit', e => {
    e.preventDefault();
    submitExpenseDetails(e.target.elements);
    onClose();
  });

  logForm.append(fragment);

  popupWindow.append(popupTitle, logForm);

  return Promise.resolve(document.body.append(popupWindow));
};

const showLogModal = async (id, formInputs) => {
  const isCreated = !!document.querySelector(`#${id}`);

  if (!isCreated) {
    await renderLogModal(id, formInputs, () => {
      clearInputs(id);
      toggleElement(id);
    });
    toggleElement(id);
  } else {
    toggleLog(id);
  }
};
