// ============================================================
// LNUGS-UENR Excellence Awards 2026 — Admin Dashboard Logic
// ============================================================

(function () {
    'use strict';

    const PER_PAGE = 25;
    let allNominations = [];
    let filteredNominations = [];
    let currentPage = 1;

    // Chart instances
    let categoryGroupChartInstance = null;
    let dailyChartInstance = null;

    // --------------------------------------------------------
    // Date Formatting
    // --------------------------------------------------------
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function formatDate(dateStr) {
        if (!dateStr) return '--';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '--';
        const day = String(d.getDate()).padStart(2, '0');
        const month = MONTHS[d.getMonth()];
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return day + ' ' + month + ' ' + year + ', ' + hours + ':' + minutes;
    }

    // --------------------------------------------------------
    // Session Check
    // --------------------------------------------------------
    async function checkSession() {
        try {
            const res = await fetch('/api/admin/nominations');
            if (res.status === 401) {
                window.location.href = '/admin-login.html';
                return false;
            }
            const data = await res.json();
            allNominations = data.data || data.nominations || data || [];
            filteredNominations = [...allNominations];
            populateCategoryFilter();
            return true;
        } catch (err) {
            window.location.href = '/admin-login.html';
            return false;
        }
    }

    // --------------------------------------------------------
    // Logout
    // --------------------------------------------------------
    function setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function () {
                try {
                    await fetch('/api/admin/logout', { method: 'POST' });
                } catch (e) {
                    // proceed regardless
                }
                window.location.href = '/admin-login.html';
            });
        }
    }

    // --------------------------------------------------------
    // Load Stats
    // --------------------------------------------------------
    async function loadStats() {
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) return;
            const stats = await res.json();

            // Stat cards
            setText('stat-total', stats.totalNominations ?? '--');
            setText('stat-categories', stats.categoriesCovered ?? '--');
            setText('stat-today', stats.todaySubmissions ?? '--');
            setText('stat-top-category', stats.topCategory ?? '--');

            // Charts
            renderCategoryGroupChart(stats.byGroup || []);
            renderDailyChart(stats.dailySubmissions || []);

            // Top categories table
            renderTopCategories(stats.topCategories || [], stats.totalNominations || 0);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // --------------------------------------------------------
    // Charts
    // --------------------------------------------------------
    function renderCategoryGroupChart(byGroup) {
        const ctx = document.getElementById('categoryGroupChart');
        if (!ctx) return;

        if (categoryGroupChartInstance) categoryGroupChartInstance.destroy();

        categoryGroupChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: byGroup.map(function (item) { return item.group; }),
                datasets: [{
                    label: 'Nominations',
                    data: byGroup.map(function (item) { return item.count; }),
                    backgroundColor: '#C0111F',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: '#f0f0f0' },
                        ticks: { font: { family: 'Satoshi' } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0f0f0' },
                        ticks: { font: { family: 'Satoshi' } }
                    }
                }
            }
        });
    }



    function renderDailyChart(dailySubmissions) {
        const ctx = document.getElementById('dailyChart');
        if (!ctx) return;

        if (dailyChartInstance) dailyChartInstance.destroy();

        dailyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dailySubmissions.map(function (item) { return item.date; }),
                datasets: [{
                    label: 'Submissions',
                    data: dailySubmissions.map(function (item) { return item.count; }),
                    borderColor: '#C0111F',
                    backgroundColor: 'rgba(192,17,31,0.1)',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#C0111F',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: '#f0f0f0' },
                        ticks: { font: { family: 'Satoshi' }, maxTicksLimit: 15 }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f0f0f0' },
                        ticks: { font: { family: 'Satoshi' } }
                    }
                }
            }
        });
    }

    // --------------------------------------------------------
    // Top Categories Table
    // --------------------------------------------------------
    function renderTopCategories(topCategories, totalNominations) {
        const tbody = document.getElementById('top-categories-body');
        if (!tbody) return;

        if (!topCategories.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-sm" style="color: #6b7280;">No data available</td></tr>';
            return;
        }

        var html = '';
        topCategories.forEach(function (item, i) {
            var pct = totalNominations > 0
                ? (item.count / totalNominations * 100).toFixed(1) + '%'
                : '0.0%';
            var bgColor = (i % 2 === 1) ? 'background-color: #FEF2F2;' : '';
            html += '<tr style="' + bgColor + '">'
                + '<td class="px-6 py-3 text-sm" style="color: #374151;">' + (i + 1) + '</td>'
                + '<td class="px-6 py-3 text-sm" style="color: #374151;">' + escapeHtml(item.category) + '</td>'
                + '<td class="px-6 py-3 text-sm" style="color: #374151;">' + escapeHtml(item.group || '--') + '</td>'
                + '<td class="px-6 py-3 text-sm" style="font-weight: 600; color: #1a1a1a;">' + item.count + '</td>'
                + '<td class="px-6 py-3 text-sm" style="color: #374151;">' + pct + '</td>'
                + '</tr>';
        });
        tbody.innerHTML = html;
    }

    // --------------------------------------------------------
    // All Nominations Table
    // --------------------------------------------------------
    function renderNominations() {
        var tbody = document.getElementById('nominations-body');
        var countEl = document.getElementById('nominations-count');
        if (!tbody) return;

        var total = filteredNominations.length;
        var totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
        if (currentPage > totalPages) currentPage = totalPages;

        var start = (currentPage - 1) * PER_PAGE;
        var end = Math.min(start + PER_PAGE, total);
        var pageData = filteredNominations.slice(start, end);

        if (countEl) countEl.textContent = '(' + total + ')';

        if (!pageData.length) {
            tbody.innerHTML = '<tr><td colspan="9" class="px-4 py-6 text-center text-sm" style="color: #6b7280;">No nominations found</td></tr>';
        } else {
            var html = '';
            pageData.forEach(function (nom, i) {
                var rowIdx = start + i + 1;
                var photoHtml;
                if (nom.photo_url) {
                    photoHtml = '<img src="' + escapeHtml(nom.photo_url) + '" width="40" height="40" class="rounded-full" style="object-fit: cover;" alt="">';
                } else {
                    photoHtml = '<div class="rounded-full flex items-center justify-center text-xs text-white" style="width:40px;height:40px;background-color:#C0111F;font-weight:600;">'
                        + getInitials(nom.full_name || nom.fullName || '')
                        + '</div>';
                }
                var hoverStyle = 'transition: background-color 0.15s;';
                html += '<tr style="' + hoverStyle + '" onmouseover="this.style.backgroundColor=\'#FEF2F2\'" onmouseout="this.style.backgroundColor=\'transparent\'">'
                    + '<td class="px-4 py-3 text-sm" style="color: #374151;">' + rowIdx + '</td>'
                    + '<td class="px-4 py-3">' + photoHtml + '</td>'
                    + '<td class="px-4 py-3 text-sm" style="color: #1a1a1a; font-weight: 500;">' + escapeHtml(nom.full_name || nom.fullName || '--') + '</td>'
                    + '<td class="px-4 py-3 text-sm" style="color: #374151;">' + escapeHtml(nom.category || '--') + '</td>'
                    + '<td class="px-4 py-3 text-sm" style="color: #374151;">' + escapeHtml(nom.mobile || nom.phone || '--') + '</td>'
                    + '<td class="px-4 py-3 text-sm" style="color: #374151;">' + escapeHtml(nom.email || '--') + '</td>'
                    + '<td class="px-4 py-3 text-sm" style="color: #6b7280; white-space: nowrap;">' + formatDate(nom.submitted_at || nom.createdAt || nom.created_at) + '</td>'
                    + '<td class="px-4 py-3 text-sm">'
                    + '<button onclick="deleteNomination(' + nom.id + ')" class="text-white px-2 py-1 rounded text-xs transition-colors" style="background-color: #C0111F;" onmouseover="this.style.backgroundColor=\'#8B0000\'" onmouseout="this.style.backgroundColor=\'#C0111F\'">Delete</button>'
                    + '</td>'
                    + '</tr>';
            });
            tbody.innerHTML = html;
        }

        renderPagination(total, totalPages, start, end);
    }

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------
    function renderPagination(total, totalPages, start, end) {
        var infoEl = document.getElementById('pagination-info');
        var btnsEl = document.getElementById('pagination-buttons');
        if (!infoEl || !btnsEl) return;

        var showing = total > 0 ? (start + 1) : 0;
        infoEl.textContent = 'Showing ' + showing + ' to ' + end + ' of ' + total + ' entries';

        var html = '';

        // Previous button
        html += '<button class="px-3 py-1.5 text-sm border rounded transition-colors duration-150" '
            + 'style="' + (currentPage <= 1 ? 'color:#9ca3af;cursor:not-allowed;border-color:#e5e7eb;' : 'color:#374151;border-color:#d1d5db;cursor:pointer;') + '" '
            + (currentPage <= 1 ? 'disabled' : 'onclick="window.__adminPaginate(' + (currentPage - 1) + ')"')
            + '>Previous</button>';

        // Page buttons
        var pages = getPageNumbers(currentPage, totalPages);
        pages.forEach(function (p) {
            if (p === '...') {
                html += '<span class="px-2 py-1.5 text-sm" style="color: #9ca3af;">...</span>';
            } else {
                var isActive = p === currentPage;
                html += '<button class="px-3 py-1.5 text-sm border rounded transition-colors duration-150" '
                    + 'style="'
                    + (isActive ? 'background-color:#C0111F;color:#fff;border-color:#C0111F;font-weight:600;' : 'color:#374151;border-color:#d1d5db;cursor:pointer;')
                    + '" onclick="window.__adminPaginate(' + p + ')">' + p + '</button>';
            }
        });

        // Next button
        html += '<button class="px-3 py-1.5 text-sm border rounded transition-colors duration-150" '
            + 'style="' + (currentPage >= totalPages ? 'color:#9ca3af;cursor:not-allowed;border-color:#e5e7eb;' : 'color:#374151;border-color:#d1d5db;cursor:pointer;') + '" '
            + (currentPage >= totalPages ? 'disabled' : 'onclick="window.__adminPaginate(' + (currentPage + 1) + ')"')
            + '>Next</button>';

        btnsEl.innerHTML = html;
    }

    function getPageNumbers(current, total) {
        if (total <= 7) {
            var arr = [];
            for (var i = 1; i <= total; i++) arr.push(i);
            return arr;
        }
        var pages = [];
        pages.push(1);
        if (current > 3) pages.push('...');
        for (var j = Math.max(2, current - 1); j <= Math.min(total - 1, current + 1); j++) {
            pages.push(j);
        }
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    }

    // Expose paginate globally for inline onclick
    window.__adminPaginate = function (page) {
        currentPage = page;
        renderNominations();
        // Scroll to table
        var tableSection = document.getElementById('nominations-body');
        if (tableSection) {
            tableSection.closest('.bg-white').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // --------------------------------------------------------
    // Search and Filter
    // --------------------------------------------------------
    function populateCategoryFilter() {
        var filterSelect = document.getElementById('category-filter');
        if (!filterSelect) return;
        
        var categories = [];
        allNominations.forEach(function(n) {
            var cat = n.category;
            if (cat && categories.indexOf(cat) === -1) {
                categories.push(cat);
            }
        });
        
        filterSelect.innerHTML = '<option value="">All Categories</option>';
        categories.sort().forEach(function(cat) {
            var option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterSelect.appendChild(option);
        });
        
        filterSelect.addEventListener('change', applyFiltersAndSearch);
    }

    function applyFiltersAndSearch() {
        var searchInput = document.getElementById('search-input');
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        
        var filterSelect = document.getElementById('category-filter');
        var selectedCategory = filterSelect ? filterSelect.value : '';

        filteredNominations = allNominations.filter(function (nom) {
            var matchSearch = true;
            if (query) {
                var name = (nom.full_name || nom.fullName || '').toLowerCase();
                var email = (nom.email || '').toLowerCase();
                var category = (nom.category || '').toLowerCase();
                matchSearch = name.indexOf(query) !== -1 || email.indexOf(query) !== -1 || category.indexOf(query) !== -1;
            }
            
            var matchCategory = true;
            if (selectedCategory) {
                matchCategory = nom.category === selectedCategory;
            }
            
            return matchSearch && matchCategory;
        });

        currentPage = 1;
        renderNominations();
    }

    function setupSearch() {
        var searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        var debounceTimer;
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                applyFiltersAndSearch();
            }, 300);
        });
    }

    // --------------------------------------------------------
    // Excel Download
    // --------------------------------------------------------
    function setupDownload() {
        var btn = document.getElementById('download-excel-btn');
        if (btn) {
            btn.addEventListener('click', function () {
                window.location.href = '/api/admin/export';
            });
        }
    }

    // --------------------------------------------------------
    // Helpers
    // --------------------------------------------------------
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getInitials(name) {
        if (!name) return '?';
        var parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    }

    // --------------------------------------------------------
    // Init
    // --------------------------------------------------------
    async function init() {
        var authenticated = await checkSession();
        if (!authenticated) return;

        setupLogout();
        setupSearch();
        setupDownload();

        renderNominations();
        await loadStats();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // --------------------------------------------------------
    // Delete Nomination
    // --------------------------------------------------------
    window.deleteNomination = async function(id) {
        if (!confirm('Are you sure you want to delete this nomination?')) return;
        
        try {
            const res = await fetch('/api/admin/nominations/' + id, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (res.ok) {
                // Reload data
                await loadStats();
                const nomsRes = await fetch('/api/admin/nominations');
                const nomsData = await nomsRes.json();
                allNominations = nomsData.data || nomsData.nominations || nomsData || [];
                // Re-apply current search filter
                applyFiltersAndSearch();
            } else {
                alert('Error: ' + (data.message || 'Failed to delete nomination.'));
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while deleting the nomination.');
        }
    };

})();
