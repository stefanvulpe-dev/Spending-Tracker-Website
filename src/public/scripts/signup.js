const form = document.querySelector('form');
const emailError = document.querySelector('.email');
const passwordError = document.querySelector('.password');

form.reset();

form.addEventListener('submit', async e => {
  e.preventDefault();

  emailError.textContent = '';
  passwordError.textContent = '';

  const [firstName, lastName, email, password] = [
    e.target.elements[0].value,
    e.target.elements[1].value,
    e.target.elements[2].value,
    e.target.elements[3].value,
  ];

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    const result = await response.json();

    if (result.errors) {
      emailError.textContent = result.errors.email;
      passwordError.textContent = result.errors.password;
    } else {
      location.assign('/');
    }
  } catch (err) {
    console.log(err);
  }

  e.target.reset();
});
