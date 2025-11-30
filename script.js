// نظام إدارة عقود الاعتماد الأكاديمي

// Global variables
let currentPage = 1;
const itemsPerPage = 10;
let filteredContracts = [];
let allContracts = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadContractsData();
    populateFilters();
    displayContracts();
    setupEventListeners();
});

// Tab Navigation
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Accordion functionality
function toggleAccordion(element) {
    const item = element.closest('.accordion-item');
    const isActive = item.classList.contains('active');
    
    // Close all accordions
    document.querySelectorAll('.accordion-item').forEach(acc => {
        acc.classList.remove('active');
    });
    
    // Open clicked accordion if it wasn't active
    if (!isActive) {
        item.classList.add('active');
    }
}

// Search functions
function searchUniversities() {
    const searchTerm = document.getElementById('universitySearch').value.toLowerCase();
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

function searchSpecializations() {
    const searchTerm = document.getElementById('specializationSearch').value.toLowerCase();
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? 'block' : 'none';
    });
}

function searchAllContracts() {
    const searchTerm = document.getElementById('allContractsSearch').value.toLowerCase();
    applyFilters(searchTerm);
}

// Date search
function searchByDate() {
    const dateInput = document.getElementById('searchDate').value;
    if (!dateInput) {
        alert('الرجاء اختيار تاريخ للبحث');
        return;
    }
    
    const resultsDiv = document.getElementById('dateResults');
    const matchingContracts = allContracts.filter(contract => {
        return contract.startDate === dateInput || 
               contract.endDate === dateInput ||
               contract.visitDate === dateInput ||
               contract.documentsReceived === dateInput ||
               contract.documentsUpdated === dateInput;
    });
    
    if (matchingContracts.length === 0) {
        resultsDiv.innerHTML = `
            <div class="status-section">
                <div class="status-header info">
                    <h3>لا توجد عقود في التاريخ المحدد</h3>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="status-section">
            <div class="status-header success">
                <h3>العقود في تاريخ ${dateInput}</h3>
                <span class="count">${matchingContracts.length} عقد</span>
            </div>
            <div class="contracts-grid">
    `;
    
    matchingContracts.forEach(contract => {
        html += createContractCard(contract);
    });
    
    html += '</div></div>';
    resultsDiv.innerHTML = html;
}

// Timeline filtering
function filterTimeline(type) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const events = document.querySelectorAll('.timeline-event');
    
    if (type === 'all') {
        events.forEach(event => event.style.display = 'block');
        return;
    }
    
    events.forEach(event => {
        const eventType = event.querySelector('.event-type').textContent;
        if (type === 'start' && eventType.includes('بداية')) {
            event.style.display = 'block';
        } else if (type === 'end' && eventType.includes('نهاية')) {
            event.style.display = 'block';
        } else if (type === 'visit' && eventType.includes('زيارة')) {
            event.style.display = 'block';
        } else {
            event.style.display = 'none';
        }
    });
}

// Filters
function populateFilters() {
    const universities = [...new Set(allContracts.map(c => c.university))].sort();
    const universitySelect = document.getElementById('filterUniversity');
    
    universities.forEach(uni => {
        const option = document.createElement('option');
        option.value = uni;
        option.textContent = uni;
        universitySelect.appendChild(option);
    });
}

function applyFilters(searchTerm = '') {
    const university = document.getElementById('filterUniversity').value;
    const degree = document.getElementById('filterDegree').value;
    const department = document.getElementById('filterDepartment').value;
    const progress = document.getElementById('filterProgress').value;
    
    filteredContracts = allContracts.filter(contract => {
        const matchUniversity = !university || contract.university === university;
        const matchDegree = !degree || contract.degree === degree;
        const matchDepartment = !department || contract.department === department;
        const matchProgress = !progress || contract.progress.includes(progress);
        const matchSearch = !searchTerm || 
            contract.program.toLowerCase().includes(searchTerm) ||
            contract.university.toLowerCase().includes(searchTerm) ||
            contract.degree.toLowerCase().includes(searchTerm);
        
        return matchUniversity && matchDegree && matchDepartment && matchProgress && matchSearch;
    });
    
    currentPage = 1;
    displayContracts();
}

function resetFilters() {
    document.getElementById('filterUniversity').value = '';
    document.getElementById('filterDegree').value = '';
    document.getElementById('filterDepartment').value = '';
    document.getElementById('filterProgress').value = '';
    document.getElementById('allContractsSearch').value = '';
    
    filteredContracts = [...allContracts];
    currentPage = 1;
    displayContracts();
}

