export function createWarningPopup(onDismiss: () => void): HTMLElement {
  const popup = document.createElement("div");
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: rgba(44, 62, 80, 0.9); // Dark blue-grey, semi-transparent
    color: white;
    padding: 10px 20px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    transform: translateY(-100%);
    z-index: 9999;
  `;

  const messageContainer = document.createElement("div");
  messageContainer.style.cssText = `
    display: flex;
    align-items: center;
  `;

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
  dismissButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
    padding: 0 5px;
  `;
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
