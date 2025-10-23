// Get category from URL
const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get('category');
const subcategoryId = urlParams.get('subcategory');

// Sample services data
function generateSampleServices(category, subcategory) {
    const services = [];
    const serviceNames = subcategory ? subcategory.services : 
        Object.values(category.subcategories).flatMap(sub => sub.services);
    
    serviceNames.forEach((serviceName, index) => {
        services.push({
            id: index + 1,
            title: serviceName,
            seller: `전문가${index + 1}`,
            rating: (4 + Math.random()).toFixed(1),
            reviews: Math.floor(Math.random() * 200) + 10,
            price: (Math.floor(Math.random() * 20) + 3) * 10000,
            thumbnail: `https://via.placeholder.com/300x200/f5f7fa/1a1a2e?text=${encodeURIComponent(serviceName)}`,
            badge: index % 3 === 0 ? '베스트셀러' : index % 4 === 0 ? '신규' : null
        });
    });
    
    return services;
}

// Initialize page
function initializePage() {
    const category = CATEGORIES[categoryId];
    
    if (!category) {
        window.location.href = 'index.html';
        return;
    }
    
    // Set page title and breadcrumb
    document.getElementById('breadcrumb-category').textContent = category.name;
    document.getElementById('category-title').textContent = category.name;
    
    if (subcategoryId) {
        const subcategory = category.subcategories[subcategoryId];
        if (subcategory) {
            document.getElementById('category-title').textContent = subcategory.name;
            document.getElementById('category-description').textContent = 
                `${subcategory.name} 전문가들이 제공하는 다양한 서비스를 만나보세요`;
        }
    } else {
        document.getElementById('category-description').textContent = 
            `${category.name} 전문가들이 제공하는 다양한 서비스를 만나보세요`;
    }
    
    // Generate subcategory filters
    const subcategoryFilters = document.getElementById('subcategory-filters');
    subcategoryFilters.innerHTML = '';
    Object.entries(category.subcategories).forEach(([subId, sub]) => {
        const label = document.createElement('label');
        label.className = 'filter-checkbox';
        label.innerHTML = `
            <input type="checkbox" value="${subId}" ${subcategoryId === subId ? 'checked' : ''}>
            <span>${sub.name}</span>
        `;
        label.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                window.location.href = `services.html?category=${categoryId}&subcategory=${subId}`;
            }
        });
        subcategoryFilters.appendChild(label);
    });
    
    // Generate and display services
    const subcategory = subcategoryId ? category.subcategories[subcategoryId] : null;
    const services = generateSampleServices(category, subcategory);
    displayServices(services);
    
    // Initialize mega menu
    initializeMegaMenu();
}

// Display services
function displayServices(services) {
    const grid = document.getElementById('services-grid');
    const resultsCount = document.getElementById('results-count');
    
    resultsCount.textContent = services.length;
    grid.innerHTML = '';
    
    services.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        
        card.innerHTML = `
            <div class="service-thumbnail">
                <img src="${service.thumbnail}" alt="${service.title}">
                ${service.badge ? `<span class="service-badge">${service.badge}</span>` : ''}
            </div>
            <div class="service-info">
                <div class="service-seller">
                    <div class="seller-avatar">${service.seller.charAt(0)}</div>
                    <span>${service.seller}</span>
                </div>
                <h3 class="service-title">${service.title}</h3>
                <div class="service-rating">
                    <span class="rating-star">⭐</span>
                    <span class="rating-value">${service.rating}</span>
                    <span class="rating-count">(${service.reviews})</span>
                </div>
                <div class="service-price">
                    <span class="price-label">시작가</span>
                    <span class="price-value">${service.price.toLocaleString()}원</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            alert(`${service.title} 상세 페이지로 이동합니다.`);
        });
        
        grid.appendChild(card);
    });
}

// Menu toggle
const categoryBtn = document.querySelector('.category-btn');
const megaMenu = document.querySelector('.mega-menu');

categoryBtn.addEventListener('click', () => {
    megaMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-wrapper')) {
        megaMenu.classList.remove('active');
    }
});

// Populate Mega Menu
function initializeMegaMenu() {
    const container = document.getElementById('mega-categories-container');
    container.innerHTML = '';
    
    Object.values(CATEGORIES).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'mega-category';
        
        let html = `<div class="mega-category-title">${category.icon} ${category.name}</div>`;
        
        Object.entries(category.subcategories).forEach(([subId, sub]) => {
            html += `
                <div class="mega-subcategory">
                    <div class="mega-subcategory-name">${sub.name}</div>
                    <div class="mega-service-list">
                        ${sub.services.map(service => `<div class="mega-service-item">${service}</div>`).join('')}
                    </div>
                </div>
            `;
        });
        
        categoryDiv.innerHTML = html;
        container.appendChild(categoryDiv);
    });
}

// Search functionality
document.querySelector('.search-btn').addEventListener('click', () => {
    const searchTerm = document.querySelector('.search-input').value;
    if (searchTerm.trim()) {
        alert(`"${searchTerm}" 검색 결과 페이지로 이동합니다.`);
    }
});

document.querySelector('.search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.querySelector('.search-btn').click();
    }
});

// Mobile Search Overlay
function initializeMobileSearch() {
    const searchBtn = document.getElementById('mobile-search-btn');
    const searchOverlay = document.getElementById('mobile-search-overlay');
    const backBtn = document.getElementById('search-back-btn');
    const suggestionTags = document.getElementById('suggestion-tags');
    
    if (searchBtn && searchOverlay) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        backBtn.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Populate suggestion tags
        if (suggestionTags) {
            TRENDING_KEYWORDS.forEach(keyword => {
                const tag = document.createElement('span');
                tag.className = 'suggestion-tag';
                tag.textContent = keyword;
                tag.addEventListener('click', () => {
                    document.getElementById('search-overlay-input').value = keyword;
                });
                suggestionTags.appendChild(tag);
            });
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializePage);
document.addEventListener('DOMContentLoaded', initializeMobileSearch);