// Display contracts in table
function displayContracts() {
    const tbody = document.getElementById('contractsTableBody');
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const displayData = filteredContracts.length > 0 ? filteredContracts : allContracts;
    const pageData = displayData.slice(start, end);
    
    tbody.innerHTML = '';
    
    pageData.forEach(contract => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${contract.program}</td>
            <td>${contract.university}</td>
            <td><span class="badge info">${contract.degree}</span></td>
            <td>${formatDate(contract.startDate)}</td>
            <td>${formatDate(contract.endDate)}</td>
            <td>${contract.progress}</td>
            <td>${contract.department.replace('إدارة برامج ', '')}</td>
            <td><button class="btn-primary" onclick='showContractModal(${JSON.stringify(contract)})'>التفاصيل</button></td>
        `;
    });
    
    updatePagination(displayData.length);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

// Pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('pageInfo').textContent = `صفحة ${currentPage} من ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayContracts();
    }
}

function nextPage() {
    const totalPages = Math.ceil((filteredContracts.length || allContracts.length) / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayContracts();
    }
}

// Table sorting
let sortDirection = {};

function sortTable(columnIndex) {
    const table = document.getElementById('contractsTable');
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    
    sortDirection[columnIndex] = !sortDirection[columnIndex];
    const direction = sortDirection[columnIndex] ? 1 : -1;
    
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        return direction * aText.localeCompare(bText, 'ar');
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// Modal functions
function showContractModal(contract) {
    const modal = document.getElementById('contractModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h2>${contract.program}</h2>
        <div class="contract-details">
            <div class="detail-row">
                <strong>الجامعة:</strong>
                <span>${contract.university}</span>
            </div>
            <div class="detail-row">
                <strong>الدرجة العلمية:</strong>
                <span class="badge info">${contract.degree}</span>
            </div>
            <div class="detail-row">
                <strong>حالة العقد:</strong>
                <span class="badge success">${contract.status}</span>
            </div>
            <div class="detail-row">
                <strong>بداية العقد:</strong>
                <span>${formatDate(contract.startDate)}</span>
            </div>
            <div class="detail-row">
                <strong>نهاية العقد:</strong>
                <span>${formatDate(contract.endDate)}</span>
            </div>
            <div class="detail-row">
                <strong>نسبة الإنجاز:</strong>
                <span>${contract.progress}</span>
            </div>
            <div class="detail-row">
                <strong>الإدارة المختصة:</strong>
                <span>${contract.department}</span>
            </div>
            ${contract.visitDate ? `
                <div class="detail-row">
                    <strong>تاريخ زيارة المراجعين:</strong>
                    <span>${formatDate(contract.visitDate)}</span>
                </div>
            ` : ''}
            ${contract.documentsReceived ? `
                <div class="detail-row">
                    <strong>تاريخ استلام الوثائق:</strong>
                    <span>${formatDate(contract.documentsReceived)}</span>
                </div>
            ` : ''}
            ${contract.documentsUpdated ? `
                <div class="detail-row">
                    <strong>تاريخ استلام الوثائق المحدثة:</strong>
                    <span>${formatDate(contract.documentsUpdated)}</span>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('contractModal').style.display = 'none';
}

function showContractDetails(program, university, degree) {
    const contract = allContracts.find(c => 
        c.program === program && c.university === university && c.degree === degree
    );
    if (contract) {
        showContractModal(contract);
    }
}

// University details
function showUniversityContracts(universityName) {
    const contracts = allContracts.filter(c => c.university === universityName);
    
    const modal = document.getElementById('contractModal');
    const content = document.getElementById('modalContent');
    
    let html = `
        <h2>${universityName}</h2>
        <p><strong>إجمالي العقود:</strong> ${contracts.length} عقد</p>
        <div class="contracts-grid">
    `;
    
    contracts.forEach(contract => {
        html += createContractCard(contract);
    });
    
    html += '</div>';
    content.innerHTML = html;
    modal.style.display = 'block';
}

// Create contract card
function createContractCard(contract) {
    const statusClass = getStatusClass(contract.endDate);
    const statusText = getStatusText(contract.endDate);
    
    return `
        <div class="contract-card" onclick='showContractModal(${JSON.stringify(contract).replace(/'/g, "\\'")})'> 
            <h4>${contract.program}</h4>
            <p><strong>الجامعة:</strong> ${contract.university}</p>
            <p><strong>الدرجة:</strong> ${contract.degree}</p>
            <p><strong>بداية العقد:</strong> ${formatDate(contract.startDate)}</p>
            <p><strong>نهاية العقد:</strong> ${formatDate(contract.endDate)}</p>
            <span class="badge ${statusClass}">${statusText}</span>
        </div>
    `;
}

function getStatusClass(endDate) {
    if (!endDate) return 'info';
    const end = new Date(endDate);
    const now = new Date();
    const monthsDiff = (end - now) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsDiff < 0) return 'danger';
    if (monthsDiff < 6) return 'warning';
    if (monthsDiff < 12) return 'info';
    return 'success';
}

function getStatusText(endDate) {
    if (!endDate) return 'سارٍ';
    const end = new Date(endDate);
    const now = new Date();
    const monthsDiff = (end - now) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsDiff < 0) return 'منتهي';
    if (monthsDiff < 3) return 'ينتهي قريباً';
    if (monthsDiff < 6) return 'متبقي أشهر قليلة';
    if (monthsDiff < 12) return 'متبقي أقل من سنة';
    return 'سارٍ';
}

// Specialization details
function showSpecializationDetails(category) {
    const detailDiv = document.getElementById('specializationDetail');
    const contentDiv = document.getElementById('specializationContent');
    
    let categoryName = '';
    let contracts = [];
    
    switch(category) {
        case 'engineering':
            categoryName = 'التخصصات الهندسية وعلوم الحاسب';
            contracts = allContracts.filter(c => c.department === 'إدارة برامج العلوم الهندسية وعلوم الحاسب');
            break;
        case 'health':
            categoryName = 'التخصصات الصحية';
            contracts = allContracts.filter(c => c.department === 'إدارة برامج العلوم الصحية');
            break;
        case 'humanities':
            categoryName = 'العلوم الإنسانية والتربوية';
            contracts = allContracts.filter(c => c.department === 'إدارة برامج العلوم الإنسانية والتربوية');
            break;
        case 'islamic':
            categoryName = 'العلوم الإسلامية والعربية';
            contracts = allContracts.filter(c => c.department === 'إدارة برامج العلوم الإسلامية والعربية');
            break;
        case 'science':
            categoryName = 'التخصصات العلمية';
            contracts = allContracts.filter(c => c.department === 'إدارة برامج التخصصات العلمية');
            break;
    }
    
    let html = `
        <h2>${categoryName}</h2>
        <p class="category-count">${contracts.length} عقد</p>
        <div class="contracts-grid">
    `;
    
    contracts.forEach(contract => {
        html += createContractCard(contract);
    });
    
    html += '</div>';
    contentDiv.innerHTML = html;
    detailDiv.style.display = 'block';
    
    document.querySelector('.specialization-categories').style.display = 'none';
}

function closeSpecializationDetail() {
    document.getElementById('specializationDetail').style.display = 'none';
    document.querySelector('.specialization-categories').style.display = 'grid';
}

// Department details
function showDepartmentDetails(dept) {
    const detailDiv = document.getElementById('departmentDetail');
    const contentDiv = document.getElementById('departmentContent');
    
    let deptName = '';
    let contracts = [];
    
    switch(dept) {
        case 'engineering':
            deptName = 'إدارة برامج العلوم الهندسية وعلوم الحاسب';
            break;
        case 'health':
            deptName = 'إدارة برامج العلوم الصحية';
            break;
        case 'humanities':
            deptName = 'إدارة برامج العلوم الإنسانية والتربوية';
            break;
        case 'islamic':
            deptName = 'إدارة برامج العلوم الإسلامية والعربية';
            break;
        case 'science':
            deptName = 'إدارة برامج التخصصات العلمية';
            break;
    }
    
    contracts = allContracts.filter(c => c.department === deptName);
    
    let html = `
        <h2>${deptName}</h2>
        <p class="dept-count">${contracts.length} عقد</p>
        <div class="contracts-grid">
    `;
    
    contracts.forEach(contract => {
        html += createContractCard(contract);
    });
    
    html += '</div>';
    contentDiv.innerHTML = html;
    detailDiv.style.display = 'block';
    
    document.querySelector('.departments-stats').style.display = 'none';
}

function closeDepartmentDetail() {
    document.getElementById('departmentDetail').style.display = 'none';
    document.querySelector('.departments-stats').style.display = 'grid';
}

// Event listeners
function setupEventListeners() {
    window.onclick = function(event) {
        const modal = document.getElementById('contractModal');
        if (event.target === modal) {
            closeModal();
        }
    };
}

// Load contracts data (sample - في الإنتاج سيتم تحميلها من API أو ملف JSON)
function loadContractsData() {
    // هنا يتم تحميل البيانات الكاملة للـ 445 عقد
    // سأضع عينة من البيانات هنا
    allContracts = [
        {
            program: "الاقتصاد",
            university: "الجامعة الإسلامية",
            degree: "ماجستير",
            status: "تحت الإجراء",
            startDate: "2024-03-07",
            endDate: "2025-03-06",
            progress: "40% - زيارة التحقق",
            department: "إدارة برامج العلوم الإنسانية والتربوية",
            visitDate: "2026-01-25",
            documentsReceived: "2025-01-23",
            documentsUpdated: "2025-05-15"
        },
        // ... باقي العقود
    ];
    
    filteredContracts = [...allContracts];
}

console.log('نظام إدارة العقود جاهز للعمل');