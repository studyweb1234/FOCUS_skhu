// Dashboard JavaScript - FOCUS Study Platform (한글화 버전)
var dashboardChartData = { weeklyLabels: [], weeklyData: [], monthlyLabels: [], monthlyData: [] };
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
    if (!chartElement || activityChart) { if(activityChart) activityChart.destroy(); }

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
        labels = type === 'weekly' ? ['월', '화', '수', '목', '금', '토', '일'] : ['1월', '2월', '3월', '4월', '5월', '6월'];
        data = labels.map(() => 0);
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
                pointBackgroundColor: '#4f46e5',
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

    var currentCalDate = new Date();
    var selectedDate = new Date();
    var monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

    function renderCalendar() {
        var year = currentCalDate.getFullYear();
        var month = currentCalDate.getMonth();
        var monthEl = document.getElementById('calendarMonthYear');
        if (monthEl) monthEl.textContent = year + '년 ' + monthNames[month];
        
        var grid = document.getElementById('calendarGrid');
        if (!grid) return;
        grid.innerHTML = '';
        var firstDay = new Date(year, month, 1).getDay();
        var adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        var daysInMonth = new Date(year, month + 1, 0).getDate();

        for (var i = 0; i < adjustedFirstDay; i++) {
            var empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            grid.appendChild(empty);
        }

        for (var day = 1; day <= daysInMonth; day++) {
            var div = document.createElement('div');
            div.className = 'calendar-day';
            div.textContent = day;
            if (year === new Date().getFullYear() && month === new Date().getMonth() && day === new Date().getDate()) div.classList.add('current-day');
            (function(d) { div.onclick = function() { selectedDate = new Date(year, month, d); renderCalendar(); renderSchedule(); }; })(day);
            grid.appendChild(div);
        }
    }

    function renderSchedule() {
        var selectedDateLabel = document.getElementById('selectedDateLabel');
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
        
        // 필터링 로직 생략 (기존 유지)
        renderList(selectedTasks, document.getElementById('selectedDateList'), '이 날짜에 예정된 할 일이 없습니다.');
        renderList(upcomingTasks, document.getElementById('upcomingList'), '남은 과제가 없습니다.');
    }

    function renderTaskItem(task, container) {
        var deadline = new Date(task.deadline);
        var hoursLeft = (deadline - new Date()) / (1000 * 60 * 60);
        var timeText = '';
        if (hoursLeft <= 0) {
            var ho = Math.abs(hoursLeft);
            timeText = ho < 24 ? Math.floor(ho) + '시간 지남' : Math.floor(ho / 24) + '일 지남';
        } else if (hoursLeft < 1) {
            timeText = Math.floor(hoursLeft * 60) + '분';
        } else {
            timeText = hoursLeft < 24 ? Math.floor(hoursLeft) + '시간' : Math.floor(hoursLeft / 24) + '일';
        }
        
        // HTML 삽입 시 "remaining"을 "남음"으로 변경
        // ... (생략)
    }

    renderCalendar();
    renderSchedule();
}

window.initDashboard = initDashboard;