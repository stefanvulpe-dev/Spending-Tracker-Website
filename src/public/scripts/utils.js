/**
 * This function renders the expenses for the currently selected wallet
 * @param {string} walletId
 */

const renderWalletData = async walletId => {
  const response = await fetch(`/wallets/?walletId=${walletId.substring(6)}`, {
    method: 'GET',
  });
  const walletData = await response.json();
  const main = document.querySelector('.main');
  main.innerHTML = renderMain(walletData.wallet, walletData.expenses);
  const currentWallet = document.querySelector(`#${getCurrentWalletId()}`);
  if (currentWallet !== null) {
    currentWallet.removeAttribute('data-selected');
  }
  const wallet = document.querySelector(`#${walletId}`);
  wallet.setAttribute('data-selected', 'true');
};

/**
 * Submit handler for add wallet and cateory modal
 * @param {} formElements
 * @param {string} id
 */
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

  if (id === 'walletsModal') {
    renderWalletData(`wallet${result.id}`);
  }
};

/**
 * This function renders the modals for wallet and category
 * @param {*} id
 * @param {*} title
 * @param {*} formInput
 * @param {*} onSubmit
 * @param {*} onClose
 */
const renderAddModal = (id, title, formInput, onSubmit, onClose) => {
  const fragment = new DocumentFragment();

  const dialogWindow = document.createElement('dialog');
  dialogWindow.classList.add('dialog__form');
  dialogWindow.id = title.includes('Edit')
    ? 'editExpense'
    : title.includes('Delete')
    ? 'deleteExpense'
    : id;

  const dialogTitle = document.createElement('h2');
  dialogTitle.textContent = title;
  dialogTitle.classList.add('dialog__title');

  const dialogForm = document.createElement('form');
  dialogForm.classList.add('form');

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

      if (element[field] === 'hidden') {
        inputLabel.style.textAlign = 'center';
      }
    }
    wrapper.append(inputLabel, formInput);
    fragment.append(wrapper);
  });

  const submitButton = document.createElement('button');
  submitButton.textContent = id.includes('expense')
    ? '\u2713 Confirm'
    : '\u002B Add';
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

/**
 * This function shows the add wallet/category modals, toggling them
 * @param {*} id
 * @param {*} title
 * @param {*} formInput
 */
const showAddModal = (id, title, formInput) => {
  const isModalCreated = !!document.querySelector(`#${id}`);

  if (!isModalCreated) {
    renderAddModal(id, title, formInput, onSubmit, () => {
      clearInputs(id);
      toggleElement(id);
    });
  }
  toggleElement(id);
};

/**
 * This function updates the statistics section of the main frame after adding a new expense
 * @param {*} amount
 * @param {*} oldAmount
 */
const updateStatsSection = (amount, oldAmount) => {
  let element, number;
  if (amount < 0) {
    element = document.querySelector(
      '.main__stats-card:nth-child(2) .card__amount'
    );
    number = element.textContent.split(' ', 1).join();
    element.textContent =
      Number(+number - -oldAmount + -amount).toFixed(2) + ' RON';
  } else {
    element = document.querySelector(
      '.main__stats-card:first-child .card__amount'
    );
    number = element.textContent.split(' ', 1).join();
    element.textContent =
      Number(+number - oldAmount + amount).toFixed(2) + ' RON';
  }
};

/**
 * This function updates the categories section after adding a new expense
 * @param {*} expense
 * @param {*} oldAmount
 */
const updateCategoriesSection = (expense, oldAmount) => {
  const currentCategory = document.querySelector(
    `#category${expense.categoryId} div p:nth-child(2)`
  );
  const currentAmount = currentCategory.textContent.split(' ', 1).join();
  if (expense.amount < 0) {
    currentCategory.textContent =
      Number(+currentAmount - -oldAmount + -expense.amount).toFixed(2) + ' RON';
  } else {
    currentCategory.textContent =
      Number(+currentAmount - oldAmount + +expense.amount).toFixed(2) + ' RON';
  }
};

/**
 * This function updates an expense card after editting it
 * @param {*} expense
 */
const updateExpenseCard = expense => {
  const expenseAmount = document.querySelector(
    `#expense${expense.id} .history__card-options p`
  );
  const amountSign = expense.amount < 0 ? '' : '+';
  const amountColor =
    expense.amount < 0 ? 'hsla(0, 79%, 63%, 1)' : 'hsla(146, 64%, 36%, 1)';

  expenseAmount.textContent = `${amountSign}${(+expense.amount).toFixed(
    2
  )} RON`;

  expenseAmount.style.color = amountColor;

  const expenseTitle = document.querySelector(
    `#expense${expense.id} .component__title`
  );
  expenseTitle.textContent = expense.name;

  const expenseDate = document.querySelector(
    `#expense${expense.id} .component__date`
  );
  expenseDate.textContent = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(expense.date));
};

/**
 * This function updates the current wallet balance after some changes regarding expenses are performed by the user
 * @param {*} amount
 * @param {*} oldAmount
 */
