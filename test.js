// tooltip-module.js
document.addEventListener("DOMContentLoaded", () => {
  const tooltipTriggers = document.querySelectorAll("[data-tooltip-target]");

  tooltipTriggers.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tooltip-target");
      const tooltipBox = document.getElementById(targetId);
      if (tooltipBox) {
        tooltipBox.classList.toggle("hidden");
      } else {
        console.warn(`Tooltip box with ID "${targetId}" not found.`);
      }
    });
  });
});
