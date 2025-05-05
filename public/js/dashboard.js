document.addEventListener("DOMContentLoaded", () => {
  // Handle status filter change
  const statusFilter = document.getElementById("status")
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      this.form.submit()
    })
  }

  // Handle search form submission
  const searchForm = document.querySelector("form[action='/dashboard']")
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      const searchInput = document.getElementById("search")
      if (searchInput && searchInput.value.trim() === "") {
        e.preventDefault()
        searchInput.focus()
      }
    })
  }
})
