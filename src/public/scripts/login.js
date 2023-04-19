const form = document.querySelector('form');
const emailError = document.querySelector('.email');
const passwordError = document.querySelector('.password');

form.reset();

form.addEventListener('submit', async e => {
  e.preventDefault();

  emailError.textContent = '';
  passwordError.textContent = '';

  const [email, password] = [
    e.target.elements[0].value,
    e.target.elements[1].value,
  ];

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
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
