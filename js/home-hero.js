(function () {
  const form = document.getElementById("semester-form");
  const select = document.getElementById("semester-select");
  if (!form || !select) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (select.value) {
      window.location.href = select.value;
    } else {
      select.focus();
    }
  });
})();
