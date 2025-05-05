// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll(".alert")
  if (alerts.length > 0) {
    setTimeout(() => {
      alerts.forEach((alert) => {
        const bsAlert = new bootstrap.Alert(alert)
        bsAlert.close()
      })
    }, 5000)
  }

  // File input preview
  const fileInput = document.getElementById("image")
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const file = this.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          // You could add image preview functionality here if needed
        }
        reader.readAsDataURL(file)
      }
    })
  }
})
