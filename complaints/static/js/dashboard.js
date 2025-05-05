document.addEventListener("DOMContentLoaded", () => {
  // Handle status filter change
  const statusFilter = document.getElementById("status")
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      this.form.submit()
    })
  }

  // Handle search form submission
  const searchForm = document.querySelector(".filter-form")
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      const searchInput = document.getElementById("search")
      if (searchInput && searchInput.value.trim() === "") {
        e.preventDefault()
        searchInput.focus()
      }
    })
  }

  // Add row highlighting on table hover
  const tableRows = document.querySelectorAll(".complaints-table tbody tr")
  tableRows.forEach((row) => {
    row.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#f0f4f8"
    })

    row.addEventListener("mouseleave", function () {
      this.style.backgroundColor = ""
    })
  })
})

// <!-- Add this to your JS file -->

  function updateStatus(complaintId, status) {
    if (confirm('Are you sure you want to update the status?')) {
      // Create a form and submit it
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/complaint/${complaintId}/status`;
      
      const statusInput = document.createElement('input');
      statusInput.type = 'hidden';
      statusInput.name = 'status';
      statusInput.value = status;
      
      form.appendChild(statusInput);
      document.body.appendChild(form);
      form.submit();
    }
  }

