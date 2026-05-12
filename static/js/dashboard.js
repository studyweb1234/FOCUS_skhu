// Dashboard JavaScript - FOCUS Study Platform (한글화 완벽 복구 버전)

var dashboardChartData = {
    weeklyLabels: [],
    weeklyData: [],
    monthlyLabels: [],
    monthlyData: []
};

var activityChart = null;
var currentChartMode = 'weekly';

// 영문 요일/월을 한글로 바꾸기 위한 매핑 객체
const KOREAN_MAP = {
    'Mon': '월', 'Tue': '화', 'Wed': '수', 'Thu': '목', 'Fri': '금', 'Sat': '토', 'Sun': '일',
    'Jan': '1월', 'Feb': '2월', 'Mar': '3월', 'Apr': '4월', 'May': '5월', 'Jun': '6월',
    'Jul': '7월', 'Aug': '8월', 'Sep': '9월', 'Oct': '10월', 'Nov': '11월', 'Dec': '12월'
};

function createActivityChart(type) {
    if (typeof Chart === 'undefined') return;
    var chartElement = document.getElementById('activityChart');
    if (!chartElement) return;

    if (activityChart) {
        activityChart.destroy();
    }

    var ctx = chartElement.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');

    // 서버에서 온 영문 레이블을 한글로 변환
    var labels = (type === 'weekly' ? dashboardChartData.weeklyLabels : dashboardChartData.monthlyLabels)
                 .map(l => KOREAN_MAP[l] || l);
    var data = type === 'weekly' ? dashboardChartData.weeklyData : dashboardChartData.monthlyData;

    // 데이터가 없는 경우의 기본 레이블
    if (labels.length === 0) {
        labels = type === 'weekly' ?
            ['월', '화', '수', '목', '금', '토', '일'] : ['1월', '2월', '3월', '4월', '5월', '6월'];
        data = labels.map(() => 0);
    }

    currentChartMode = type;

    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '학습 시간(분)',
                data: data,
                backgroundColor: gradient,
                borderColor: '#4f46e5',
                borderWidth: 2,
                pointBackgroundColor: '#4f46e5',
                pointRadius: type === 'weekly' ? 4 : 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var mins = context.raw;
                            if (mins >= 60) {
                                var h = Math.floor(mins / 60);
                                var m = mins % 60;
                                return m > 0 ? h + '시간 ' + m + '분' : h + '시간';
                            }
                            return mins + '분';
                        }
                    }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                },
                x: { 
                    grid: { display: false },
                    ticks: {
                        maxTicksLimit: type === 'weekly' ? 7 : 10,
                        autoSkip: true,
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

window.toggleChart = function(type) {
    var btnWeekly = document.getElementById('btnWeekly');
    var btnMonthly = document.getElementById('btnMonthly');
    var title = document.getElementById('chartTitle');

    if (type === 'weekly') {
        if (btnWeekly) btnWeekly.classList.add('active');
        if (btnMonthly) btnMonthly.classList.remove('active');
        if (title) title.innerHTML = '<i class="mdi mdi-chart-line" style="margin-right: 8px;"></i> 주간 활동 기록';
    } else {
        if (btnWeekly) btnWeekly.classList.remove('active');
        if (btnMonthly) btnMonthly.classList.add('active');
        if (title) title.innerHTML = '<i class="mdi mdi-calendar-month" style="margin-right: 8px;"></i> 월간 활동 기록';
    }

    createActivityChart(type);
};

window.updateActivityChart = function(newWeeklyLabels, newWeeklyData, newMonthlyLabels, newMonthlyData) {
    dashboardChartData.weeklyLabels = newWeeklyLabels || [];
    dashboardChartData.weeklyData = newWeeklyData || [];
    dashboardChartData.monthlyLabels = newMonthlyLabels || [];
    dashboardChartData.monthlyData = newMonthlyData || [];
    createActivityChart(currentChartMode);
};

function initDashboard(config) {
    dashboardChartData.weeklyLabels = config.weeklyLabels || [];
    dashboardChartData.weeklyData = config.weeklyData || [];
    dashboardChartData.monthlyLabels = config.monthlyLabels || [];
    dashboardChartData.monthlyData = config.monthlyData || [];
    
    var subjectLabels = config.subjectLabels || [];
    var subjectData = config.subjectData || [];
    var calendarAssignments = config.calendarAssignments || [];
    var hasSubjectBreakdown = config.hasSubjectBreakdown || false;

    var chartJsAvailable = typeof Chart !== 'undefined';
    
    if (chartJsAvailable) {
        createActivityChart('weekly');
    }

    if (hasSubjectBreakdown && chartJsAvailable) {
        var pieCtx = document.getElementById('subjectPieChart');
        if (pieCtx) {
            var pieColors = [
                '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
                '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
            ];
            pieColors.forEach(function(color, i) {
                var style = document.createElement('style');
                style.innerHTML = '.pie-color-' + i + ' { background: ' + color + ' !important; }';
                document.head.appendChild(style);
            });
            
            var safeSubLabels = Array.isArray(subjectLabels) ? subjectLabels : [];
            var safeSubData = Array.isArray(subjectData) ? subjectData : [];
            
            new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: safeSubLabels,
                    datasets: [{
                        data: safeSubData,
                        backgroundColor: pieColors.slice(0, safeSubData.length),
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '60%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    var mins = context.raw;
                                    var hours = Math.floor(mins / 60);
                                    var m = mins % 60;
                                    return hours > 0 ? hours + '시간 ' + m + '분' : m + '분';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    var currentCalDate = new Date();
    var selectedDate = new Date();

    function renderCalendar() {
        var year = currentCalDate.getFullYear();
        var month = currentCalDate.getMonth();
        var monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
        var monthEl = document.getElementById('calendarMonthYear');
        if (monthEl) monthEl.textContent = year + '년 ' + monthNames[month];

        var grid = document.getElementById('calendarGrid');
        if (!grid) return;
        grid.innerHTML = '';

        var firstDay = new Date(year, month, 1).getDay();
        var adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        var daysInMonth = new Date(year, month + 1, 0).getDate();

        for (var i = 0; i < adjustedFirstDay; i++) {
            var emptyDiv = document.createElement('div');
            emptyDiv.className = 'calendar-day empty';
            grid.appendChild(emptyDiv);
        }

        var today = new Date();
        var safeAssignments = Array.isArray(calendarAssignments) ? calendarAssignments : [];

        for (var day = 1; day <= daysInMonth; day++) {
            var div = document.createElement('div');
            div.className = 'calendar-day';
            div.textContent = day;

            var hasEvent = safeAssignments.some(function(t) {
                if (!t.deadline) return false;
                var d = new Date(t.deadline);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
            });
            if (hasEvent) div.classList.add('has-event');

            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate())
                div.classList.add('current-day');
                
            if (year === selectedDate.getFullYear() && month === selectedDate.getMonth() && day === selectedDate.getDate())
                div.classList.add('active');

            (function(d) {
                div.onclick = function() {
                    selectedDate = new Date(year, month, d);
                    renderCalendar();
                    renderSchedule();
                };
            })(day);

            grid.appendChild(div);
        }
    }

    // ==============================================================
    // [핵심 문제 해결] 삭제되었던 달력 월 이동 함수 복구 완료!
    // ==============================================================
    window.changeMonth = function(delta) {
        currentCalDate.setMonth(currentCalDate.getMonth() + delta);
        renderCalendar();
    };

    function renderSchedule() {
        var selectedDateList = document.getElementById('selectedDateList');
        var upcomingList = document.getElementById('upcomingList');
        var selectedDateCount = document.getElementById('selectedDateCount');
        var upcomingCount = document.getElementById('upcomingCount');
        var selectedDateLabel = document.getElementById('selectedDateLabel');

        if (!selectedDateList || !upcomingList) return;

        selectedDateList.innerHTML = '';
        upcomingList.innerHTML = '';

        var now = new Date();
        var todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var selDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        if (selectedDateLabel) {
            if (selDate.getTime() === todayDate.getTime()) {
                selectedDateLabel.textContent = '오늘의 할 일';
            } else {
                selectedDateLabel.textContent = selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
            }
        }

        var safeAssignments = Array.isArray(calendarAssignments) ? calendarAssignments : [];
        var selectedDateTasks = [];
        var upcomingTasks = [];

        safeAssignments.forEach(function(task) {
            if (!task.deadline) return;
            var deadline = new Date(task.deadline);
            var deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

            if (deadlineDate.getTime() === selDate.getTime()) {
                selectedDateTasks.push(task);
            } else {
                upcomingTasks.push(task);
            }
        });

        selectedDateTasks.sort(function(a, b) { return new Date(a.deadline) - new Date(b.deadline); });
        upcomingTasks.sort(function(a, b) { return new Date(a.deadline) - new Date(b.deadline); });

        if (selectedDateCount) selectedDateCount.textContent = selectedDateTasks.length > 0 ? selectedDateTasks.length + '개' : '';
        if (upcomingCount) upcomingCount.textContent = upcomingTasks.length > 0 ? upcomingTasks.length + '개' : '';

        var renderList = function(tasks, container, emptyMsg) {
            if (tasks.length === 0) {
                container.innerHTML = '<div class="text-tertiary" style="text-align: center; padding: 20px; font-size: 0.85rem;">' + emptyMsg + '</div>';
            } else {
                tasks.forEach(function(task) { renderTaskItem(task, container); });
            }
        };

        renderList(selectedDateTasks, selectedDateList, '<i class="mdi mdi-calendar-blank-outline" style="opacity: 0.5;"></i> 이 날짜에 예정된 할 일이 없습니다');
        renderList(upcomingTasks, upcomingList, '남은 과제가 없습니다');
    }

    function renderTaskItem(task, container) {
        if (!task.deadline) return;
        var item = document.createElement('div');
        item.className = 'schedule-item';

        var deadline = new Date(task.deadline);
        var now = new Date();
        var msLeft = deadline - now;
        var hoursLeft = msLeft / (1000 * 60 * 60);
        var daysLeft = hoursLeft / 24;

        var ringColor = '#4f46e5';
        if (hoursLeft <= 0) ringColor = '#dc2626';
        else if (hoursLeft <= 6) ringColor = '#ef4444';
        else if (hoursLeft <= 24) ringColor = '#f59e0b';
        else if (hoursLeft <= 72) ringColor = '#4f46e5';
        else ringColor = '#10b981';

        var maxHours = 168;
        var percent = Math.max(0, Math.min(100, (hoursLeft / maxHours) * 100));
        if (hoursLeft <= 0) percent = 0;
        var circumference = 100;
        var offset = circumference - (percent / 100 * circumference);

        var timeText = '';
        if (hoursLeft <= 0) {
            var ho = Math.abs(hoursLeft);
            timeText = ho < 24 ? Math.floor(ho) + '시간 지남' : Math.floor(ho / 24) + '일 지남';
        } else if (hoursLeft < 1) {
            timeText = Math.floor(hoursLeft * 60) + '분 남음';
        } else {
            timeText = hoursLeft < 24 ? Math.floor(hoursLeft) + '시간 남음' : Math.floor(daysLeft) + '일 남음';
        }

        var titleText = task.subject && task.subject !== 'General' ? task.subject + ': ' + task.title : task.title;

        item.innerHTML =
            '<div class="ring-container">' +
            '  <svg class="ring-svg">' +
            '    <circle class="ring-circle-bg" cx="18" cy="18" r="16"></circle>' +
            '    <circle class="ring-circle-progress" cx="18" cy="18" r="16" stroke="' + ringColor + '" stroke-dashoffset="' + offset + '"></circle>' +
            '  </svg>' +
            '  <div class="ring-dot" style="background: ' + ringColor + ';"></div>' +
            '</div>' +
            '<div class="schedule-info">' +
            '  <div class="schedule-title">' + titleText + '</div>' +
            '  <div class="schedule-meta" style="color: ' + ringColor + '">' + timeText + '</div>' +
            '</div>';
        container.appendChild(item);
    }

    renderCalendar();
    renderSchedule();
}

window.initDashboard = initDashboard;

// ==============================================================
// 삭제되었던 데이터 자동 동기화(AJAX) 및 순위표 함수 복구
// ==============================================================
var MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];
function renderLeaderboardList(containerId, items, valueSuffix) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="text-tertiary" style="font-size: 0.85rem;">아직 기록이 없습니다.</div>';
        return;
    }
    
    container.innerHTML = items.map(function(item, idx) {
        var medal = idx < 3 ? ' ' + MEDAL_EMOJIS[idx] : '';
        var val = valueSuffix === 'fire'
            ? item.value + '일 <i class="mdi mdi-fire" style="font-size: 0.8rem;"></i>'
            : (item.value || '');
            
        return '<div class="leaderboard-item">' +
            '<div style="display: flex; align-items: center;">' +
            '<div class="rank-badge rank-' + (idx + 1) + '">' + (idx + 1) + '</div>' +
            '<div class="user-info">' + item.username + medal + '</div>' +
            '</div>' +
            '<div class="user-stat">' + val + '</div>' +
            '</div>';
    }).join('');
}

window.refreshDashboardStats = function() {
    fetch('/api/dashboard/stats/')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            if (data.success) {
                var todayStatValue = document.getElementById('todayStatValue');
                var monthlyStatValue = document.getElementById('monthlyStatValue');
                var streakStatValue = document.getElementById('streakStatValue');
                var pendingStatValue = document.getElementById('pendingStatValue');

                if (todayStatValue) todayStatValue.textContent = data.today_total;
                if (monthlyStatValue) monthlyStatValue.textContent = data.monthly_total_hours;
                if (streakStatValue) streakStatValue.textContent = data.streak;
                if (pendingStatValue) pendingStatValue.textContent = data.pending_count;

                if (typeof window.updateActivityChart === 'function') {
                    window.updateActivityChart(
                        data.chart_labels,
                        data.chart_data,
                        data.chart_labels_monthly,
                        data.chart_data_monthly
                    );
                }

                if (data.top_streaks) {
                    renderLeaderboardList('streakBoard', data.top_streaks, 'fire');
                }
                if (data.top_study_time) {
                    renderLeaderboardList('timeBoard', data.top_study_time, '');
                }

                if (data.all_streaks) window.allStreaksData = data.all_streaks;
                if (data.all_study_time) window.allStudyTimeData = data.all_study_time;

                localStorage.removeItem('dashboardNeedsRefresh');
            }
        })
        .catch(function(error) {
            console.error('대시보드 통계 새로고침 오류:', error);
        });
};

var lastViewedDate = new Date().toDateString();
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && document.getElementById('statsGrid')) {
        var currentDate = new Date().toDateString();
        if (currentDate !== lastViewedDate) {
            lastViewedDate = currentDate;
        }
        window.refreshDashboardStats();
    }
});

window.addEventListener('focus', function() {
    if (document.getElementById('statsGrid')) {
        var currentDate = new Date().toDateString();
        if (currentDate !== lastViewedDate) {
            lastViewedDate = currentDate;
        }
        window.refreshDashboardStats();
    }
});

window.addEventListener('storage', function(e) {
    if (e.key === 'dashboardNeedsRefresh' && e.newValue && document.getElementById('statsGrid')) {
        window.refreshDashboardStats();
    }
});

(function() {
    var flag = localStorage.getItem('dashboardNeedsRefresh');
    if (flag && document.getElementById('statsGrid')) {
        window.refreshDashboardStats();
    }
})();