/**
 * app.js — 主应用逻辑 (全栈价值升级版)
 * 核心特性:
 *  1. 首屏三模工程分析仪：极客终端 (含 roi 价值评估指令) + 实时示波器 (含动态遥测指标) + 六维全栈战力雷达图 (Canvas)
 *  2. 0→1 全栈研发价值闭环交互链路 (6阶段切换 + 关联王牌项目一键穿透)
 *  3. 招聘官多视角切换器 (CTO技术总监视角 / 项目经理视角 / HR视角)
 *  4. 技能图谱按岗位域高亮筛选 + 项目的分类计数、王牌筛选与实时关键词搜索
 *  5. 项目详情模态窗支持全栈包干层级展示、商业价值评估及上下项目无缝切换 (支持键盘左右方向键)
 *  6. 沙箱安全：全面使用 SafeStorage 与页面内 Toast 交互，零原生 alert/confirm/prompt 阻塞调用
 */
(function () {
    'use strict';

    /* ─────────────────────────────────────────
       工具函数
    ───────────────────────────────────────── */

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

    function esc(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str == null ? '' : String(str)));
        return d.innerHTML;
    }

    var SafeStorage = {
        getItem: function (key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                return window.__safe_storage_fallback ? window.__safe_storage_fallback[key] : null;
            }
        },
        setItem: function (key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                if (!window.__safe_storage_fallback) window.__safe_storage_fallback = {};
                window.__safe_storage_fallback[key] = value;
            }
        },
        removeItem: function (key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                if (window.__safe_storage_fallback) {
                    delete window.__safe_storage_fallback[key];
                }
            }
        }
    };

    /* ─────────────────────────────────────────
       0→1 全栈研发六大阶段数据源
    ───────────────────────────────────────── */
    var PIPELINE_STAGES = [
        {
            role: '相当于：硬件系统架构师',
            metric: '核心指标：1000V高低压安规隔离 · 零返工架构定型',
            title: 'Stage 01 · 从模糊需求到可量产的系统级总体方案',
            desc: '面对军工所、中航工业(AVIC)或工业客户的非标复杂指标，独立完成总体方案论证、关键元器件与军标航空连接器选型、多路电源树功率分配及高低压物理隔离规划，从源头规避后期软硬件架构推倒重来的风险。',
            deliverables: ['《系统总体技术方案》', '《关键器件与航插选型BOM》', '《高低压安规与功率预算表》', '《软硬件接口通讯协议规范》'],
            businessValue: '在设计初期即实现“硬件电路 + 固件算力 + 结构散热 + BOM成本”四维平衡，将原型机一次打样成功率提升至 95% 以上。',
            projId: 2,
            projName: '机载配电系统地面测试设备'
        },
        {
            role: '相当于：资深高速硬件 / PCB 工程师',
            metric: '核心指标：16层HDI高密叠层 · 微弱漏电流低噪布局',
            title: 'Stage 02 · 精密模拟前端、大功率拓扑与高速多层 PCB 设计',
            desc: '精通 Altium Designer 与 Cadence Sigrity SI/PI 仿真，独立完成 12~16 层高密 HDI 板卡设计、高速差分等长阻抗控制、115V/28V 大功率电源变换及微伏/微安级信号调理电路设计。',
            deliverables: ['《全套多层原理图与PCB源文件》', '《SI/PI信号与电源完整性报告》', '《SMT钢网、坐标与焊接工艺文件》', '《DFM可制造性核查清单》'],
            businessValue: '无需外包 Layout 或依赖专职仿真工程师，板级设计直接兼顾信号质量与批量贴片良率，大幅缩短硬件打样迭代周期。',
            projId: 1,
            projName: '军品绝缘自动测试系统 (12层板)'
        },
        {
            role: '相当于：FPGA 工程师 + 嵌入式底层驱动工程师',
            metric: '核心指标：纳秒级光电同步 · 强干扰下 HDLC 零丢包',
            title: 'Stage 03 · FPGA 高速并行逻辑与 MCU/RTOS 实时固件开发',
            desc: '跨芯片平台驾驭 Xilinx FPGA (Verilog) 与 ARM Cortex-M (STM32/GD32/ESP32/RISC-V)，独立编写底层 HAL 驱动、FreeRTOS/RT-Thread 任务调度及 HDLC/CANopen/Modbus 工业与航空总线协议栈。',
            deliverables: ['《FPGA Verilog 同步采样逻辑源码》', '《高可靠嵌入式固件工程与Bootloader》', '《A/B双分区安全差分OTA升级模块》', '《多节点工业/航空总线协议栈》'],
            businessValue: '自己画的板子自己写底层驱动与 FPGA 逻辑，寄存器与引脚时序毫秒级对齐，彻底告别“软硬件工程师互相甩锅”。',
            projId: 11,
            projName: '军用脉冲时间同步器 (FPGA)'
        },
        {
            role: '相当于：控制算法工程师 + 边缘端 TinyML 工程师',
            metric: '核心指标：测量精度 ±0.01 · 300℃温控过冲 < ±1℃',
            title: 'Stage 04 · 精密数字信号处理、自校准算法与端侧 TinyML',
            desc: '在资源受限的嵌入式端实现卡尔曼滤波、FIR/IIR 数字滤波、抗积分饱和串级 PID 控制及交直流动态增益自校准算法；支持将 INT8 量化神经网络部署至 MCU 实现端侧设备早期故障推理。',
            deliverables: ['《动态增益与温漂自校准算法库》', '《无超调增量式/串级PID控制引擎》', '《STM32Cube.AI / TFLite 端侧推理模型》', '《高精度采样线性度拟合报告》'],
            businessValue: '以软件算法红利弥补硬件器件公差，用常规工业级器件跑出军标级测量精度（±0.01），为量产机型节省 15%~25% BOM 成本。',
            projId: 6,
            projName: '非标量产型采集模组 (±0.01精度)'
        },
        {
            role: '相当于：测控上位机工程师 + 全栈应用开发者',
            metric: '核心指标：100+终端并发追踪 · WebSocket延迟 < 200ms',
            title: 'Stage 05 · 跨平台测控上位机、微信小程序与 Web 云平台',
            desc: '向上延伸至应用层全栈：独立开发 Qt6/Tauri 工业测控上位机、工业电容屏 HMI 界面、BLE 蓝牙温控微信小程序（含 Canvas 实时波形绘制）以及基于 WebSocket + 高德地图的物联网云平台与企业 ERP 系统。',
            deliverables: ['《PC端测控上位机与自动化报表系统》', '《工业触摸屏 HMI 交互界面程序》', '《BLE蓝牙微信小程序控制端》', '《高并发物联网 Web 监控管理后台》'],
            businessValue: '让硬件产品直接拥有高颜值、易操作的数字化交互终端，无需额外组建前端/小程序/上位机团队即可交付完整商业产品。',
            projId: 15,
            projName: '北斗与 GPS 定位管理系统 (Web全栈)'
        },
        {
            role: '相当于：EMC 整改专家 + ATE 测试治具与量产经理',
            metric: '核心指标：GJB151B一次通过 · 450+节点 >5W小时零故障',
            title: 'Stage 06 · 军标级 EMC 攻关、ATE 产线治具与规模化量产交付',
            desc: '主导国军标 GJB151B 电磁兼容整改、高低温湿热冲击试验、非标测试机柜综合布线及产线自动化测试治具(ATE)开发，编制全套军工/工业交付标准文档，护航产品从样机平滑跨越至百/千台级批量投产。',
            deliverables: ['《GJB151B 军标 EMC 整改与验证报告》', '《产线 ATE 自动化自检治具与工装》', '《3D外壳结构建模与模具加工规范》', '《全套测试规范、校准规范与验收文档》'],
            businessValue: '真正对最终商业结果与产线良率（>99.5%）负责，确保产品交得出、过得了检、经得起户外与战机地面严苛环境长年考验。',
            projId: 10,
            projName: '共享充电控制器 (450+城市节点量产)'
        }
    ];

    /* ─────────────────────────────────────────
       招聘官三视角切换数据源
    ───────────────────────────────────────── */
    var ROLE_PERSPECTIVES = {
        cto: [
            {
                icon: 'fas fa-diagram-project',
                title: '系统级架构视野，消除跨界盲区',
                desc: '既懂 16 层高速 PCB 的信号回流与阻抗匹配，又懂 FreeRTOS/Linux 内核调度与 FPGA 时序，在架构设计期即可规避 90% 的软硬件接口隐患。'
            },
            {
                icon: 'fas fa-gauge-high',
                title: '专啃 EMI/EMC 与现场疑难杂症硬骨头',
                desc: '曾多次临危受命修复航发电喷工装 EMI 异常、1000V 高压漏电流干扰等棘手问题，能快速收敛历史遗留技术债。'
            },
            {
                icon: 'fas fa-vial-circle-check',
                title: '自带自动化测试平台与工具链基因',
                desc: '习惯同步搭建上位机自检与 ATE 自动化回归测试台，让团队硬件迭代有据可依、固件发布零回归故障。'
            }
        ],
        pm: [
            {
                icon: 'fas fa-cubes',
                title: '1人包干全链路，大幅压缩项目排期与人力成本',
                desc: '从航插/板卡选型、原理图PCB、嵌入式固件到配套上位机与线缆机柜布线一人闭环，省去多岗位排期等待与沟通摩擦。'
            },
            {
                icon: 'fas fa-coins',
                title: '强烈成本意识与供应链量产导向',
                desc: '在新能源热泵主控板（产线100%导入）与4G数采模组中，通过软硬协同校准与国产化器件优选，显著降低整机 BOM 成本。'
            },
            {
                icon: 'fas fa-file-shield',
                title: '交付资料完备，军检/客户验收一次通关',
                desc: '不仅交付稳定运行的软硬件实体，更规范输出《测试规范》《校准规范》与工艺质检标准，确保项目按期高质量回款验收。'
            }
        ],
        hr: [
            {
                icon: 'fas fa-medal',
                title: '13年实战沉淀，18个完整项目档案可查验',
                desc: '履历扎实覆盖军工航电(AVIC)、工业自动化、物联网与云计算，连续两年获评“硬件开源达人”（70+开源项目），技术实力公开透明。'
            },
            {
                icon: 'fas fa-users-gear',
                title: '复合型T字人才，既能单兵攻坚也能带队赋能',
                desc: '曾任项目经理、研发负责人及高校 EDA 校园培训讲师，沟通表达清晰，能把复杂底层技术转化为业务团队听得懂的交付结果。'
            },
            {
                icon: 'fas fa-bolt',
                title: '状态极佳，即插即用无缝融入研发一线',
                desc: '持有计算机硬件工程师、网络工程师及PCB设计专项技能证书，工具链全熟，入职即可直接接手核心项目或救火攻坚。'
            }
        ]
    };

    /* ─────────────────────────────────────────
       DOM 就绪后执行
    ───────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {

        if (window.location.protocol !== 'file:') {
            var link = document.createElement('link');
            link.rel = 'manifest';
            link.href = 'manifest.json';
            document.head.appendChild(link);
        }

        if (!window.DEFAULT_PROJECTS && window.PROJECTS) {
            window.DEFAULT_PROJECTS = JSON.parse(JSON.stringify(window.PROJECTS));
        }

        var customProjs = SafeStorage.getItem('yj_custom_projects');
        var projects = window.PROJECTS || [];
        if (customProjs) {
            try {
                var parsed = JSON.parse(customProjs);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // 融合默认项目的新增字段（如 flagship, stackLayers, valueImpact）
                    projects = parsed.map(function (cp) {
                        var def = (window.DEFAULT_PROJECTS || []).find(function (d) { return d.id === cp.id; });
                        return Object.assign({}, def || {}, cp);
                    });
                }
            } catch (e) {
                SafeStorage.removeItem('yj_custom_projects');
                projects = window.DEFAULT_PROJECTS || [];
            }
        }
        window.PROJECTS = projects;

        /* ── Loading Screen ── */
        var loader = document.getElementById('loader');
        window.addEventListener('load', function () {
            if (loader) loader.classList.add('hidden');
        });
        setTimeout(function () {
            if (loader) loader.classList.add('hidden');
        }, 1200);

        /* ── Canvas 粒子效果 ── */
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
                    if (history.pushState) {
                        try { history.pushState(null, null, '#' + targetId); } catch (err) {}
                    }
                }
                closeMobileMenu();
            });
        });

        /* ── 移动端菜单 ── */
        var menuToggle  = document.getElementById('menuToggle');
        var mobileMenu  = document.getElementById('mobileMenu');
        var menuOverlay = document.getElementById('menuOverlay');

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
            if (menuToggle) menuToggle.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        }

        function closeMobileMenu() {
            if (!mobileMenu) return;
            mobileMenu.classList.remove('open');
            if (menuOverlay) menuOverlay.classList.add('hidden');
            if (menuToggle) menuToggle.classList.remove('open');
            document.body.style.overflow = '';
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }

        /* ── 合并 + 节流 scroll 监听器 ── */
        var nav            = document.getElementById('mainNav');
        var backToTop      = document.getElementById('backToTop');
        var scrollProgress = document.getElementById('scrollProgress');

        window.addEventListener('scroll', throttle(function () {
            var y = window.scrollY;
            if (nav)       nav.classList.toggle('scrolled', y > 50);
            if (backToTop) backToTop.classList.toggle('show', y > 600);

            var totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollProgress && totalHeight > 0) {
                var progress = (y / totalHeight) * 100;
                scrollProgress.style.width = progress + '%';
            }
        }, 80));

        if (backToTop) {
            backToTop.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        /* ── 导航滚动区域高亮 ── */
        var sections = document.querySelectorAll('section[id], footer[id]');
        var navLinks = document.querySelectorAll('nav .nav-scroll[data-target]');

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
            }, { threshold: 0.25, rootMargin: '-80px 0px 0px 0px' });

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
            }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
            reveals.forEach(function (el) { revealObserver.observe(el); });
        } else {
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
            }, { threshold: 0.4 });
            statCards.forEach(function (el) { statObserver.observe(el); });
        }

        /* ── 全局 Toast 提示组件与剪贴板复制 ── */
        var toastContainer = document.getElementById('toastContainer');

        function showToast(msg, icon) {
            if (!toastContainer) return;
            var toast = document.createElement('div');
            toast.className = 'toast-message';
            var iconHTML = icon ? '<i class="' + esc(icon) + ' text-amber-400"></i>' : '<i class="fas fa-check-circle text-emerald-400"></i>';
            toast.innerHTML = iconHTML + '<span>' + esc(msg) + '</span>';
            toastContainer.appendChild(toast);

            setTimeout(function () {
                toast.classList.add('toast-fadeout');
                setTimeout(function () {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 300);
            }, 2600);
        }
        window.showToast = showToast;

        function copyToClipboard(text, successMsg) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    showToast(successMsg || '已复制到剪贴板！');
                }).catch(function () {
                    fallbackCopy(text, successMsg);
                });
            } else {
                fallbackCopy(text, successMsg);
            }
        }

        function fallbackCopy(text, successMsg) {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast(successMsg || '已复制到剪贴板！');
            } catch (e) {
                showToast('复制失败，请手动选择复制', 'fas fa-exclamation-circle');
            }
            document.body.removeChild(textarea);
        }

        var emailCard = document.getElementById('emailCard');
        if (emailCard) {
            emailCard.addEventListener('click', function (e) {
                e.preventDefault();
                copyToClipboard('43823845@qq.com', '✓ 已成功复制邮箱: 43823845@qq.com');
            });
            emailCard.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copyToClipboard('43823845@qq.com', '✓ 已成功复制邮箱: 43823845@qq.com');
                }
            });
        }

        /* ── 0→1 全栈研发价值闭环交互 (#value-loop) ── */
        var pipeStepBtns = document.querySelectorAll('.pipeline-step-btn[data-step]');
        var pipeRoleBadge = document.getElementById('pipeRoleBadge');
        var pipeMetricBadge = document.getElementById('pipeMetricBadge');
        var pipeStageTitle = document.getElementById('pipeStageTitle');
        var pipeStageDesc = document.getElementById('pipeStageDesc');
        var pipeDeliverables = document.getElementById('pipeDeliverables');
        var pipeBusinessValue = document.getElementById('pipeBusinessValue');
        var pipeJumpProjectBtn = document.getElementById('pipeJumpProjectBtn');

        pipeStepBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-step'), 10);
                var stage = PIPELINE_STAGES[idx];
                if (!stage) return;

                pipeStepBtns.forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                if (pipeRoleBadge) pipeRoleBadge.textContent = stage.role;
                if (pipeMetricBadge) pipeMetricBadge.textContent = stage.metric;
                if (pipeStageTitle) pipeStageTitle.textContent = stage.title;
                if (pipeStageDesc) pipeStageDesc.textContent = stage.desc;
                if (pipeDeliverables) {
                    pipeDeliverables.innerHTML = stage.deliverables.map(function (d) {
                        return '<span class="skill-tag px-3 py-1 text-xs">' + esc(d) + '</span>';
                    }).join('');
                }
                if (pipeBusinessValue) pipeBusinessValue.textContent = stage.businessValue;
                if (pipeJumpProjectBtn) {
                    pipeJumpProjectBtn.setAttribute('data-proj-id', String(stage.projId));
                    pipeJumpProjectBtn.innerHTML = '<i class="fas fa-arrow-up-right-from-square"></i> 查看该阶段代表作：' + esc(stage.projName);
                }
            });
        });

        if (pipeJumpProjectBtn) {
            pipeJumpProjectBtn.addEventListener('click', function () {
                var projId = parseInt(this.getAttribute('data-proj-id'), 10);
                if (projId) {
                    openModal(projId);
                }
            });
        }

        /* ── 招聘官三视角切换器 (#about) ── */
        var roleSwitchBtns = document.querySelectorAll('.role-switch-btn[data-role]');
        var rolePerspectiveContent = document.getElementById('rolePerspectiveContent');

        roleSwitchBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var roleKey = this.getAttribute('data-role');
                var items = ROLE_PERSPECTIVES[roleKey];
                if (!items || !rolePerspectiveContent) return;

                roleSwitchBtns.forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                rolePerspectiveContent.innerHTML = items.map(function (item) {
                    return [
                        '<div class="recruiter-point">',
                        '  <div class="recruiter-point-icon"><i class="' + esc(item.icon) + ' text-sm" aria-hidden="true"></i></div>',
                        '  <div>',
                        '    <p class="text-white font-semibold text-sm mb-1">' + esc(item.title) + '</p>',
                        '    <p class="text-slate-300 text-xs leading-relaxed">' + esc(item.desc) + '</p>',
                        '  </div>',
                        '</div>'
                    ].join('');
                }).join('');
            });
        });

        /* ── 技能域高亮筛选器 (#skills) ── */
        var skillDomainBtns = document.querySelectorAll('.skill-domain-btn[data-domain]');
        var skillCards = document.querySelectorAll('.skill-category-card[data-domain]');

        skillDomainBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var domain = this.getAttribute('data-domain') || 'all';
                skillDomainBtns.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                skillCards.forEach(function (card) {
                    if (domain === 'all' || card.getAttribute('data-domain') === domain) {
                        card.classList.remove('dimmed');
                    } else {
                        card.classList.add('dimmed');
                    }
                });
            });
        });

        /* ── 项目筛选 + 实时搜索 + 渲染 ── */
        var currentFilter = 'all';
        var currentSearch = '';
        var projectSearchInput = document.getElementById('projectSearchInput');
        var clearProjectSearchBtn = document.getElementById('clearProjectSearchBtn');

        updateFilterCounts();
        renderProjects(currentFilter, currentSearch);

        var filterBtns = document.querySelectorAll('#filterBtns .filter-btn');
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                currentFilter = this.getAttribute('data-filter') || 'all';
                filterBtns.forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                renderProjects(currentFilter, currentSearch);
            });
        });

        if (projectSearchInput) {
            projectSearchInput.addEventListener('input', function () {
                currentSearch = this.value.trim();
                if (clearProjectSearchBtn) {
                    clearProjectSearchBtn.classList.toggle('hidden', currentSearch.length === 0);
                }
                renderProjects(currentFilter, currentSearch);
            });
        }

        if (clearProjectSearchBtn) {
            clearProjectSearchBtn.addEventListener('click', function () {
                currentSearch = '';
                if (projectSearchInput) projectSearchInput.value = '';
                this.classList.add('hidden');
                renderProjects(currentFilter, currentSearch);
            });
        }

        /* ── 项目模态框（支持全栈层级、商业价值与上下项目切换）── */
        var modal       = document.getElementById('projectModal');
        var closeBtn    = document.getElementById('closeModalBtn');
        var prevProjBtn = document.getElementById('prevProjectBtn');
        var nextProjBtn = document.getElementById('nextProjectBtn');
        var prevFocus   = null;
        var currentModalProjectId = 1;

        window.openModal = function (id) {
            var list = window.PROJECTS || [];
            var p = list.find(function (item) { return item.id === id; });
            if (!p || !modal) return;

            currentModalProjectId = p.id;
            if (!modal.classList.contains('active')) {
                prevFocus = document.activeElement;
            }

            document.getElementById('modalImg').src = p.img;
            document.getElementById('modalImg').alt = p.title;
            document.getElementById('modalTitle').textContent = p.title;
            document.getElementById('modalRole').textContent  = p.role;

            var catBadge = document.getElementById('modalCatBadge');
            if (catBadge) catBadge.textContent = p.cat;

            var metricBadge = document.getElementById('modalMetricBadge');
            if (metricBadge) metricBadge.textContent = getProjectMetric(p);

            var flagshipBadge = document.getElementById('modalFlagshipBadge');
            if (flagshipBadge) {
                flagshipBadge.classList.toggle('hidden', !p.flagship);
            }

            var stackContainer = document.getElementById('modalStackLayers');
            if (stackContainer) {
                var layers = p.stackLayers || ['方案设计', '硬件PCB', '嵌入式固件', '系统联调交付'];
                stackContainer.innerHTML = layers.map(function (l) {
                    return '<span class="stack-layer-pill"><i class="fas fa-check text-[9px] mr-1"></i>' + esc(l) + '</span>';
                }).join('');
            }

            var valImpactEl = document.getElementById('modalValueImpact');
            if (valImpactEl) {
                valImpactEl.textContent = p.valueImpact || p.achievements || p.tech;
            }

            document.getElementById('modalTags').innerHTML = (p.tags || []).map(function (t) {
                return '<span class="px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-[11px] font-bold border border-amber-500/20">#' + esc(t) + '</span>';
            }).join('');

            document.getElementById('modalChallenges').innerHTML = (p.challenges || []).map(function (c) {
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

            var idxIndicator = document.getElementById('modalProjIndexIndicator');
            var currentIndex = list.findIndex(function (item) { return item.id === p.id; });
            if (idxIndicator && currentIndex !== -1) {
                idxIndicator.textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
            }

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 50);
        };

        function navigateModalProject(delta) {
            var list = window.PROJECTS || [];
            if (!list.length) return;
            var idx = list.findIndex(function (item) { return item.id === currentModalProjectId; });
            if (idx === -1) idx = 0;
            var nextIdx = (idx + delta + list.length) % list.length;
            openModal(list[nextIdx].id);
        }

        if (prevProjBtn) {
            prevProjBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                navigateModalProject(-1);
            });
        }

        if (nextProjBtn) {
            nextProjBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                navigateModalProject(1);
            });
        }

        window.closeModal = function () {
            if (!modal) return;
            modal.classList.remove('active');
            document.body.style.overflow = '';
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

        // ESC 关闭所有弹窗 & 左右方向键切换项目
        document.addEventListener('keydown', function (e) {
            if (modal && modal.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    navigateModalProject(-1);
                    return;
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    navigateModalProject(1);
                    return;
                }
            }
            if (e.key !== 'Escape') return;
            if (modal && modal.classList.contains('active')) closeModal();
            if (wechatModal && wechatModal.style.visibility === 'visible') hideWechatQR();
            if (easterEggModal && easterEggModal.style.visibility === 'visible') hideEasterEgg();
            if (adminModal && adminModal.style.visibility === 'visible') hideAdminModal();
            if (resumeModal && resumeModal.classList.contains('opacity-100')) closeResumeModal();
        });

        /* ── 经历标签与项目联动跳转 ── */
        document.querySelectorAll('.timeline-chip[data-link-project]').forEach(function (chip) {
            chip.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var projId = parseInt(this.getAttribute('data-link-project'), 10);
                if (!projId) return;

                var allFilterBtn = document.querySelector('#filterBtns .filter-btn[data-filter="all"]');
                if (allFilterBtn) allFilterBtn.click();

                var targetCard = document.querySelector('.project-card[data-id="' + projId + '"]');
                var projectsSec = document.getElementById('projects');

                if (projectsSec) {
                    window.scrollTo({
                        top: (targetCard ? targetCard.offsetTop : projectsSec.offsetTop) - 100,
                        behavior: 'smooth'
                    });
                }

                if (targetCard) {
                    targetCard.classList.add('highlight-project');
                    showToast('已为您定位到关联项目：' + (targetCard.querySelector('h3') ? targetCard.querySelector('h3').textContent : ''));
                    setTimeout(function () {
                        targetCard.classList.remove('highlight-project');
                    }, 3000);
                }
            });
        });

        /* ── 点击技能标签弹出详尽说明 ── */
        document.querySelectorAll('.skill-tag[title]').forEach(function (tag) {
            tag.addEventListener('click', function () {
                var title = this.getAttribute('title');
                var text = this.innerText ? this.innerText.trim() : this.textContent.trim();
                if (title) {
                    showToast(text + '：' + title, 'fas fa-microchip');
                }
            });
        });

        /* ── 📄 精装 A4 电子简历模态窗交互 ── */
        var resumeModal = document.getElementById('resumeModal');
        var resumeModalContent = document.getElementById('resumeModalContent');
        var closeResumeModalBtn = document.getElementById('closeResumeModal');
        var resumePrintBtn = document.getElementById('resumePrintBtn');
        var resumeCopyTextBtn = document.getElementById('resumeCopyTextBtn');

        window.openResumeModal = function (e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!resumeModal) return;
            resumeModal.classList.remove('opacity-0', 'pointer-events-none');
            resumeModal.classList.add('opacity-100', 'pointer-events-auto');
            if (resumeModalContent) {
                resumeModalContent.classList.remove('scale-95');
                resumeModalContent.classList.add('scale-100');
            }
            document.body.style.overflow = 'hidden';
            showToast('已载入杨杰 A4 精装电子简历', 'fas fa-file-alt');
        };

        window.closeResumeModal = function (e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            if (!resumeModal) return;
            resumeModal.classList.remove('opacity-100', 'pointer-events-auto');
            resumeModal.classList.add('opacity-0', 'pointer-events-none');
            if (resumeModalContent) {
                resumeModalContent.classList.remove('scale-100');
                resumeModalContent.classList.add('scale-95');
            }
            document.body.style.overflow = '';
        };

        if (closeResumeModalBtn) closeResumeModalBtn.addEventListener('click', closeResumeModal);
        if (resumeModal) {
            resumeModal.addEventListener('click', function (e) {
                if (e.target === resumeModal) closeResumeModal(e);
            });
        }

        if (resumePrintBtn) {
            resumePrintBtn.addEventListener('click', function () {
                showToast('正在调起 A4 高保真打印 / 另存为 PDF...', 'fas fa-print');
                setTimeout(function () {
                    window.print();
                }, 300);
            });
        }

        if (resumeCopyTextBtn) {
            resumeCopyTextBtn.addEventListener('click', function () {
                var plainResume = [
                    '【杨杰 - 软硬件全栈研发架构师 / 高级嵌入式工程师 简历】',
                    '工作经验: 13年软硬件研发实战 (1人=5岗全栈闭环) | 状态: 可随时到岗/远程交付',
                    '联系电话/微信: 43823845 | 邮箱: 43823845@qq.com',
                    '常驻坐标: 陕西·西安 / 支持全国到岗或远程高可靠交付',
                    '',
                    '一、核心商业与工程优势',
                    '1. 0→1 全周期全栈闭环: 独立贯通原理图、16层HDI PCB、FPGA/MCU底层固件、端侧TinyML、Qt/小程序/Web上位机及产线ATE治具。',
                    '2. 军工/航电高可靠设计: 严格贯彻 GJB151B/367A 军标，主导中航AVIC机载、航发ECU及115V/28V特种装备，深谙隔离与EMC整改。',
                    '3. 大规模量产与降本经验: 主导 450+ 节点城市充电终端(>5W小时无故障)、地源热泵主控板(客户产线100%导入)，测量精度达 ±0.01。',
                    '',
                    '二、精选王牌项目',
                    '1. 军品绝缘自动测试系统 (12层HDI + FPGA + 上位机 + 军标校准规范全栈包干)',
                    '2. AVIC机载配电系统地面测试设备 (115V多路异步采集 + HDLC协议栈 + 整机交付)',
                    '3. 非标量产型多模态电参采集模组 (动态增益自校准，误差 ≤ ±0.01)',
                    '4. 共享充电主控终端 (运城市规模部署 450+ 节点，稳定运行 >50,000 小时)',
                    '5. 北斗与GPS双模定位管理Web平台 (100+终端实时追踪，延迟 <200ms)',
                    '6. 智能SMT微型焊台及微信小程序控制端 (300℃ PID温控过冲 <±1℃ + BLE实时曲线)'
                ].join('\n');

                copyToClipboard(plainResume, '✓ 已成功复制纯文本简历至剪贴板');
            });
        }

        var navResumeBtn    = document.getElementById('navResumeBtn');
        var heroResumeBtn   = document.getElementById('heroResumeBtn');
        var mobileResumeBtn = document.getElementById('mobileResumeBtn');
        var downloadBtn     = document.getElementById('downloadResumeBtn');
        var footerResumeBtn = document.getElementById('footerResumeBtn');

        if (navResumeBtn) navResumeBtn.addEventListener('click', openResumeModal);
        if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResumeModal);
        if (footerResumeBtn) footerResumeBtn.addEventListener('click', openResumeModal);
        if (mobileResumeBtn) mobileResumeBtn.addEventListener('click', function () {
            closeMobileMenu();
            openResumeModal();
        });
        if (downloadBtn) downloadBtn.addEventListener('click', openResumeModal);

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

        /* ── 管理控制台 Modal 逻辑 (沙箱安全版，无阻塞弹窗) ── */
        var adminModal    = document.getElementById('adminModal');
        var adminContent  = document.getElementById('adminModalContent');
        var closeAdmin    = document.getElementById('closeAdminModal');
        var footerAdminBtn = document.getElementById('footerAdminBtn');

        window.showAdminModal = function () {
            if (!adminModal) return;
            renderAdminProjectList();
            adminModal.style.opacity = '1';
            adminModal.style.visibility = 'visible';
            if (adminContent) adminContent.style.transform = 'scale(1)';
            document.body.style.overflow = 'hidden';
            resetAdminForm();
            showToast('已打开项目可视化管理后台', 'fas fa-terminal');
        };

        window.hideAdminModal = function () {
            if (!adminModal) return;
            adminModal.style.opacity = '0';
            adminModal.style.visibility = 'hidden';
            if (adminContent) adminContent.style.transform = 'scale(0.9)';
            document.body.style.overflow = '';
        };

        if (closeAdmin) closeAdmin.addEventListener('click', hideAdminModal);
        if (footerAdminBtn) footerAdminBtn.addEventListener('click', window.showAdminModal);
        if (adminModal) {
            adminModal.addEventListener('click', function (e) {
                if (e.target === adminModal) hideAdminModal();
            });
        }

        /* ── 微信二维码 ── */
        var wechatModal   = document.getElementById('wechatModal');
        var wechatContent = document.getElementById('wechatModalContent');
        var wechatCard    = document.getElementById('wechatCard');
        var closeWechat   = document.getElementById('closeWechatModal');

        window.showWechatQR = function (e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            copyToClipboard('43823845', '✓ 已复制微信号: 43823845，正在为您打开二维码名片');
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

        /* ── 可视化项目管理台 CRUD 逻辑 ── */
        var adminSaveBtn   = document.getElementById('adminSaveBtn');
        var adminClearBtn  = document.getElementById('adminClearBtn');
        var adminExportBtn = document.getElementById('adminExportBtn');
        var adminResetBtn  = document.getElementById('adminResetBtn');
        var brandLogo      = document.querySelector('#mainNav .nav-scroll');

        if (brandLogo) {
            brandLogo.addEventListener('dblclick', function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.showAdminModal();
            });
        }

        function renderAdminProjectList() {
            var listContainer = document.getElementById('adminProjectList');
            var countLabel = document.getElementById('adminProjCount');
            if (!listContainer) return;
            listContainer.innerHTML = '';
            if (countLabel) countLabel.textContent = projects.length;

            projects.forEach(function (p, index) {
                var item = document.createElement('div');
                item.className = 'admin-proj-item';

                item.innerHTML = [
                    '<div class="flex items-center gap-3 overflow-hidden">',
                    '  <div class="admin-proj-num">' + String(index + 1).padStart(2, '0') + '</div>',
                    '  <div class="overflow-hidden">',
                    '    <p class="text-xs font-bold text-white truncate">' + esc(p.title) + '</p>',
                    '    <p class="text-[10px] text-slate-500 truncate">' + esc(p.cat) + ' · ' + esc(p.role) + '</p>',
                    '  </div>',
                    '</div>',
                    '<div class="flex gap-2 flex-shrink-0">',
                    '  <button type="button" class="admin-proj-btn admin-proj-btn-edit" data-idx="' + index + '" title="编辑">',
                    '    <i class="fas fa-edit text-xs"></i>',
                    '  </button>',
                    '  <button type="button" class="admin-proj-btn admin-proj-btn-del" data-idx="' + index + '" title="删除">',
                    '    <i class="fas fa-trash-alt text-xs"></i>',
                    '  </button>',
                    '</div>'
                ].join('');

                item.querySelector('.admin-proj-btn-edit').addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    editAdminProject(index);
                });
                item.querySelector('.admin-proj-btn-del').addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteAdminProject(index);
                });

                listContainer.appendChild(item);
            });
        }

        function resetAdminForm() {
            var editIdxEl = document.getElementById('editIndex');
            var formEl = document.getElementById('adminForm');
            if (editIdxEl) editIdxEl.value = '-1';
            if (formEl) formEl.reset();
            if (adminSaveBtn) {
                adminSaveBtn.innerHTML = '<i class="fas fa-save mr-1"></i>保存并应用项目';
                adminSaveBtn.className = 'flex-grow py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-600/20 cursor-pointer';
            }
        }

        function editAdminProject(index) {
            var p = projects[index];
            if (!p) return;
            document.getElementById('editIndex').value = String(index);
            document.getElementById('adminTitle').value = p.title;
            document.getElementById('adminRole').value = p.role;
            document.getElementById('adminCat').value = p.cat;
            document.getElementById('adminFilter').value = p.filter;
            document.getElementById('adminType').value = p.type;
            document.getElementById('adminImg').value = p.img;
            document.getElementById('adminTags').value = p.tags ? p.tags.join(', ') : '';
            document.getElementById('adminTech').value = p.tech;
            document.getElementById('adminChallenges').value = p.challenges ? p.challenges.join('\n') : '';
            document.getElementById('adminAchievements').value = p.achievements || '';

            if (adminSaveBtn) {
                adminSaveBtn.innerHTML = '<i class="fas fa-edit mr-1"></i>更新项目内容';
                adminSaveBtn.className = 'flex-grow py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer';
            }
            showToast('已加载项目「' + p.title + '」至左侧编辑器', 'fas fa-edit');
        }

        function deleteAdminProject(index) {
            var removed = projects.splice(index, 1);
            SafeStorage.setItem('yj_custom_projects', JSON.stringify(projects));
            updateFilterCounts();
            renderProjects(currentFilter, currentSearch);
            renderAdminProjectList();
            resetAdminForm();
            if (removed && removed[0]) {
                showToast('已移除项目：' + removed[0].title + '（可点击重置恢复默认）', 'fas fa-trash-alt');
            }
        }

        if (adminClearBtn) {
            adminClearBtn.addEventListener('click', function (e) {
                e.preventDefault();
                resetAdminForm();
                showToast('表单已清空', 'fas fa-eraser');
            });
        }

        if (adminSaveBtn) {
            adminSaveBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var title = document.getElementById('adminTitle').value.trim();
                var role = document.getElementById('adminRole').value.trim();
                var cat = document.getElementById('adminCat').value;
                var filter = document.getElementById('adminFilter').value;
                var type = document.getElementById('adminType').value;
                var img = document.getElementById('adminImg').value.trim();
                var tagsStr = document.getElementById('adminTags').value.trim();
                var tech = document.getElementById('adminTech').value.trim();
                var challengesStr = document.getElementById('adminChallenges').value.trim();
                var achievements = document.getElementById('adminAchievements').value.trim();

                if (!title || !role || !img || !tech || !challengesStr) {
                    showToast('请完整填写必填项（标题、角色、图片、技术细节与挑战）', 'fas fa-exclamation-triangle');
                    return;
                }

                var tags = tagsStr ? tagsStr.split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean) : [];
                var challenges = challengesStr.split('\n').map(function (c) { return c.trim(); }).filter(Boolean);

                var editIndex = parseInt(document.getElementById('editIndex').value, 10);
                if (editIndex === -1) {
                    var nextId = projects.length > 0 ? Math.max.apply(null, projects.map(function (p) { return p.id; })) + 1 : 1;
                    projects.push({
                        id: nextId,
                        title: title,
                        cat: cat,
                        filter: filter,
                        type: type,
                        img: img,
                        tags: tags,
                        role: role,
                        tech: tech,
                        challenges: challenges,
                        achievements: achievements,
                        stackLayers: ['方案设计', '软硬件开发', '系统联调交付']
                    });
                } else {
                    var targetProj = projects[editIndex];
                    targetProj.title = title;
                    targetProj.role = role;
                    targetProj.cat = cat;
                    targetProj.filter = filter;
                    targetProj.type = type;
                    targetProj.img = img;
                    targetProj.tags = tags;
                    targetProj.tech = tech;
                    targetProj.challenges = challenges;
                    targetProj.achievements = achievements;
                }

                SafeStorage.setItem('yj_custom_projects', JSON.stringify(projects));
                updateFilterCounts();
                renderProjects(currentFilter, currentSearch);
                renderAdminProjectList();
                resetAdminForm();
                showToast('✓ 项目已保存并实时更新至作品集！');
            });
        }

        if (adminResetBtn) {
            adminResetBtn.addEventListener('click', function (e) {
                e.preventDefault();
                SafeStorage.removeItem('yj_custom_projects');
                if (window.DEFAULT_PROJECTS) {
                    projects = JSON.parse(JSON.stringify(window.DEFAULT_PROJECTS));
                    window.PROJECTS = projects;
                }
                updateFilterCounts();
                renderProjects('all', '');
                renderAdminProjectList();
                resetAdminForm();
                showToast('✓ 已恢复系统默认 18 个完整工程项目！');
            });
        }

        if (adminExportBtn) {
            adminExportBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var jsContent = [
                    '/**',
                    ' * projects.js — 项目数据源',
                    ' * 由 智能项目管理控制台 自动导出生成',
                    ' */',
                    '',
                    '/* global window */',
                    '(function () {',
                    "    'use strict';",
                    '',
                    '    var PROJECTS = ' + JSON.stringify(projects, null, 4) + ';',
                    '',
                    '    window.PROJECTS = PROJECTS;',
                    '})();',
                    ''
                ].join('\n');

                var blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'projects.js';
                a.click();
                URL.revokeObjectURL(url);
                showToast('✓ 已导出 projects.js 数据文件');
            });
        }

        /* ── 三模合一工程调试与战力雷达面板 ── */
        initSystemDebugger();

    }); // end DOMContentLoaded

    /* ─────────────────────────────────────────
       更新筛选按钮计数徽章
    ───────────────────────────────────────── */
    function updateFilterCounts() {
        var list = window.PROJECTS || [];
        var setCount = function (id, val) {
            var el = document.getElementById(id);
            if (el) el.textContent = String(val);
        };
        setCount('count-all', list.length);
        setCount('count-flagship', list.filter(function (p) { return !!p.flagship; }).length);
        setCount('count-mil', list.filter(function (p) { return p.filter === 'mil'; }).length);
        setCount('count-ind', list.filter(function (p) { return p.filter === 'ind'; }).length);
        setCount('count-iot', list.filter(function (p) { return p.filter === 'iot'; }).length);
        setCount('count-sw', list.filter(function (p) { return p.filter === 'sw' || p.type === 'sw'; }).length);
    }

    /* ─────────────────────────────────────────
       项目卡片渲染（支持分类、王牌过滤与关键词实时搜索）
    ───────────────────────────────────────── */
    function renderProjects(filter, searchQuery) {
        var grid = document.getElementById('projectGrid');
        if (!grid) return;
        var projects = window.PROJECTS || [];
        var q = (searchQuery || '').toLowerCase();

        var filtered = projects.filter(function (p) {
            var matchFilter = true;
            if (filter === 'flagship') {
                matchFilter = !!p.flagship;
            } else if (filter !== 'all') {
                matchFilter = (p.filter === filter || p.type === filter);
            }
            if (!matchFilter) return false;
            if (!q) return true;

            var haystack = [
                p.title, p.cat, p.role, p.tech, p.achievements, p.metric, p.valueImpact,
                (p.tags || []).join(' '),
                (p.stackLayers || []).join(' '),
                (p.challenges || []).join(' ')
            ].join(' ').toLowerCase();

            return haystack.indexOf(q) !== -1;
        });

        grid.innerHTML = '';

        if (filtered.length === 0) {
            grid.innerHTML = [
                '<div class="col-span-full py-14 text-center bg-white/[0.02] rounded-2xl border border-white/5">',
                '  <i class="fas fa-magnifying-glass text-amber-400 text-2xl mb-3"></i>',
                '  <p class="text-white font-bold text-base mb-1">未找到匹配的研发项目</p>',
                '  <p class="text-slate-400 text-xs">请尝试搜索其他关键词（如：FPGA、115V、12层板、PID、蓝牙、AVIC）或切换分类。</p>',
                '</div>'
            ].join('');
            return;
        }

        filtered.forEach(function (p, index) {
            var card = document.createElement('div');
            card.className = 'project-card' + (p.flagship ? ' is-flagship' : '');
            card.style.animationDelay = (index * 0.04) + 's';
            card.setAttribute('data-id', String(p.id));
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', '查看项目：' + p.title);

            card.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openModal(p.id);
            });

            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(p.id);
                }
            });

            var summary = getProjectSummary(p);
            var metric = getProjectMetric(p);
            card.innerHTML = buildCardHTML(p, index, summary, metric);
            grid.appendChild(card);
        });
    }

    function getProjectMetric(project) {
        if (project.metric) return '★ ' + project.metric;
        var text = (project.achievements || '') + ' ' + (project.tech || '');
        if (text.indexOf('450') !== -1) return '★ 部署450+节点';
        if (text.indexOf('GJB151B') !== -1 || text.indexOf('军品') !== -1) return '★ GJB151B军标';
        if (text.indexOf('12层板') !== -1 || text.indexOf('HDI') !== -1) return '★ 12层高密PCB';
        if (text.indexOf('115V') !== -1) return '★ 115V高可靠采集';
        return '★ 全周期交付';
    }

    function buildCardHTML(project, index, summary, metric) {
        var num = String(project.id || (index + 1)).padStart(2, '0');
        var tagsHTML = (project.tags || []).map(function (tag) {
            return '<span class="text-[10px] text-slate-300 bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/10">#' + esc(tag) + '</span>';
        }).join('');

        var layers = project.stackLayers || ['硬件原理/PCB', '嵌入式固件', '系统交付'];
        var layersHTML = layers.map(function (layer) {
            return '<span class="stack-layer-pill">' + esc(layer) + '</span>';
        }).join('');

        var flagshipHTML = project.flagship
            ? '<div class="card-flagship-badge"><i class="fas fa-crown mr-1"></i>王牌代表作</div>'
            : '';

        var catClass = project.flagship ? 'card-cat-badge shifted' : 'card-cat-badge';

        return [
            '<div>',
            '  <div class="h-48 overflow-hidden relative">',
            '    <img src="' + esc(project.img) + '"',
            '         alt="' + esc(project.title) + ' 项目预览图"',
            '         loading="lazy" decoding="async"',
            '         width="400" height="192"',
            '         class="card-img">',
            '    <div class="card-overlay" aria-hidden="true"></div>',
            '    <div class="card-frame" aria-hidden="true"></div>',
                 flagshipHTML,
            '    <div class="' + catClass + '">' + esc(project.cat) + '</div>',
            '    <div class="card-metric-badge">' + esc(metric) + '</div>',
            '    <div class="card-number" aria-hidden="true">' + num + '</div>',
            '    <div class="view-btn absolute bottom-3.5 right-3.5 px-3 py-1.5 bg-amber-600/90 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-lg" aria-hidden="true">',
            '      <i class="fas fa-folder-open mr-1" aria-hidden="true"></i> 查看技术档案',
            '    </div>',
            '  </div>',
            '  <div class="p-5 sm:p-6 pb-3">',
            '    <h3 class="text-white font-bold mb-1 text-base tracking-tight">' + esc(project.title) + '</h3>',
            '    <p class="text-amber-400/90 text-xs font-semibold mb-3">' + esc(project.role) + '</p>',
            '    <div class="stack-layer-strip" title="该项目独立包干的全栈层级">' + layersHTML + '</div>',
            '    <p class="card-summary">' + esc(summary) + '</p>',
            '  </div>',
            '</div>',
            '<div class="px-5 sm:px-6 pb-5 pt-2 border-t border-white/5 flex flex-wrap gap-1.5">' + tagsHTML + '</div>'
        ].join('');
    }

    function getProjectSummary(project) {
        var src = project.valueImpact || project.achievements || project.tech || '';
        return src.length > 74 ? src.slice(0, 74) + '…' : src;
    }

    /* ─────────────────────────────────────────
       统计数字动画
    ───────────────────────────────────────── */
    function animateCounter(el) {
        var target    = parseInt(el.getAttribute('data-count'), 10);
        var duration  = 1800;
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
       Canvas 粒子效果
    ───────────────────────────────────────── */
    function initParticles() {
        var canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        var particles = [];
        var raf;

        function resize() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function createParticle() {
            return {
                x:        Math.random() * canvas.width,
                y:        canvas.height + 10,
                r:        Math.random() * 2 + 0.5,
                speed:    Math.random() * 0.6 + 0.3,
                alpha:    0,
                maxAlpha: Math.random() * 0.45 + 0.2,
                color:    Math.random() > 0.5 ? '232,176,79' : '159,107,59',
                life:     0,
                maxLife:  Math.random() * 300 + 150
            };
        }

        function tick() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (particles.length < 24 && Math.random() < 0.15) {
                particles.push(createParticle());
            }

            particles = particles.filter(function (p) {
                p.life++;
                p.y -= p.speed;

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
        window.addEventListener('resize', throttle(resize, 200));

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
       极客三模系统调试与六维战力分析仪
    ───────────────────────────────────────── */
    function initSystemDebugger() {
        var tabConsoleBtn       = document.getElementById('tabConsoleBtn');
        var tabOscilloscopeBtn  = document.getElementById('tabOscilloscopeBtn');
        var tabRadarBtn         = document.getElementById('tabRadarBtn');
        var debugConsolePanel   = document.getElementById('debugConsolePanel');
        var debugOscPanel       = document.getElementById('debugOscilloscopePanel');
        var debugRadarPanel     = document.getElementById('debugRadarPanel');

        if (!tabConsoleBtn || !tabOscilloscopeBtn || !debugConsolePanel || !debugOscPanel) return;

        var activeTab = 'console'; // 'console' | 'oscilloscope' | 'radar'
        var oscAnimationFrame = null;
        var radarAnimationFrame = null;

        function switchDebuggerTab(targetTab) {
            if (activeTab === targetTab) return;
            activeTab = targetTab;

            tabConsoleBtn.setAttribute('aria-selected', String(activeTab === 'console'));
            tabOscilloscopeBtn.setAttribute('aria-selected', String(activeTab === 'oscilloscope'));
            if (tabRadarBtn) tabRadarBtn.setAttribute('aria-selected', String(activeTab === 'radar'));

            debugConsolePanel.classList.toggle('hidden', activeTab !== 'console');
            debugOscPanel.classList.toggle('hidden', activeTab !== 'oscilloscope');
            if (debugRadarPanel) debugRadarPanel.classList.toggle('hidden', activeTab !== 'radar');

            stopAnim();

            if (activeTab === 'console') {
                var consoleInput = document.getElementById('consoleInput');
                if (consoleInput) consoleInput.focus();
            } else if (activeTab === 'oscilloscope') {
                startOscilloscope();
            } else if (activeTab === 'radar') {
                drawCapabilityRadar();
            }
        }

        tabConsoleBtn.addEventListener('click', function () { switchDebuggerTab('console'); });
        tabOscilloscopeBtn.addEventListener('click', function () { switchDebuggerTab('oscilloscope'); });
        if (tabRadarBtn) {
            tabRadarBtn.addEventListener('click', function () { switchDebuggerTab('radar'); });
        }

        function stopAnim() {
            if (oscAnimationFrame) {
                cancelAnimationFrame(oscAnimationFrame);
                oscAnimationFrame = null;
            }
            if (radarAnimationFrame) {
                cancelAnimationFrame(radarAnimationFrame);
                radarAnimationFrame = null;
            }
        }

        /* ── 1. 终端控制台逻辑 ── */
        var consoleHistory = document.getElementById('consoleHistory');
        var consoleInput   = document.getElementById('consoleInput');

        var initialLogs = [
            '[系统] 杨杰全栈工程诊断与价值分析系统 v2.0 已就绪...',
            '[ 正常 ] 16层 HDI 高密 PCB 与 Sigrity SI/PI 仿真引擎就绪',
            '[ 正常 ] FPGA 高速同步解码 & STM32/RISC-V 实时固件挂载成功',
            '[ 正常 ] 动态增益自校准算法就绪 (综合测量误差 ≤ ±0.01)',
            '[ 正常 ] 国军标 GJB151B 电磁兼容防护与 ATE 治具接口在线',
            '[ 价值 ] 具备「1人=5岗」0→1 全链路交付能力，跨界联调提效 300%',
            '====================================================',
            '输入 "roi" 查看商业赋能价值报告，或点击下方快捷指令胶囊：',
            ''
        ];

        var logIndex = 0;
        function printNextLog() {
            if (logIndex < initialLogs.length) {
                printRow(initialLogs[logIndex]);
                logIndex++;
                setTimeout(printNextLog, Math.random() * 110 + 55);
            } else {
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
            else if (type === 'romance') row.style.color = '#f472b6';
            row.textContent = text;

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

        printNextLog();

        document.querySelectorAll('.terminal-chip').forEach(function (chip) {
            chip.addEventListener('click', function (e) {
                e.preventDefault();
                var cmd = this.getAttribute('data-cmd');
                if (!cmd) return;
                printRow('yj_core:~$ ' + cmd);
                parseCommand(cmd);
            });
        });

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
            var parts = cmd.trim().split(/\s+/);
            var core  = parts[0].toLowerCase();
            var arg1  = parts[1] ? parts[1] : '';

            setTimeout(function () {
                if (core === 'help') {
                    printRow('可用指令菜单:', 'info');
                    printRow('  roi       - 💎 查看杨杰「1人=5岗」全栈商业赋能与降本增效评估');
                    printRow('  radar     - 🎯 切入六维全栈战力雷达图对比视图');
                    printRow('  status    - 查看硬件系统实时健康诊断报告');
                    printRow('  projects  - 查看 18 个全栈研发项目分类汇总');
                    printRow('  love      - 💖 查看硬件工程师的浪漫与心形波');
                    printRow('  blink     - ✨ 体验第一颗点亮的 LED (PWM呼吸灯)');
                    printRow('  cat <file>- 查看文本文件 (如: cat 儿时初心.txt)');
                    printRow('  admin     - 启动可视化项目管理后台');
                    printRow('  clear     - 清空终端屏幕历史记录');
                } else if (core === 'roi' || core === 'value') {
                    printRow('┌────────────── 💎 杨杰全栈研发商业赋能评估 ──────────────┐', 'warn');
                    printRow('│ 1. 岗位整合价值 : 1人贯通[硬件PCB+FPGA+固件+上位机+治具]│', 'success');
                    printRow('│ 2. 联调排障提效 : 消除跨部门甩锅，软硬联调效率 +300%    │', 'success');
                    printRow('│ 3. 软硬协同降本 : 动态校准算法降低器件公差依赖 BOM-20%  │', 'success');
                    printRow('│ 4. 军标量产验证 : GJB151B一次通过 / 450+节点稳定运行>5Wh│', 'success');
                    printRow('└─────────────────────────────────────────────────────────┘', 'warn');
                    if (window.showToast) window.showToast('💎 已生成全栈商业价值评估报告', 'fas fa-gem');
                } else if (core === 'radar') {
                    printRow('>> 正在启动六维全栈能力雷达扫描...', 'info');
                    printRow('高速硬件(96) | 嵌入式固件(95) | 军标EMC(94) | FPGA(90) | 上位机(88) | 量产治具(95)', 'success');
                    setTimeout(function () {
                        switchDebuggerTab('radar');
                    }, 500);
                } else if (core === 'love' || core === 'heart' || core === 'romance') {
                    printRow('>> 正在加载硬件工程师的浪漫协议...', 'romance');
                    printRow('┌────────────────────────────────────────────────────────┐', 'romance');
                    printRow('│  ♥「愿为你写下永不跑飞的看门狗，                         │', 'romance');
                    printRow('│    愿为你匹配最纯净的特征阻抗；                         │', 'romance');
                    printRow('│    在嘈杂的电磁世界里，为你滤尽所有噪声；               │', 'romance');
                    printRow('│    让爱如时钟晶振般坚定，千万年误差不超 1ppm。」        │', 'romance');
                    printRow('└────────────────────────────────────────────────────────┘', 'romance');
                    printRow('>> 已联动示波器切入「💖 工程师之吻」心形脉冲波形', 'success');
                    if (window.showToast) window.showToast('💖 示波器已输出工程师心形波形', 'fas fa-heart');

                    var waveSel = document.getElementById('oscWaveSelect');
                    if (waveSel) waveSel.value = 'heart';
                    setTimeout(function () {
                        switchDebuggerTab('oscilloscope');
                    }, 900);
                } else if (core === 'blink' || core === 'led') {
                    printRow('>> 正在执行 GPIO 初始化与呼吸灯点亮程序...', 'info');
                    printRow('HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET); // LED_ON', 'success');
                    printRow('【从 0 到 1 的第一束光】十三年过去，对硬件最纯粹的热爱从未熄灭。', 'warn');
                    var waveSel2 = document.getElementById('oscWaveSelect');
                    if (waveSel2) waveSel2.value = 'blink';
                    setTimeout(function () {
                        switchDebuggerTab('oscilloscope');
                    }, 900);
                } else if (core === 'cat') {
                    if (arg1 === '儿时初心.txt' || arg1 === '初心') {
                        printRow('【儿时初心与硬件信仰】', 'success');
                        printRow('小时候，我是大人眼里的“破坏大王”，家里的收音机、手电筒都被我拆了个遍。但正是这份最初的好奇心，熔铸成了我 13 年深耕军工、车规、工业高可靠电路的职业信仰。');
                    } else {
                        printRow('用法: cat 儿时初心.txt', 'info');
                    }
                } else if (core === 'clear') {
                    consoleHistory.innerHTML = '';
                    var cursor = document.createElement('span');
                    cursor.className = 'console-cursor';
                    cursor.id = 'consoleCursor';
                    consoleHistory.appendChild(cursor);
                } else if (core === 'status') {
                    printRow('[ 系统实时诊断健康报告 ]', 'info');
                    printRow('处理器温度 : 41.2 °C (STM32H7 / FPGA 协同运行正常)', 'success');
                    printRow('主线电压   : 28.00 V (波纹 < 8mV，SI/PI 仿真裕量充足)', 'success');
                    printRow('采样精度   : ±0.01% (动态增益校准与温漂补偿已激活)', 'success');
                    printRow('边缘端 AI  : TinyML 神经网络端侧推理延迟 < 12ms', 'success');
                } else if (core === 'projects') {
                    printRow('[ 18个实战项目分布 ] 军工/航电(8) | 工业/能源(3) | 物联网(2) | 软件全栈(5)', 'info');
                    printRow('>> 包含 6 个 ★王牌代表作，下滑至「研发项目精选」可按关键词实时检索。', 'success');
                } else if (core === 'admin' || core === 'manage') {
                    printRow('>> 正在启动项目可视化管理控制台...', 'success');
                    setTimeout(function () {
                        if (window.showAdminModal) window.showAdminModal();
                    }, 400);
                } else {
                    printRow('未识别指令: "' + esc(core) + '"。请输入 "help" 或 "roi" 查看核心价值。', 'error');
                }
            }, 80);
        }

        /* ── 2. 示波器 Canvas 逻辑 (含实时遥测读数更新) ── */
        var oscCanvas    = document.getElementById('oscilloscopeCanvas');
        var freqSlider   = document.getElementById('oscFreqSlider');
        var ampSlider    = document.getElementById('oscAmpSlider');
        var waveSelect   = document.getElementById('oscWaveSelect');
        var oscModeLabel = document.getElementById('oscModeLabel');
        var oscVppVal    = document.getElementById('oscVppVal');
        var oscFreqVal   = document.getElementById('oscFreqVal');
        var oscThdVal    = document.getElementById('oscThdVal');
        var oscSnrVal    = document.getElementById('oscSnrVal');

        function updateTelemetry() {
            if (!freqSlider || !ampSlider || !waveSelect) return;
            var f = parseFloat(freqSlider.value);
            var a = parseFloat(ampSlider.value);
            var wt = waveSelect.value;

            if (oscVppVal) oscVppVal.textContent = (a * 1.12).toFixed(1) + ' Vpp';
            if (oscFreqVal) oscFreqVal.textContent = Math.round(f * 115) + ' Hz';
            if (oscThdVal) {
                oscThdVal.textContent = wt === 'filtered' ? '0.12%' : (wt === 'square' ? '1.45%' : '< 0.65%');
            }
            if (oscSnrVal) {
                oscSnrVal.textContent = wt === 'filtered' ? '98.4 dB' : '94.2 dB';
            }
        }

        if (freqSlider) freqSlider.addEventListener('input', updateTelemetry);
        if (ampSlider)  ampSlider.addEventListener('input', updateTelemetry);
        if (waveSelect) waveSelect.addEventListener('change', updateTelemetry);

        function startOscilloscope() {
            if (!oscCanvas) return;
            var ctx = oscCanvas.getContext('2d');

            function resizeCanvas() {
                oscCanvas.width  = oscCanvas.offsetWidth || 420;
                oscCanvas.height = oscCanvas.offsetHeight || 175;
            }
            resizeCanvas();
            updateTelemetry();

            var offset = 0;
            function draw() {
                if (activeTab !== 'oscilloscope') return;

                var w = oscCanvas.width;
                var h = oscCanvas.height;
                var midX = w / 2;
                var midY = h / 2;

                ctx.fillStyle = '#050a12';
                ctx.fillRect(0, 0, w, h);

                ctx.strokeStyle = 'rgba(232, 176, 79, 0.08)';
                ctx.lineWidth = 1;
                var gridSize = 20;

                for (var y = 0; y < h; y += gridSize) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
                }
                for (var x = 0; x < w; x += gridSize) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
                }

                ctx.strokeStyle = 'rgba(232, 176, 79, 0.25)';
                ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(midX, 0); ctx.lineTo(midX, h); ctx.stroke();

                var freq = parseFloat(freqSlider.value) * 0.01;
                var amp = parseFloat(ampSlider.value);
                var waveType = waveSelect.value;

                if (oscModeLabel) {
                    if (waveType === 'heart') oscModeLabel.textContent = 'MODE: XY-HEART (80 BPM PULSE)';
                    else if (waveType === 'ecg') oscModeLabel.textContent = 'MODE: CH1 ECG-VITAL (1.2mV)';
                    else if (waveType === 'blink') oscModeLabel.textContent = 'MODE: PWM-BREATHE (LED_ON)';
                    else if (waveType === 'lissajous') oscModeLabel.textContent = 'MODE: XY-LISSAJOUS 3:2';
                    else oscModeLabel.textContent = 'MODE: CH1 DC-COUPLING';
                }

                if (waveType === 'heart') {
                    var pulse = 1 + Math.sin(offset * 3) * 0.12;
                    var heartScale = (amp / 16) * pulse * 0.72;

                    ctx.strokeStyle = 'rgba(244, 114, 182, 0.95)';
                    ctx.shadowColor = 'rgba(244, 114, 182, 0.8)';
                    ctx.shadowBlur = 12;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();

                    for (var t = 0; t <= Math.PI * 2; t += 0.02) {
                        var hx = 16 * Math.pow(Math.sin(t), 3);
                        var hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                        var screenX = midX + hx * heartScale;
                        var screenY = midY + hy * heartScale;
                        if (t === 0) ctx.moveTo(screenX, screenY);
                        else ctx.lineTo(screenX, screenY);
                    }
                    ctx.closePath();
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(251, 207, 232, 0.9)';
                    ctx.font = 'bold 9px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('♥ HARDWARE ROMANCE', midX, midY + 4);

                } else if (waveType === 'lissajous') {
                    ctx.strokeStyle = 'rgba(129, 140, 248, 0.95)';
                    ctx.shadowColor = 'rgba(129, 140, 248, 0.8)';
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();

                    var delta = offset * 0.8;
                    for (var lt = 0; lt <= Math.PI * 2; lt += 0.02) {
                        var lx = Math.sin(3 * lt + delta) * (amp * 2.1);
                        var ly = Math.sin(2 * lt) * (amp * 1.45);
                        if (lt === 0) ctx.moveTo(midX + lx, midY + ly);
                        else ctx.lineTo(midX + lx, midY + ly);
                    }
                    ctx.closePath();
                    ctx.stroke();

                } else if (waveType === 'ecg') {
                    ctx.strokeStyle = 'rgba(52, 211, 153, 0.95)';
                    ctx.shadowColor = 'rgba(52, 211, 153, 0.8)';
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();

                    for (var ei = 0; ei < w; ei++) {
                        var ePhase = ((ei + offset * 60) % 180) / 180;
                        var eVal = 0;
                        if (ePhase > 0.15 && ePhase < 0.25) {
                            eVal = Math.sin((ePhase - 0.15) / 0.1 * Math.PI) * (amp * 0.25);
                        } else if (ePhase >= 0.32 && ePhase < 0.35) {
                            eVal = -(ePhase - 0.32) / 0.03 * (amp * 0.3);
                        } else if (ePhase >= 0.35 && ePhase < 0.40) {
                            eVal = (1 - Math.abs((ePhase - 0.375) / 0.025)) * (amp * 1.55);
                        } else if (ePhase >= 0.40 && ePhase < 0.43) {
                            eVal = -((0.43 - ePhase) / 0.03) * (amp * 0.4);
                        } else if (ePhase > 0.55 && ePhase < 0.72) {
                            eVal = Math.sin((ePhase - 0.55) / 0.17 * Math.PI) * (amp * 0.45);
                        }
                        eVal = -eVal + (Math.random() - 0.5) * 1.2;
                        if (ei === 0) ctx.moveTo(ei, midY + eVal);
                        else ctx.lineTo(ei, midY + eVal);
                    }
                    ctx.stroke();

                } else if (waveType === 'blink') {
                    var breatheVal = (Math.exp(Math.sin(offset * 1.5)) - 0.36787944) * 0.425;
                    var pwmDuty = breatheVal;

                    ctx.strokeStyle = 'rgba(251, 191, 36, 0.95)';
                    ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 2.2;
                    ctx.beginPath();

                    for (var bi = 0; bi < w; bi++) {
                        var bPhase = (bi * freq * 3 + offset) % 1;
                        var bVal = (bPhase < pwmDuty ? amp : -amp) + (Math.random() - 0.5) * 1.5;
                        if (bi === 0) ctx.moveTo(bi, midY + bVal);
                        else ctx.lineTo(bi, midY + bVal);
                    }
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(251, 191, 36, ' + Math.max(0.1, breatheVal) + ')';
                    ctx.shadowColor = 'rgba(251, 191, 36, 1)';
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(w - 25, 25, 6, 0, Math.PI * 2);
                    ctx.fill();

                } else {
                    if (waveType === 'filtered') {
                        ctx.strokeStyle = 'rgba(248, 113, 113, 0.42)';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        for (var fi = 0; fi < w; fi++) {
                            var fAngle = fi * freq + offset;
                            var fNoise = (Math.random() - 0.5) * (amp * 0.7);
                            var fYVal = Math.sin(fAngle) * amp + fNoise;
                            if (fi === 0) ctx.moveTo(fi, midY + fYVal);
                            else ctx.lineTo(fi, midY + fYVal);
                        }
                        ctx.stroke();
                    }

                    ctx.strokeStyle = 'rgba(232, 176, 79, 0.95)';
                    ctx.shadowColor = 'rgba(232, 176, 79, 0.8)';
                    ctx.shadowBlur = 10;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();

                    for (var i = 0; i < w; i++) {
                        var angle = i * freq + offset;
                        var yVal = 0;
                        var noise = (Math.random() - 0.5) * 1.5;

                        if (waveType === 'sine') {
                            yVal = Math.sin(angle) * amp + noise;
                        } else if (waveType === 'square') {
                            var base = Math.sin(angle) >= 0 ? amp : -amp;
                            var transitionPhase = Math.abs(Math.sin(angle));
                            if (transitionPhase < 0.15) {
                                base += Math.sin(angle * 12) * (amp * 0.15) * (1 - transitionPhase / 0.15);
                            }
                            yVal = base + noise;
                        } else if (waveType === 'filtered') {
                            yVal = Math.sin(angle) * amp;
                        }

                        if (i === 0) ctx.moveTo(i, midY + yVal);
                        else ctx.lineTo(i, midY + yVal);
                    }
                    ctx.stroke();
                }

                ctx.shadowBlur = 0;
                offset += 0.08;
                oscAnimationFrame = requestAnimationFrame(draw);
            }

            window.addEventListener('resize', throttle(function () {
                if (activeTab === 'oscilloscope') resizeCanvas();
            }, 250));

            if (oscAnimationFrame) cancelAnimationFrame(oscAnimationFrame);
            draw();
        }

        /* ── 3. 六维全栈战力雷达 Canvas 逻辑 ── */
        var radarCanvas = document.getElementById('radarCanvas');

        function drawCapabilityRadar() {
            if (!radarCanvas) return;
            var ctx = radarCanvas.getContext('2d');
            var dpr = window.devicePixelRatio || 1;
            var cssW = radarCanvas.offsetWidth || 420;
            var cssH = radarCanvas.offsetHeight || 230;
            radarCanvas.width = cssW * dpr;
            radarCanvas.height = cssH * dpr;
            ctx.scale(dpr, dpr);

            var labels = [
                '高速硬件/16层PCB (96%)',
                '嵌入式固件/RTOS (95%)',
                '军标EMC/SI仿真 (94%)',
                'ATE治具/量产交付 (95%)',
                '上位机/Web/小程序 (88%)',
                'FPGA/精密信号调理 (92%)'
            ];
            var yjScores   = [0.96, 0.95, 0.94, 0.95, 0.88, 0.92];
            var baseScores = [0.72, 0.45, 0.52, 0.48, 0.30, 0.42];

            var cx = cssW / 2;
            var cy = cssH / 2 + 4;
            var radius = Math.min(cssW, cssH) * 0.35;
            var progress = 0;

            function renderFrame() {
                if (activeTab !== 'radar') return;
                progress = Math.min(progress + 0.05, 1);
                var eased = 1 - Math.pow(1 - progress, 3);

                ctx.clearRect(0, 0, cssW, cssH);

                // 绘制 4 层六边形网格
                for (var level = 1; level <= 4; level++) {
                    var r = (radius / 4) * level;
                    ctx.beginPath();
                    for (var i = 0; i < 6; i++) {
                        var angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                        var x = cx + Math.cos(angle) * r;
                        var y = cy + Math.sin(angle) * r;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.strokeStyle = 'rgba(242, 214, 162, 0.12)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // 绘制轴线与标签
                ctx.font = '600 10px Inter, "Noto Sans SC", sans-serif';
                for (var j = 0; j < 6; j++) {
                    var a2 = (Math.PI * 2 / 6) * j - Math.PI / 2;
                    var ax = cx + Math.cos(a2) * radius;
                    var ay = cy + Math.sin(a2) * radius;

                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(ax, ay);
                    ctx.strokeStyle = 'rgba(242, 214, 162, 0.14)';
                    ctx.stroke();

                    var lx = cx + Math.cos(a2) * (radius + 18);
                    var ly = cy + Math.sin(a2) * (radius + 14);
                    ctx.fillStyle = '#e6d8c6';
                    if (Math.abs(Math.cos(a2)) < 0.15) {
                        ctx.textAlign = 'center';
                    } else if (Math.cos(a2) > 0) {
                        ctx.textAlign = 'left';
                    } else {
                        ctx.textAlign = 'right';
                    }
                    ctx.fillText(labels[j], lx, ly + 3);
                }

                // 绘制传统单岗基准多边形
                ctx.beginPath();
                for (var b = 0; b < 6; b++) {
                    var ab = (Math.PI * 2 / 6) * b - Math.PI / 2;
                    var rb = radius * baseScores[b] * eased;
                    var bx = cx + Math.cos(ab) * rb;
                    var by = cy + Math.sin(ab) * rb;
                    if (b === 0) ctx.moveTo(bx, by);
                    else ctx.lineTo(bx, by);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(148, 163, 184, 0.14)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // 绘制杨杰全栈战力多边形
                ctx.beginPath();
                for (var k = 0; k < 6; k++) {
                    var ak = (Math.PI * 2 / 6) * k - Math.PI / 2;
                    var rk = radius * yjScores[k] * eased;
                    var kx = cx + Math.cos(ak) * rk;
                    var ky = cy + Math.sin(ak) * rk;
                    if (k === 0) ctx.moveTo(kx, ky);
                    else ctx.lineTo(kx, ky);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(232, 176, 79, 0.28)';
                ctx.fill();
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2.2;
                ctx.stroke();

                // 绘制发光顶点
                for (var m = 0; m < 6; m++) {
                    var am = (Math.PI * 2 / 6) * m - Math.PI / 2;
                    var rm = radius * yjScores[m] * eased;
                    var mx = cx + Math.cos(am) * rm;
                    var my = cy + Math.sin(am) * rm;
                    ctx.beginPath();
                    ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
                    ctx.fillStyle = '#fde68a';
                    ctx.fill();
                }

                if (progress < 1) {
                    radarAnimationFrame = requestAnimationFrame(renderFrame);
                }
            }

            renderFrame();
        }
    }

})();
