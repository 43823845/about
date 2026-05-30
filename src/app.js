/**
 * app.js — 主应用逻辑
 * 优化列表:
 *  #6  模态框使用 visibility 方案（已在 CSS 中修复，JS 对应移除 display 切换）
 *  #7  合并并节流 scroll 监听器
 *  #8  Canvas 粒子效果（替代 DOM 粒子）并正确调用
 *  #9  项目筛选按钮事件绑定，统一分类体系
 *  #13 可访问性：焦点管理
 *  #14 导航滚动区域高亮
 */
(function () {
    'use strict';

    /* ─────────────────────────────────────────
       工具函数
    ───────────────────────────────────────── */

    /** 节流函数 — 合并高频事件 */
    function throttle(fn, delay) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= delay) {
                last = now;
                fn.apply(this, arguments);
            }
        };
    }

    /** XSS 转义（插入 innerHTML 前使用）*/
    function esc(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    /* ─────────────────────────────────────────
       DOM 就绪后执行
    ───────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {

        var projects = window.PROJECTS || [];

        /* ── Loading Screen ── */
        var loader = document.getElementById('loader');
        window.addEventListener('load', function () {
            if (loader) loader.classList.add('hidden');
        });
        // 兜底：最多 3s 后强制隐藏
        setTimeout(function () {
            if (loader) loader.classList.add('hidden');
        }, 3000);

        /* ── Canvas 粒子效果（#8 修复：改为 Canvas 实现并正确调用）── */
        initParticles();

        /* ── 平滑滚动导航 ── */
        document.querySelectorAll('.nav-scroll, .mobile-nav-link').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var targetId = this.getAttribute('data-target') ||
                               (this.getAttribute('href') || '').replace('#', '');
                var target = document.getElementById(targetId);
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                    history.pushState(null, null, '#' + targetId);
                }
                closeMobileMenu();
            });
        });

        /* ── 移动端菜单 ── */
        var menuToggle   = document.getElementById('menuToggle');
        var mobileMenu   = document.getElementById('mobileMenu');
        var menuOverlay  = document.getElementById('menuOverlay');

        if (menuToggle) {
            menuToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleMobileMenu();
            });
        }

        if (menuOverlay) {
            menuOverlay.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
            });
        }

        function toggleMobileMenu() {
            var isOpen = mobileMenu.classList.toggle('open');
            menuOverlay.classList.toggle('hidden', !isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        }

        function closeMobileMenu() {
            if (!mobileMenu) return;
            mobileMenu.classList.remove('open');
            if (menuOverlay) menuOverlay.classList.add('hidden');
            document.body.style.overflow = '';
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }

        /* ── #7 合并 + 节流 scroll 监听器 ── */
        var nav       = document.getElementById('mainNav');
        var backToTop = document.getElementById('backToTop');

        window.addEventListener('scroll', throttle(function () {
            var y = window.scrollY;
            if (nav)       nav.classList.toggle('scrolled', y > 50);
            if (backToTop) backToTop.classList.toggle('show', y > 600);
        }, 100));

        if (backToTop) {
            backToTop.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        /* ── #14 导航滚动区域高亮 ── */
        var sections  = document.querySelectorAll('section[id], footer[id]');
        var navLinks  = document.querySelectorAll('nav .nav-scroll[data-target]');

        if ('IntersectionObserver' in window && navLinks.length) {
            var sectionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var id = entry.target.id;
                    navLinks.forEach(function (link) {
                        var isActive = link.getAttribute('data-target') === id;
                        link.classList.toggle('nav-link-active', isActive);
                        var u = link.querySelector('.nav-underline');
                        if (u) u.style.width = isActive ? '100%' : '';
                    });
                });
            }, { threshold: 0.35, rootMargin: '-80px 0px 0px 0px' });

            sections.forEach(function (s) { sectionObserver.observe(s); });
        }

        /* ── 区块揭示动画 ── */
        var reveals = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window) {
            var revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            reveals.forEach(function (el) { revealObserver.observe(el); });
        } else {
            // 降级：直接显示
            reveals.forEach(function (el) { el.classList.add('visible'); });
        }

        /* ── 统计数字动画 ── */
        var statCards = document.querySelectorAll('[data-count]');
        if ('IntersectionObserver' in window) {
            var statObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        statObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            statCards.forEach(function (el) { statObserver.observe(el); });
        }

        /* ── #9 项目筛选 + 渲染 ── */
        renderProjects('all');

        var filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = this.getAttribute('data-filter') || 'all';
                filterBtns.forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                renderProjects(filter);
            });
        });

        /* ── #6 项目模态框（visibility 方案，CSS 已修复动画）── */
        var modal    = document.getElementById('projectModal');
        var closeBtn = document.getElementById('closeModalBtn');
        var prevFocus = null;  // #13 焦点管理

        window.openModal = function (id) {
            var p = projects.find(function (item) { return item.id === id; });
            if (!p || !modal) return;

            prevFocus = document.activeElement;  // 记录来源焦点

            document.getElementById('modalImg').src    = p.img;
            document.getElementById('modalImg').alt    = p.title;
            document.getElementById('modalTitle').textContent = p.title;
            document.getElementById('modalRole').textContent  = p.role;

            document.getElementById('modalTags').innerHTML = p.tags.map(function (t) {
                return '<span class="px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-[10px] font-bold border border-amber-500/20">' + esc(t) + '</span>';
            }).join('');

            document.getElementById('modalChallenges').innerHTML = p.challenges.map(function (c) {
                return '<li class="flex items-start gap-2"><i class="fas fa-check text-amber-400 mt-1 text-xs flex-shrink-0" aria-hidden="true"></i><span>' + esc(c) + '</span></li>';
            }).join('');

            document.getElementById('modalTech').textContent = p.tech;

            var achSection = document.getElementById('modalAchievements');
            var achText    = document.getElementById('modalAchText');
            if (p.achievements) {
                achText.textContent = p.achievements;
                achSection.classList.remove('hidden');
            } else {
                achSection.classList.add('hidden');
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // 焦点移至关闭按钮（#13）
            if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
        };

        window.closeModal = function () {
            if (!modal) return;
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // 还原焦点（#13）
            if (prevFocus && prevFocus.focus) prevFocus.focus();
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });
        }

        // ESC 关闭所有弹窗
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            if (modal && modal.classList.contains('active')) closeModal();
            if (wechatModal && wechatModal.style.visibility === 'visible') hideWechatQR();
            if (easterEggModal && easterEggModal.style.visibility === 'visible') hideEasterEgg();
        });

        /* ── 简历下载（#10 优化：优先寻找 PDF，降级到打印）── */
        var downloadBtn = document.getElementById('downloadResumeBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function (e) {
                e.preventDefault();
                // 尝试下载 resume.pdf，如不存在则降级到打印
                var pdfUrl = 'resume.pdf';
                fetch(pdfUrl, { method: 'HEAD' })
                    .then(function (res) {
                        if (res.ok) {
                            var a = document.createElement('a');
                            a.href = pdfUrl;
                            a.download = '杨杰_软硬件研发全栈工程师.pdf';
                            a.click();
                        } else {
                            window.print();
                        }
                    })
                    .catch(function () { window.print(); });
            });
        }

        /* ── 彩蛋 ── */
        var easterEggCard    = document.getElementById('easterEggCard');
        var easterEggModal   = document.getElementById('easterEggModal');
        var easterEggContent = document.getElementById('easterEggModalContent');
        var closeEasterEgg   = document.getElementById('closeEasterEgg');

        function showEasterEgg(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!easterEggModal) return;
            easterEggModal.style.opacity = '1';
            easterEggModal.style.visibility = 'visible';
            if (easterEggContent) easterEggContent.style.transform = 'scale(1)';
            document.body.style.overflow = 'hidden';
        }

        function hideEasterEgg(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!easterEggModal) return;
            easterEggModal.style.opacity = '0';
            easterEggModal.style.visibility = 'hidden';
            if (easterEggContent) easterEggContent.style.transform = 'scale(0.9)';
            document.body.style.overflow = '';
        }

        if (easterEggCard)  easterEggCard.addEventListener('click', showEasterEgg);
        if (closeEasterEgg) closeEasterEgg.addEventListener('click', hideEasterEgg);
        if (easterEggModal) {
            easterEggModal.addEventListener('click', function (e) {
                if (e.target === easterEggModal) hideEasterEgg(e);
            });
        }

        /* ── 微信二维码 ── */
        var wechatModal   = document.getElementById('wechatModal');
        var wechatContent = document.getElementById('wechatModalContent');
        var wechatCard    = document.getElementById('wechatCard');
        var wechatQRImg   = document.getElementById('wechatQRImg');
        var closeWechat   = document.getElementById('closeWechatModal');

        if (wechatQRImg) wechatQRImg.src = 'img/wechat-qr.jpg';

        window.showWechatQR = function (e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!wechatModal) return;
            wechatModal.style.opacity    = '1';
            wechatModal.style.visibility = 'visible';
            if (wechatContent) wechatContent.style.transform = 'scale(1)';
            document.body.style.overflow = 'hidden';
        };

        window.hideWechatQR = function (e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!wechatModal) return;
            wechatModal.style.opacity    = '0';
            wechatModal.style.visibility = 'hidden';
            if (wechatContent) wechatContent.style.transform = 'scale(0.9)';
            document.body.style.overflow = '';
        };

        if (wechatCard)  wechatCard.addEventListener('click', showWechatQR);
        if (closeWechat) closeWechat.addEventListener('click', hideWechatQR);
        if (wechatModal) {
            wechatModal.addEventListener('click', function (e) {
                if (e.target === wechatModal) hideWechatQR(e);
            });
        }

        /* ── 极客系统调试面板 (控制台与示波器) ── */
        initSystemDebugger();

    }); // end DOMContentLoaded

    /* ─────────────────────────────────────────
       项目卡片渲染（#9 统一筛选逻辑）
    ───────────────────────────────────────── */
    function renderProjects(filter) {
        var grid = document.getElementById('projectGrid');
        if (!grid) return;
        var projects = window.PROJECTS || [];

        // 统一用 filter 字段（mil/ind/iot/sw），'all' 显示全部
        var filtered = filter === 'all'
            ? projects
            : projects.filter(function (p) {
                // 同时支持按 type(hw/sw) 和 filter(mil/ind/iot/sw) 筛选
                return p.filter === filter || p.type === filter;
            });

        grid.innerHTML = '';
        filtered.forEach(function (p, index) {
            var card = document.createElement('div');
            card.className = 'project-card';
            card.setAttribute('data-id', String(p.id));
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', '查看项目：' + p.title);

            card.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openModal(p.id);
            });

            // 键盘操作支持（#13 可访问性）
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(p.id);
                }
            });

            var summary = getProjectSummary(p);
            card.innerHTML = buildCardHTML(p, index, summary);
            grid.appendChild(card);
        });
    }

    function buildCardHTML(project, index, summary) {
        var num = String(index + 1).padStart(2, '0');
        var tagsHTML = project.tags.map(function (tag) {
            return '<span class="text-[10px] text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">#' + esc(tag) + '</span>';
        }).join('');

        return [
            '<div class="h-52 overflow-hidden relative">',
            '<img src="' + esc(project.img) + '"',
            '     alt="' + esc(project.title) + ' 项目预览图"',
            '     loading="lazy" decoding="async"',
            '     width="400" height="208"',
            '     class="card-img">',
            '<div class="card-overlay" aria-hidden="true"></div>',
            '<div class="card-frame" aria-hidden="true"></div>',
            '<div class="absolute top-4 left-4 px-3 py-1 bg-amber-700/90 text-[10px] font-bold rounded-lg text-white uppercase tracking-wider">' + esc(project.cat) + '</div>',
            '<div class="card-number" aria-hidden="true">' + num + '</div>',
            '<div class="view-btn absolute bottom-4 right-4 px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/20" aria-hidden="true">',
            '<i class="fas fa-expand mr-1" aria-hidden="true"></i> 查看详情',
            '</div>',
            '</div>',
            '<div class="p-6">',
            '<h3 class="text-white font-bold mb-2 text-base">' + esc(project.title) + '</h3>',
            '<p class="text-slate-500 text-xs mb-4">' + esc(project.role) + '</p>',
            '<div class="card-proof" aria-hidden="true">核心成果摘要</div>',
            '<p class="card-summary">' + esc(summary) + '</p>',
            '<div class="flex flex-wrap gap-2">' + tagsHTML + '</div>',
            '</div>'
        ].join('');
    }

    function getProjectSummary(project) {
        var src = (project.achievements && project.achievements.length > 0)
            ? project.achievements
            : (project.tech || '');
        return src.length > 68 ? src.slice(0, 68) + '…' : src;
    }

    /* ─────────────────────────────────────────
       统计数字动画
    ───────────────────────────────────────── */
    function animateCounter(el) {
        var target   = parseInt(el.getAttribute('data-count'), 10);
        var duration = 2000;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    /* ─────────────────────────────────────────
       #8 Canvas 粒子效果（替代 30 个 DOM 元素）
    ───────────────────────────────────────── */
    function initParticles() {
        var canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        var ctx    = canvas.getContext('2d');
        var particles = [];
        var raf;

        function resize() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function createParticle() {
            return {
                x:    Math.random() * canvas.width,
                y:    canvas.height + 10,
                r:    Math.random() * 2 + 0.5,
                speed: Math.random() * 0.6 + 0.3,
                alpha: 0,
                maxAlpha: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.5 ? '232,176,79' : '159,107,59',
                life:  0,
                maxLife: Math.random() * 300 + 150
            };
        }

        function tick() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 每帧随机补充粒子，保持总量约 25
            if (particles.length < 25 && Math.random() < 0.15) {
                particles.push(createParticle());
            }

            particles = particles.filter(function (p) {
                p.life++;
                p.y -= p.speed;

                // 淡入淡出
                var lifeRatio = p.life / p.maxLife;
                p.alpha = lifeRatio < 0.1
                    ? p.maxAlpha * (lifeRatio / 0.1)
                    : lifeRatio > 0.85
                        ? p.maxAlpha * ((1 - lifeRatio) / 0.15)
                        : p.maxAlpha;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
                ctx.fill();

                return p.life < p.maxLife && p.y > -10;
            });

            raf = requestAnimationFrame(tick);
        }

        resize();
        window.addEventListener('resize', throttle(function () {
            resize();
        }, 200));

        // 仅当 Hero 区域可见时运行，节省性能
        if ('IntersectionObserver' in window) {
            var heroSection = document.getElementById('hero');
            if (heroSection) {
                var heroObs = new IntersectionObserver(function (entries) {
                    if (entries[0].isIntersecting) {
                        if (!raf) tick();
                    } else {
                        cancelAnimationFrame(raf);
                        raf = null;
                    }
                });
                heroObs.observe(heroSection);
            } else {
                tick();
            }
        } else {
            tick();
        }
    }

    /* ─────────────────────────────────────────
       节流（暴露给 resize）
    ───────────────────────────────────────── */
    function throttle(fn, delay) {
        var last = 0;
        return function () {
            var now = Date.now();
            if (now - last >= delay) { last = now; fn.apply(this, arguments); }
        };
    }

    /* ─────────────────────────────────────────
       极客系统调试面板 (Console & Oscilloscope)
    ───────────────────────────────────────── */
    function initSystemDebugger() {
        var tabConsoleBtn = document.getElementById('tabConsoleBtn');
        var tabOscilloscopeBtn = document.getElementById('tabOscilloscopeBtn');
        var debugConsolePanel = document.getElementById('debugConsolePanel');
        var debugOscilloscopePanel = document.getElementById('debugOscilloscopePanel');

        if (!tabConsoleBtn || !tabOscilloscopeBtn || !debugConsolePanel || !debugOscilloscopePanel) return;

        // 1. Tab 切换逻辑
        var activeTab = 'console'; // 'console' | 'oscilloscope'
        var oscAnimationFrame = null;

        tabConsoleBtn.addEventListener('click', function () {
            if (activeTab === 'console') return;
            activeTab = 'console';
            tabConsoleBtn.setAttribute('aria-selected', 'true');
            tabConsoleBtn.classList.add('active');
            tabOscilloscopeBtn.setAttribute('aria-selected', 'false');
            tabOscilloscopeBtn.classList.remove('active');

            debugConsolePanel.classList.remove('hidden');
            debugOscilloscopePanel.classList.add('hidden');

            if (oscAnimationFrame) {
                cancelAnimationFrame(oscAnimationFrame);
                oscAnimationFrame = null;
            }
            
            // 自动聚焦输入框
            var consoleInput = document.getElementById('consoleInput');
            if (consoleInput) consoleInput.focus();
        });

        tabOscilloscopeBtn.addEventListener('click', function () {
            if (activeTab === 'oscilloscope') return;
            activeTab = 'oscilloscope';
            tabOscilloscopeBtn.setAttribute('aria-selected', 'true');
            tabOscilloscopeBtn.classList.add('active');
            tabConsoleBtn.setAttribute('aria-selected', 'false');
            tabConsoleBtn.classList.remove('active');

            debugOscilloscopePanel.classList.remove('hidden');
            debugConsolePanel.classList.add('hidden');

            startOscilloscope();
        });

        // 2. 终端控制台逻辑
        var consoleHistory = document.getElementById('consoleHistory');
        var consoleInput = document.getElementById('consoleInput');

        var initialLogs = [
            '[系统] 杨杰全栈开发核心诊断系统 v1.0.0 正在初始化...',
            '[ 正常 ] 成功加载 16层板 HDI 高密 PCB 叠层硬件设计参数',
            '[ 正常 ] 精密模拟信号调理采集单元就绪，检测状态：稳定',
            '[ 信息 ] 28V/11A 装备车载测试主电源供电轨：28.00V 供电正常',
            '[ 正常 ] 嵌入式 TinyML 神经网络端侧轻量化推理引擎挂载成功',
            '[ 信息 ] 国家军用标准 GJB151B 电磁兼容(EMC)防护验证完毕',
            '==================================================',
            '杨杰软硬件全栈研发系统已稳定就绪。输入 "help" 获取指令菜单。',
            ''
        ];

        var logIndex = 0;
        function printNextLog() {
            if (logIndex < initialLogs.length) {
                printRow(initialLogs[logIndex]);
                logIndex++;
                setTimeout(printNextLog, Math.random() * 200 + 100);
            } else {
                // 加一个闪烁的光标
                var cursor = document.createElement('span');
                cursor.className = 'console-cursor';
                cursor.id = 'consoleCursor';
                consoleHistory.appendChild(cursor);
                scrollToBottom();
            }
        }

        function printRow(text, type) {
            var row = document.createElement('div');
            row.className = 'console-row';
            if (type === 'error') row.style.color = '#f87171';
            else if (type === 'warn') row.style.color = '#fbbf24';
            else if (type === 'info') row.style.color = '#60a5fa';
            else if (type === 'success') row.style.color = '#34d399';
            row.textContent = text;
            
            // 如果光标存在，插在光标前面，否则插在末尾
            var cursor = document.getElementById('consoleCursor');
            if (cursor) {
                consoleHistory.insertBefore(row, cursor);
            } else {
                consoleHistory.appendChild(row);
            }
            scrollToBottom();
        }

        function scrollToBottom() {
            consoleHistory.scrollTop = consoleHistory.scrollHeight;
        }

        // 开始打印初始化日志
        printNextLog();

        // 键盘输入命令监听
        if (consoleInput) {
            consoleInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    var val = consoleInput.value.trim();
                    consoleInput.value = '';
                    if (val.length === 0) return;

                    printRow('yj_core:~$ ' + val);
                    parseCommand(val);
                }
            });
        }

        function parseCommand(cmd) {
            var parts = cmd.toLowerCase().split(' ');
            var core = parts[0];

            setTimeout(function () {
                if (core === 'help') {
                    printRow('可用指令菜单:', 'info');
                    printRow('  help      - 显示此指令菜单');
                    printRow('  status    - 查看硬件系统实时健康诊断报告');
                    printRow('  projects  - 查看全栈研发项目分类列表');
                    printRow('  egg       - 启动隐藏的极客浪漫彩蛋');
                    printRow('  clear     - 清空终端屏幕历史记录');
                } else if (core === 'clear') {
                    // 保留光标并清空其他
                    consoleHistory.innerHTML = '';
                    var cursor = document.createElement('span');
                    cursor.className = 'console-cursor';
                    cursor.id = 'consoleCursor';
                    consoleHistory.appendChild(cursor);
                } else if (core === 'status') {
                    printRow('[ 系统实时诊断健康报告 ]', 'info');
                    printRow('处理器温度 : 41.5 °C (MCU 超频至 240MHz 正常)', 'success');
                    printRow('主线电压   : 28.02 V (波纹小于 10mV，SI/PI 稳定)', 'success');
                    printRow('系统电流   : 11.04 A (动态功耗负载均衡 OK)', 'success');
                    printRow('边缘端 AI  : TinyML 神经网络推理延迟 < 12ms', 'success');
                    printRow('核心状态   : 系统稳定，开箱即用，支持极限工况', 'success');
                } else if (core === 'projects') {
                    printRow('[ 全栈研发精选项目列表 ]', 'info');
                    printRow('1. 军品/航电 (mil) - 包含军品绝缘/机载配电等 7 个高可靠测试设备项目');
                    printRow('2. 工业/能源 (ind) - 包含非标采集模组、新能源地源热泵控制板等量产项目');
                    printRow('3. 物联网 (iot)    - 包含通用 4G 数采模组、450个共享充电控制器等项目');
                    printRow('4. 嵌入式软件 (sw) - 包含115V电源软件、交直流数采、北斗定位系统等项目');
                    printRow('提示: 输入 "egg" 即可触发彩蛋体验。', 'info');
                } else if (core === 'egg') {
                    printRow('>> 正在启动极客浪漫彩蛋系统...', 'success');
                    var eggBtn = document.getElementById('easterEggCard');
                    if (eggBtn) {
                        eggBtn.click();
                    } else {
                        printRow('抱歉，未能检测到彩蛋入口组件。', 'error');
                    }
                } else {
                    printRow('无法识别指令: "' + esc(core) + '"。请输入 "help" 获取帮助菜单。', 'error');
                }
            }, 100);
        }

        // 3. 示波器 Canvas 逻辑
        var canvas = document.getElementById('oscilloscopeCanvas');
        var freqSlider = document.getElementById('oscFreqSlider');
        var ampSlider = document.getElementById('oscAmpSlider');
        var waveSelect = document.getElementById('oscWaveSelect');

        function startOscilloscope() {
            if (!canvas) return;
            var ctx = canvas.getContext('2d');
            
            function resizeCanvas() {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
            resizeCanvas();

            var offset = 0;
            function draw() {
                if (activeTab !== 'oscilloscope') return;

                var w = canvas.width;
                var h = canvas.height;
                var midY = h / 2;

                ctx.fillStyle = '#050a12';
                ctx.fillRect(0, 0, w, h);

                // 绘制 CRT 绿/黄细格网格线
                ctx.strokeStyle = 'rgba(232, 176, 79, 0.08)';
                ctx.lineWidth = 1;
                var gridSize = 20;

                // 横线
                for (var y = 0; y < h; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                }
                // 竖线
                for (var x = 0; x < w; x += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                }

                // 绘制中心偏置水平基准线和刻度线
                ctx.strokeStyle = 'rgba(232, 176, 79, 0.25)';
                ctx.beginPath();
                ctx.moveTo(0, midY);
                ctx.lineTo(w, midY);
                ctx.stroke();

                // 读取滑块参数
                var freq = parseFloat(freqSlider.value) * 0.01;
                var amp = parseFloat(ampSlider.value);
                var waveType = waveSelect.value;

                // 绘制流动波形辉光
                ctx.strokeStyle = 'rgba(232, 176, 79, 0.95)';
                ctx.shadowColor = 'rgba(232, 176, 79, 0.8)';
                ctx.shadowBlur = 10;
                ctx.lineWidth = 2.5;
                ctx.beginPath();

                for (var i = 0; i < w; i++) {
                    var xVal = i;
                    var angle = i * freq + offset;
                    var yVal = 0;

                    if (waveType === 'sine') {
                        yVal = Math.sin(angle) * amp;
                    } else if (waveType === 'square') {
                        yVal = Math.sin(angle) >= 0 ? amp : -amp;
                    } else if (waveType === 'triangle') {
                        yVal = (Math.abs((angle % (Math.PI * 2)) - Math.PI) / Math.PI - 0.5) * 2 * amp;
                    }

                    if (i === 0) {
                        ctx.moveTo(xVal, midY + yVal);
                    } else {
                        ctx.lineTo(xVal, midY + yVal);
                    }
                }
                ctx.stroke();

                // 重置阴影防污染
                ctx.shadowBlur = 0;

                // 滚动步长，产生正向流速
                offset += 0.08;

                oscAnimationFrame = requestAnimationFrame(draw);
            }

            // 监听窗口缩放重新适应 Canvas 尺寸
            window.addEventListener('resize', throttle(function () {
                if (activeTab === 'oscilloscope') resizeCanvas();
            }, 250));

            // 开始循环
            if (oscAnimationFrame) cancelAnimationFrame(oscAnimationFrame);
            draw();
        }
    }

})();
