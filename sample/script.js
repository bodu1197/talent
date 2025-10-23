// Menu Toggle
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

// Populate Trending Keywords
function initializeTrendingKeywords() {
    const container = document.getElementById('trending-container');
    
    TRENDING_KEYWORDS.forEach(keyword => {
        const tag = document.createElement('span');
        tag.className = 'trending-tag';
        tag.textContent = keyword;
        tag.addEventListener('click', () => {
            document.querySelector('.search-input').value = keyword;
        });
        container.appendChild(tag);
    });
}

// Populate Featured Categories
function initializeFeaturedCategories() {
    const grid = document.getElementById('featured-grid');
    
    Object.values(CATEGORIES).forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        
        const subcategoryCount = Object.keys(category.subcategories).length;
        let totalServices = 0;
        Object.values(category.subcategories).forEach(sub => {
            totalServices += sub.services.length;
        });
        
        card.innerHTML = `
            <div class="category-card-icon">${category.icon}</div>
            <div class="category-card-name">${category.name}</div>
            <div class="category-card-count">${totalServices}개 서비스</div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `services.html?category=${category.id}`;
        });
        
        grid.appendChild(card);
    });
    
    // Add "더보기" button
    const moreBtn = document.createElement('div');
    moreBtn.className = 'category-more-btn';
    moreBtn.innerHTML = `
        <div class="icon">*</div>
        <div class="text">더보기</div>
    `;
    moreBtn.addEventListener('click', showAllCategories);
    grid.appendChild(moreBtn);
}

// Show all categories overlay (Refactored)
function showAllCategories() {
    const overlay = document.getElementById('all-categories-overlay');
    const content = document.getElementById('all-categories-content');
    
    // Clear existing content
    content.innerHTML = '';
    
    const categoriesArray = Object.values(CATEGORIES);
    
    // 1. Create primary navigation area (1차 카테고리)
    const primaryNavWrapper = document.createElement('div');
    primaryNavWrapper.className = 'primary-nav-wrapper';
    
    // 2. Create secondary content area (2차 카테고리 상세)
    const secondaryContentWrapper = document.createElement('div');
    secondaryContentWrapper.className = 'secondary-content-wrapper';
    
    content.appendChild(primaryNavWrapper);
    content.appendChild(secondaryContentWrapper);
    
    let activeCategoryId = categoriesArray.length > 0 ? categoriesArray[0].id : null;
    
    function renderSecondaryContent(category) {
        if (!category) {
            secondaryContentWrapper.innerHTML = '<p style="padding: 24px; color: var(--text-secondary);">카테고리 정보가 없습니다.</p>';
            return;
        }
        
        secondaryContentWrapper.innerHTML = '';
        
        const section = document.createElement('div');
        section.className = 'all-category-section detailed-view';
        
        // Title visible only on mobile (desktop relies on sticky left nav)
        let html = `<div class="all-category-title mobile-only">${category.icon} ${category.name}</div>`;
        html += '<div class="all-subcategories">';
        
        // Render 2차 categories and 3차 (services)
        Object.entries(category.subcategories).forEach(([subId, sub]) => {
            html += `
                <div class="all-subcategory">
                    <div class="all-subcategory-name">${sub.name}</div>
                    <div class="all-service-list">
                        ${sub.services.map(service => 
                            `<a href="services.html?category=${category.id}&subcategory=${subId}&service=${encodeURIComponent(service)}" class="all-service-tag">${service}</a>`
                        ).join('')}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        section.innerHTML = html;
        secondaryContentWrapper.appendChild(section);
    }
    
    function renderPrimaryNav() {
        primaryNavWrapper.innerHTML = '';
        categoriesArray.forEach(category => {
            const navItem = document.createElement('button');
            navItem.className = 'primary-nav-item';
            if (category.id === activeCategoryId) {
                navItem.classList.add('active');
            }
            
            navItem.innerHTML = `${category.icon} <span>${category.name}</span>`;
            
            navItem.addEventListener('click', () => {
                if (activeCategoryId !== category.id) {
                    activeCategoryId = category.id;
                    renderPrimaryNav(); // Rerender nav to update active state
                    renderSecondaryContent(category);
                    
                    // Scroll secondary content to top on category change (helpful for mobile)
                    secondaryContentWrapper.scrollTop = 0;
                }
            });
            primaryNavWrapper.appendChild(navItem);
        });
    }

    // Initialize
    renderPrimaryNav();
    if (activeCategoryId !== null) {
        renderSecondaryContent(CATEGORIES[activeCategoryId]);
    }
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close all categories overlay
function initializeAllCategoriesOverlay() {
    const backBtn = document.getElementById('all-categories-back-btn');
    const overlay = document.getElementById('all-categories-overlay');
    
    if (backBtn && overlay) {
        backBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}

// Search functionality
document.querySelector('.search-btn').addEventListener('click', () => {
    const searchTerm = document.querySelector('.search-input').value;
    if (searchTerm.trim()) {
        console.log('Searching for:', searchTerm);
    }
});

document.querySelector('.search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.querySelector('.search-btn').click();
    }
});

// Button Actions
document.querySelector('.btn-primary').addEventListener('click', () => {
    alert('서비스 판매하기로 이동합니다.');
});

document.querySelector('.btn-secondary').addEventListener('click', () => {
    alert('전문가 찾기로 이동합니다.');
});

document.querySelector('.btn-login').addEventListener('click', () => {
    alert('로그인 페이지로 이동합니다.');
});

document.querySelector('.btn-signup').addEventListener('click', () => {
    alert('회원가입 페이지로 이동합니다.');
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
document.addEventListener('DOMContentLoaded', () => {
    initializeMegaMenu();
    initializeTrendingKeywords();
    initializeFeaturedCategories();
    initializeMobileSearch();
    initializeAllCategoriesOverlay();
});