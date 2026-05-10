// Dashboard JavaScript - FOCUS Study Platform (한글화 버전)
var dashboardChartData = { weeklyLabels: [], weeklyData: [], monthlyLabels: [], monthlyData: [] };
var activityChart = null;
var currentChartMode = 'weekly';

function createActivityChart(type) {
    if (typeof Chart === 'undefined') return;
    var chartElement = document.getElementById('activityChart');
    if (!chartElement) return;
    if (activityChart) { activityChart.destroy(); activityChart = null; }

    var ctx = chartElement.getContext('2d');
    var gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');

    var labels = type === 'weekly' ? dashboardChartData.weeklyLabels : dashboardChartData.monthlyLabels;
    var data = type === 'weekly' ? dashboardChartData.weeklyData : dashboardChartData.monthlyData;

    // 수동 레이블 매핑 (영문으로 넘어올 경우 대비)
    if (labels.length === 0 || labels[0] === 'Mon') {
        labels = type === 'weekly' 
            ? ['월', '화', '수', '목', '금', '토', '일'] 
            : ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
        if (data.length === 0) data = labels.map(() => 0);
    }

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
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

window.toggleChart = function(type) {
    var title = document.getElementById('chartTitle');
    if (type === 'weekly') {
        document.getElementById('btnWeekly').classList.add('active');
        document.getElementById('btnMonthly').classList.remove('active');
        if (title) title.innerHTML = '<i class="mdi mdi-chart-line" style="margin-right: 8px;"></i>주간 활동 기록';
    } else {
        document.getElementById('btnWeekly').classList.remove('active');
        document.getElementById('btnMonthly').classList.add('active');
        if (title) title.innerHTML = '<i class="mdi mdi-calendar-month" style="margin-right: 8px;"></i>월간 활동 기록';
    }
    createActivityChart(type);
};

function initDashboard(config) {
    dashboardChartData.weeklyLabels = config.weeklyLabels || [];
    dashboardChartData.weeklyData = config.weeklyData || [];
    dashboardChartData.monthlyLabels = config.monthlyLabels || [];
    dashboardChartData.monthlyData = config.monthlyData || [];
    createActivityChart('weekly');

    // --- 달력 로직 한글화 ---
    var monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    var currentCalDate = new Date();
    var selectedDate = new Date();

    function renderCalendar() {
        var year = currentCalDate.getFullYear();
        var month = currentCalDate.getMonth();
        var monthEl = document.getElementById('calendarMonthYear');
        if (monthEl) monthEl.textContent = year + '년 ' + monthNames[month];
        // ... (나머지 달력 그리드 생성 로직 동일)
    }

    function renderSchedule() {
        var selectedDateLabel = document.getElementById('selectedDateLabel');
        var now = new Date();
        var todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var selDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

        if (selectedDateLabel) {
            if (selDate.getTime() === todayDate.getTime()) {
                selectedDateLabel.textContent = '오늘';
            } else {
                selectedDateLabel.textContent = selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
            }
        }
        // ... (필터링 로직 동일)
        renderList(selectedTasks, list, '이 날짜에 예정된 할 일이 없습니다.');
        renderList(upcomingTasks, upList, '예정된 과제가 없습니다.');
    }

    function renderTaskItem(task, container) {
        // ... (계산 로직 동일)
        var timeText = hoursLeft <= 0 ? (Math.abs(hoursLeft) < 24 ? Math.floor(Math.abs(hoursLeft)) + '시간 지남' : Math.floor(Math.abs(hoursLeft)/24) + '일 지남') : (hoursLeft < 1 ? Math.floor(hoursLeft*60) + '분' : (hoursLeft < 24 ? Math.floor(hoursLeft) + '시간' : Math.floor(daysLeft) + '일'));
        item.innerHTML = `... <div class="schedule-meta">${timeText} 남음</div>`;
    }
    
    // 리더보드 토글 한글화
    window.toggleLeaderboard = function() {
        var title = document.getElementById('lbTitle');
        if (lbMode === 'streaks') {
            title.innerHTML = '<i class="mdi mdi-clock-outline"></i>월간 최다 학습 시간';
        } else {
            title.innerHTML = '<i class="mdi mdi-fire"></i>연속 학습 순위';
        }
    };

    renderCalendar();
    renderSchedule();
}