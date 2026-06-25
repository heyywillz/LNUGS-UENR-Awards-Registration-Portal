/* ============================================
   LNUGS-UENR Excellence Awards 2026
   Registration Portal — Form Logic
   ============================================ */

(function () {
  'use strict';

  // ── Category → Group Mapping ──────────────────────────────────
  const categoryGroups = {
    'Best Male Student of the Year': 'Academic and Intellectual Excellence',
    'Best Female Student of the Year': 'Academic and Intellectual Excellence',
    'Best Course Representative of the Year': 'Academic and Intellectual Excellence',
    'Best Lecturer of the Year': 'Academic and Intellectual Excellence',
    'Most Disciplined Student of the Year': 'Academic and Intellectual Excellence',
    'Best Debater of the Year': 'Academic and Intellectual Excellence',
    'Best Writer of the Year': 'Academic and Intellectual Excellence',
    'Most Outstanding and Versatile Teaching Assistant of the Year': 'Academic and Intellectual Excellence',

    'Best Student Leader of the Year': 'Leadership and Governance',
    'Best Student Politician of the Year': 'Leadership and Governance',
    'Best SRC Executive of the Year': 'Leadership and Governance',
    'Best NUGS Executive of the Year': 'Leadership and Governance',
    'Best Student Parliamentarian of the Year': 'Leadership and Governance',
    'Most Outstanding JCRC Executive of the Year': 'Leadership and Governance',
    'Most Outstanding Departmental President of the Year': 'Leadership and Governance',

    'Most Popular Student of the Year': 'General Students Awards',
    'Most Influential Student of the Year': 'General Students Awards',
    'Most Talented Student of the Year': 'General Students Awards',
    'Perfect Lady of the Year': 'General Students Awards',
    'Perfect Gentleman of the Year': 'General Students Awards',
    'Most Photogenic Male/Female of the Year': 'General Students Awards',
    'Best Pals of the Year': 'General Students Awards',
    'Best Couple on Campus of the Year': 'General Students Awards',

    'Student Entrepreneur of the Year': 'Entrepreneurship and Innovation',
    'Most Innovative Student Business of the Year': 'Entrepreneurship and Innovation',
    'Most Impactful Student Business of the Year': 'Entrepreneurship and Innovation',
    'Most Promising Startup of the Year': 'Entrepreneurship and Innovation',

    'Best Student Actor/Actress of the Year': 'Entertainment and Creative Awards',
    'Best Dancer of the Year': 'Entertainment and Creative Awards',
    'Best Dance Group of the Year': 'Entertainment and Creative Awards',
    'Most Outstanding Student Artist of the Year': 'Entertainment and Creative Awards',
    'Best Campus Instrumentalist of the Year': 'Entertainment and Creative Awards',

    'Best Student MC of the Year': 'Media, Digital and Personality Awards',
    'Best Student Radio Personality of the Year': 'Media, Digital and Personality Awards',
    'Best TikToker of the Year': 'Media, Digital and Personality Awards',
    'Student Blogger of the Year': 'Media, Digital and Personality Awards',
    'Best Campus DJ of the Year': 'Media, Digital and Personality Awards',

    'Most Fashionable Student of the Year': 'Fashion and Beauty Awards',
    'Best Student Model of the Year': 'Fashion and Beauty Awards',
    'Best Fashion Designer of the Year': 'Fashion and Beauty Awards',
    'Best Makeup Artist of the Year': 'Fashion and Beauty Awards',

    'Best Graphic Designer': 'Creative Professionals Awards',
    'Best Photographer of the Year': 'Creative Professionals Awards',
    'Student Barber of the Year': 'Creative Professionals Awards',

    'Best Male Sports Personality of the Year': 'Sports Awards',
    'Best Female Sports Personality of the Year': 'Sports Awards',

    'Most Vibrant Association of the Year': 'Campus Groups and Associations Awards',
    'Most Vibrant Political Association of the Year': 'Campus Groups and Associations Awards',
    'Best Hall of the Year': 'Campus Groups and Associations Awards',
    'Best Morale Group of the Year': 'Campus Groups and Associations Awards'
  };

  // ── DOM References ────────────────────────────────────────────
  const form = document.getElementById('nomination-form');
  const uploadArea = document.getElementById('upload-area');
  const photoInput = document.getElementById('photo');
  const photoPreview = document.getElementById('photo-preview');
  const previewImg = document.getElementById('preview-img');
  const successState = document.getElementById('success-state');
  const submitAnotherBtn = document.getElementById('submit-another-btn');
  const submitBtn = document.getElementById('submit-btn');

  const fields = {
    photo: photoInput,
    category: document.getElementById('category'),
    fullName: document.getElementById('fullName'),
    bio: document.getElementById('bio'),
    mobile: document.getElementById('mobile'),
    email: document.getElementById('email')
  };

  let hasAttemptedSubmit = false;

  // ── Photo Upload ──────────────────────────────────────────────
  uploadArea.addEventListener('click', function () {
    photoInput.click();
  });

  photoInput.addEventListener('change', function () {
    const file = photoInput.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showError('photo', 'Please upload a JPG, PNG, or WEBP image');
      photoInput.value = '';
      return;
    }

    // Validate size (max 4MB)
    if (file.size > 4194304) {
      showError('photo', 'Photo must be under 4MB');
      photoInput.value = '';
      return;
    }

    clearError('photo');

    // Show preview
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
      photoPreview.classList.remove('hidden');
      uploadArea.classList.add('has-preview');
    };
    reader.readAsDataURL(file);
  });

  // ── Validation Helpers ────────────────────────────────────────
  function showError(fieldKey, message) {
    const errorEl = document.getElementById(fieldKey + '-error');
    const groupEl = document.getElementById(fieldKey + '-group');

    if (errorEl) {
      if (message) errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
    if (groupEl) {
      groupEl.classList.add('field-error');
    }
    // Special handling for photo field (no group wrapper in the same pattern)
    if (fieldKey === 'photo' && !groupEl) {
      uploadArea.parentElement.classList.add('field-error');
    }
  }

  function clearError(fieldKey) {
    const errorEl = document.getElementById(fieldKey + '-error');
    const groupEl = document.getElementById(fieldKey + '-group');

    if (errorEl) {
      errorEl.classList.remove('visible');
    }
    if (groupEl) {
      groupEl.classList.remove('field-error');
    }
    if (fieldKey === 'photo' && !groupEl) {
      uploadArea.parentElement.classList.remove('field-error');
    }
  }

  function validateField(fieldKey) {
    const value = fields[fieldKey] ? fields[fieldKey].value.trim() : '';

    switch (fieldKey) {
      case 'photo':
        if (!photoInput.files || !photoInput.files[0]) {
          showError('photo', 'Please upload a photo');
          return false;
        }
        clearError('photo');
        return true;

      case 'category':
        if (!value) {
          showError('category', 'Please select a category');
          return false;
        }
        clearError('category');
        return true;

      case 'fullName':
        if (!value || value.length < 3) {
          showError('fullName', 'Full name is required (minimum 3 characters)');
          return false;
        }
        clearError('fullName');
        return true;



      case 'bio':
        if (!value || value.length < 20) {
          showError('bio', 'Bio is required (minimum 20 characters)');
          return false;
        }
        clearError('bio');
        return true;

      case 'mobile': {
        const mobileRegex = /^0\d{9}$/;
        if (!value || !mobileRegex.test(value)) {
          showError('mobile', 'Valid 10-digit mobile number required (starts with 0)');
          return false;
        }
        clearError('mobile');
        return true;
      }

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          showError('email', 'Valid email address is required');
          return false;
        }
        clearError('email');
        return true;
      }

      default:
        return true;
    }
  }

  function validateAll() {
    const fieldKeys = ['photo', 'category', 'fullName', 'bio', 'mobile', 'email'];
    let allValid = true;
    let firstInvalid = null;

    fieldKeys.forEach(function (key) {
      const valid = validateField(key);
      if (!valid && allValid) {
        allValid = false;
        firstInvalid = key;
      }
    });

    // Scroll to first invalid
    if (firstInvalid) {
      let scrollTarget;
      if (firstInvalid === 'photo') {
        scrollTarget = uploadArea;
      } else {
        scrollTarget = document.getElementById(firstInvalid + '-group') || fields[firstInvalid];
      }
      if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return allValid;
  }

  // ── Live Validation After First Attempt ───────────────────────
  function attachLiveValidation() {
    Object.keys(fields).forEach(function (key) {
      const el = fields[key];
      if (!el) return;

      const eventType = (el.tagName === 'SELECT' || el.type === 'file') ? 'change' : 'input';
      el.addEventListener(eventType, function () {
        if (hasAttemptedSubmit) {
          validateField(key);
        }
      });
    });
  }

  attachLiveValidation();

  // ── Form Submission ───────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hasAttemptedSubmit = true;

    if (!validateAll()) {
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append('photo', photoInput.files[0]);
    formData.append('category', fields.category.value);
    formData.append('categoryGroup', categoryGroups[fields.category.value] || '');
    formData.append('fullName', fields.fullName.value.trim());
    formData.append('bio', fields.bio.value.trim());
    formData.append('mobile', fields.mobile.value.trim());
    formData.append('email', fields.email.value.trim());

    // Disable button
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.querySelector('span').textContent = 'Submitting...';

    fetch('/api/nominations', {
      method: 'POST',
      body: formData
    })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (data) {
            throw new Error(data.message || 'Submission failed. Please try again.');
          });
        }
        return res.json();
      })
      .then(function () {
        // Show success state
        document.getElementById('success-name').textContent = fields.fullName.value.trim();
        document.getElementById('success-category').textContent = fields.category.value;

        form.style.display = 'none';
        successState.style.display = 'block';
        successState.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.querySelector('span').textContent = 'Submit for Review';

        // Show general error
        var existingAlert = document.getElementById('submission-error-alert');
        if (existingAlert) existingAlert.remove();

        var alertDiv = document.createElement('div');
        alertDiv.id = 'submission-error-alert';
        alertDiv.className = 'bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4';
        alertDiv.textContent = err.message || 'Something went wrong. Please try again.';
        submitBtn.parentElement.insertBefore(alertDiv, submitBtn);

        setTimeout(function () {
          if (alertDiv.parentElement) alertDiv.remove();
        }, 6000);
      });
  });

  // ── Submit Another ────────────────────────────────────────────
  submitAnotherBtn.addEventListener('click', function () {
    // Reset form
    form.reset();
    photoPreview.classList.add('hidden');
    previewImg.src = '';
    uploadArea.classList.remove('has-preview');
    hasAttemptedSubmit = false;

    // Clear all errors
    var fieldKeys = ['photo', 'category', 'fullName', 'bio', 'mobile', 'email'];
    fieldKeys.forEach(function (key) {
      clearError(key);
    });

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.querySelector('span').textContent = 'Submit for Review';

    // Show form, hide success
    successState.style.display = 'none';
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

})();