const updateWalletBalance = (amount, oldAmount) => {
  const walletBallance = document.querySelector(
    `#${getCurrentWalletId()} div p:nth-child(2)`
  );
  const number = walletBallance.textContent.split(' ', 1).join();
  walletBallance.textContent =
    Number(+number - oldAmount + amount).toFixed(2) + ' RON';
};

/**
 * This function handles the submitting of a new expense
 * @param {*} formData
 * @returns
 */
const submitExpenseDetails = async formData => {
  const [categoryId, name, amount, date] = [
    formData['0'].value,
    formData['1'].value,
    +formData['2'].value,
    formData['3'].value,
  ];

  const walletId = getCurrentWalletId().substring(6);
  let response, expense;
  try {
    response = await fetch(
      `expenses/add-expense/?walletId=${walletId}&categoryId=${categoryId}`,
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

  updateStatsSection(amount, 0);
  updateCategoriesSection(expense, 0);
  updateWalletBalance(amount, 0);
};

/**
 * This function renders the modal window for the Log Expense component
 * @param {*} id
 * @param {*} formInputs
 * @param {*} onClose
 * @returns
 */
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

    if (type === 'number') {
      formField.step = 'any';
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

/**
 * This function shows the Log Expense Modal, toggling it
 * @param {*} id
 * @param {*} formInputs
 */
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

/**
 * This function handles the submitting of a new expense, after some changes are applied to it
 * @param {*} formElements
 * @param {*} id
 */
const submitEditedExpense = async (formElements, id) => {
  const newExpense = {
    name: formElements[0].value,
    amount: +formElements[1].value,
    date: formElements[2].value,
  };

  const response = await fetch(
    `/expenses/edit-expense/?expenseId=${id.substring(7)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newExpense),
    }
  );

  const expense = await response.json();

  updateExpenseCard(expense);
  updateStatsSection(expense.amount, expense.oldAmount);
  updateCategoriesSection(expense, expense.oldAmount);
  updateWalletBalance(expense.amount, expense.oldAmount);
};

/**
 * This function updates the corresponding category after the deletion of an expense
 * @param {*} amount
 */
const updateOneStat = amount => {
  let element, number;
  if (amount < 0) {
    element = document.querySelector(
      '.main__stats-card:nth-child(2) .card__amount'
    );
    number = element.textContent.split(' ', 1).join();
    element.textContent = Number(+number - -amount).toFixed(2) + ' RON';
  } else {
    element = document.querySelector(
      '.main__stats-card:first-child .card__amount'
    );
    number = element.textContent.split(' ', 1).join();
    element.textContent = Number(+number - amount).toFixed(2) + ' RON';
  }
};

/**
 * This function updates the category section of the recently deleted expense
 * @param {*} expense
 */
const updateOneCategory = expense => {
  const currentCategory = document.querySelector(
    `#category${expense.categoryId} div p:nth-child(2)`
  );
  const currentAmount = currentCategory.textContent.split(' ', 1).join();
  if (expense.amount < 0) {
    currentCategory.textContent =
      Number(+currentAmount - -expense.amount).toFixed(2) + ' RON';
  } else {
    currentCategory.textContent =
      Number(+currentAmount - +expense.amount).toFixed(2) + ' RON';
  }
};

/**
 * This function shows the Edit Expense Modal window
 * @param {*} id
 */
const showEditExpense = id => {
  renderAddModal(
    id,
    'Edit expense',
    editExpenseInputs,
    submitEditedExpense,
    () => {
      toggleElement('editExpense');
      const modal = document.querySelector(`#editExpense`);
      modal.remove();
    }
  );
  toggleElement('editExpense');
};

/**
 * This function handles the deletion of an expense
 * @param {*} formElements
 * @param {*} id
 */
const submitDeletedExpense = async (formElements, id) => {
  let response, result;

  response = await fetch(`/expenses/?expenseId=${id.substring(7)}`, {
    method: 'GET',
  });

  const expenseData = await response.json();

  response = await fetch(
    `/expenses/delete-expense/?expenseId=${id.substring(7)}`,
    { method: 'DELETE' }
  );

  result = await response.json();

  if (result.message === 'success') {
    updateOneStat(+expenseData.amount);
    updateOneCategory(expenseData);
    updateWalletBalance(0, +expenseData.amount);

    const expenseElement = document.querySelector(`#${id}`);
    expenseElement.remove();
  }
};

/**
 * This function shows the Delete Expense Modal window
 * @param {*} id
 */
const showDeleteExpense = id => {
  const expenseTitle = document.querySelector(`#${id} .component__title`);
  renderAddModal(
    id,
    'Delete expense',
    [
      {
        id: 'name',
        name: 'name',
        type: 'hidden',
        label: `Are you sure you want to delete ${expenseTitle.textContent}?`,
      },
    ],
    submitDeletedExpense,
    () => {
      toggleElement('deleteExpense');
      const modal = document.querySelector(`#deleteExpense`);
      modal.remove();
    }
  );
  toggleElement('deleteExpense');
};
