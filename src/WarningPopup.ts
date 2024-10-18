export function createWarningPopup(onDismiss: () => void): HTMLElement {
  const popup = document.createElement("div");
  popup.className = "tsw-warning";

  const messageContainer = document.createElement("div");
  messageContainer.className = "tsw-warning-container";

  const icon = document.createElement("span");
  icon.textContent = "⏳"; // Hourglass emoji
  icon.style.marginRight = "10px";
  messageContainer.appendChild(icon);

  const message = document.createElement("span");
  message.textContent = "Time limit approaching: ";
  messageContainer.appendChild(message);

  const countdownElement = document.createElement("span");
  countdownElement.style.fontWeight = "bold";
  messageContainer.appendChild(countdownElement);

  popup.appendChild(messageContainer);

  const dismissButton = document.createElement("button");
  dismissButton.textContent = "✕"; // Cross mark
  dismissButton.className = "tsw-warning-close";
  dismissButton.addEventListener("click", onDismiss);
  popup.appendChild(dismissButton);

  let countdown = 10;
  const updateCountdown = () => {
    countdownElement.textContent = `${countdown}s remaining`;
    if (countdown > 0) {
      countdown--;
      setTimeout(updateCountdown, 1000);
    }
  };

  // Slide in the popup
  setTimeout(() => {
    popup.style.transform = "translateY(0)";
  }, 100);

  updateCountdown();

  return popup;
}
