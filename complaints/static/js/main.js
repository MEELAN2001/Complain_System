// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Auto-hide messages after 5 seconds
  const messages = document.querySelectorAll(".message")
  if (messages.length > 0) {
    setTimeout(() => {
      messages.forEach((message) => {
        message.style.opacity = "0"
        setTimeout(() => {
          message.style.display = "none"
        }, 500)
      })
    }, 5000)
  }

  // Add animation to buttons
  const buttons = document.querySelectorAll(".btn")
  buttons.forEach((button) => {
    button.addEventListener("mousedown", function () {
      this.style.transform = "translateY(0)"
    })

    button.addEventListener("mouseup", function () {
      this.style.transform = ""
    })

    button.addEventListener("mouseleave", function () {
      this.style.transform = ""
    })
  })
})
