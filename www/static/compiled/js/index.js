(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _domReady = require('./modules/js-utils/domReady');

var _domReady2 = _interopRequireDefault(_domReady);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function showForm(type) {
  var loginCardContainerEl = document.querySelector('.login-card-container');

  if (type == 'signin') {
    loginCardContainerEl.classList.remove('flipped');
  } else if (type == 'signup') {
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

(0, _domReady2.default)(function () {
  var createAccountFormEl = document.querySelector('.createAccountForm');
  var signInFormEl = document.querySelector('.signInForm');
  var formEls = document.querySelectorAll('form');
  var globalMsgEl = document.getElementById('globalMsg');

  signInFormEl.addEventListener('click', function () {
    showForm('signin');
  });

  createAccountFormEl.addEventListener('click', function () {
    showForm('signup');
  });

  formEls.forEach(function (formEl) {
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();

      var hasErrors = false;

      var formType = formEl.getAttribute('data-type');
      var formSubmitBtn = formEl.querySelector('button[type="submit"]');
      var formInps = formEl.querySelectorAll('input');

      // toggle button state
      formSubmitBtn.innerHTML = formType == 'signin' ? 'Logging In...' : 'Creating Account...';
      formSubmitBtn.classList.add('disabled');

      // validate each input of the form
      formInps.forEach(function (inpEl) {
        var inpType = inpEl.getAttribute('data-type');
        var inpMsgEl = inpEl.parentNode.querySelector('.msg');
        var inpVal = inpEl.value.trim();

        // Validation #1: Check if inputs are not empty
        if (inpVal === '') {
          hasErrors = true;
          if (inpMsgEl) {
            inpEl.classList.add('error');
            inpMsgEl.innerHTML = 'This field is required';
          }
        } else {
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
            } else {
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
            } else {
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
        setTimeout(function () {
          // toggle button state
          formSubmitBtn.innerHTML = formType == 'signin' ? 'Log In' : 'Create Account';
          formSubmitBtn.classList.remove('disabled');
        }, 500);

        return false;
      }

      setTimeout(function () {
        // toggle button state
        formSubmitBtn.innerHTML = formType == 'signin' ? 'Log In' : 'Create Account';
        formSubmitBtn.classList.remove('disabled');

        // TODO: Show a global msg
        globalMsgEl.classList.add('visible');
        globalMsgEl.querySelector('.msg-content').innerHTML = formType == 'signin' ? 'Signed In Successfully. Resetting...' : 'Account Created Successfully. Resetting...';

        // reset the form after 5 seconds
        setTimeout(function () {
          globalMsgEl.classList.remove('visible');
          formEl.reset();
        }, 5000);
      }, 500);
    });
  });
});

},{"./modules/js-utils/domReady":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = domReady;
function domReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function () {
      if (document.readyState !== 'loading') {
        fn();
      }
    });
  }
};

},{}]},{},[1]);
