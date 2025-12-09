// 简历页面交互功能
(function() {
    'use strict';

    // 页面加载完成后执行
    window.addEventListener('DOMContentLoaded', function() {
        // 初始化功能
        initSmoothScroll();
        initAnimations();
        initLinkHighlight();
    });

    // 平滑滚动
    function initSmoothScroll() {
        const sections = document.querySelectorAll('.section');

        // 为每个区块添加滚动动画
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        sections.forEach(function(section) {
            observer.observe(section);
        });
    }

    // 初始化动画效果
    function initAnimations() {
        // 添加 CSS 动画类
        const style = document.createElement('style');
        style.textContent = `
            .section {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }

            .section.fade-in {
                opacity: 1;
                transform: translateY(0);
            }

            .project-item,
            .education-item {
                padding: 10px;
                border-radius: 8px;
                transition: all 0.3s ease;
            }

            .project-item:hover,
            .education-item:hover {
                background-color: #f9f9f9;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            .info-item {
                transition: transform 0.2s ease;
            }

            .info-item:hover {
                transform: translateX(5px);
            }

            a {
                color: #4a5f7f;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: all 0.3s ease;
            }

            a:hover {
                border-bottom-color: #4a5f7f;
            }

            .icon-wrapper {
                transition: transform 0.3s ease;
            }

            .section-title:hover .icon-wrapper {
                transform: scale(1.1) rotate(5deg);
            }

            @media print {
                body {
                    padding: 0;
                    background: white;
                }

                .resume-container {
                    box-shadow: none;
                    max-width: 100%;
                }

                .section {
                    opacity: 1;
                    transform: none;
                    page-break-inside: avoid;
                }

                a {
                    color: #333;
                    text-decoration: none;
                    border-bottom: none;
                }
            }
        `;
        document.head.appendChild(style);

        // 延迟显示第一个区块
        setTimeout(function() {
            const firstSection = document.querySelector('.section');
            if (firstSection) {
                firstSection.classList.add('fade-in');
            }
        }, 300);
    }

    

})();
