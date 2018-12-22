import domReady from "./modules/js-utils/domReady";

function showForm(type) {
  const loginCardContainerEl = document.querySelector('.login-card-container');

  if (type == 'signin') {
    loginCardContainerEl.classList.remove('flipped');
  }
  else if (type == 'signup') {
    loginCardContainerEl.classList.add('flipped');
  }
}

function validateEmail(email) {
  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  if (reg.test(email) == false) {
    return false;
  }
  return true;
}

domReady(() => {
  const createAccountFormEl = document.querySelector('.createAccountForm');
  const signInFormEl = document.querySelector('.signInForm');
  const formEls = document.querySelectorAll('form');
  const globalMsgEl = document.getElementById('globalMsg');

  signInFormEl.addEventListener('click', () => {
    showForm('signin');
  });

  createAccountFormEl.addEventListener('click', () => {
    showForm('signup');
  });

  formEls.forEach((formEl) => {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;

      let formType = formEl.getAttribute('data-type');
      let formSubmitBtn = formEl.querySelector('button[type="submit"]');
      let formInps = formEl.querySelectorAll('input');

      // toggle button state
      formSubmitBtn.innerHTML = formType == 'signin' ? 'Logging In...' : 'Creating Account...';
      formSubmitBtn.classList.add('disabled');

      // validate each input of the form
      formInps.forEach((inpEl) => {
        let inpType = inpEl.getAttribute('data-type');
        let inpMsgEl = inpEl.parentNode.querySelector('.msg');
        let inpVal = inpEl.value.trim();

        // Validation #1: Check if inputs are not empty
        if (inpVal === '') {
          hasErrors = true;
          if (inpMsgEl) {
            inpEl.classList.add('error');
            inpMsgEl.innerHTML = 'This field is required';
          }
        }
        else {
          if (inpMsgEl) {
            inpEl.classList.remove('error');
            inpMsgEl.innerHTML = '';
          }

          // Validation #2: Check if username is >2 chars and <=15 chars
          if (inpType === 'username') {
            if (!(inpVal.length > 2 && inpVal.length <= 15)) {
              hasErrors = true;
              if (inpMsgEl) {
                inpEl.classList.add('error');
                inpMsgEl.innerHTML = 'Username must be >2 and <= 15 chars';
              }
            }
            else {
              if (inpMsgEl) {
                inpEl.classList.remove('error');
                inpMsgEl.innerHTML = '';
              }
            }
          }

          // Validation #3: Check if email is valid
          if (inpType === 'email') {
            if (!validateEmail(inpVal)) {
              hasErrors = true;
              if (inpMsgEl) {
                inpEl.classList.add('error');
                inpMsgEl.innerHTML = 'Invalid Email Id';
              }
            }
            else {
              if (inpMsgEl) {
                inpEl.classList.remove('error');
                inpMsgEl.innerHTML = '';
              }
            }
          }
        }

      });

      // don't submit the form if it has errors
      if (hasErrors) {
        setTimeout(() => {
          // toggle button state
          formSubmitBtn.innerHTML = formType == 'signin' ? 'Log In' : 'Create Account';
          formSubmitBtn.classList.remove('disabled');
        }, 500);

        return false;
      }

      setTimeout(() => {
        // toggle button state
        formSubmitBtn.innerHTML = formType == 'signin' ? 'Log In' : 'Create Account';
        formSubmitBtn.classList.remove('disabled');

        // TODO: Show a global msg
        globalMsgEl.classList.add('visible');
        globalMsgEl.querySelector('.msg-content').innerHTML = formType == 'signin' ? 'Signed In Successfully. Resetting...' : 'Account Created Successfully. Resetting...';

        // reset the form after 5 seconds
        setTimeout(() => {
          globalMsgEl.classList.remove('visible');
          formEl.reset();
        }, 5000);
      }, 500);
    });
  });
});
